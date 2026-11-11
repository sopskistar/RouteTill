import {PGlite} from '@electric-sql/pglite';
import {Pool} from 'pg';
import {readFileSync,mkdirSync,writeFileSync,unlinkSync,existsSync} from 'node:fs';
import {join} from 'node:path';
import {Mode} from '../core/types';
export interface Sql {query<T=any>(text:string,values?:unknown[]):Promise<{rows:T[];rowCount?:number|null}>}
export interface Database extends Sql {transaction<T>(fn:(sql:Sql)=>Promise<T>):Promise<T>;close():Promise<void>;backend:string}
export function assertIsolatedStores(live?:string,demo?:string){
 if(!live||!demo)return;
 const identity=(raw:string)=>{const u=new URL(raw);return u.hostname.replace(/-pooler(?=\.)/,'').toLowerCase()+':'+(u.port||'5432')+u.pathname;};
 if(identity(live)===identity(demo))throw new Error('Demo and live must use separate PostgreSQL databases; credentials or pooler parameters do not create isolation.');
}
const schema=()=>readFileSync(join(process.cwd(),'migrations/001_init.sql'),'utf8');
export async function createDatabase(pathOrUrl:string):Promise<Database>{
 if(/^postgres(ql)?:/.test(pathOrUrl)){
  const pool=new Pool({connectionString:pathOrUrl,max:4,connectionTimeoutMillis:10000,idleTimeoutMillis:15000});
  return {backend:'PostgreSQL',query:(q,v)=>pool.query(q,v) as any,transaction:async fn=>{const c=await pool.connect();try{await c.query('BEGIN');const r=await fn({query:(q,v)=>c.query(q,v) as any});await c.query('COMMIT');return r;}catch(e){await c.query('ROLLBACK');throw e;}finally{c.release();}},close:()=>pool.end()};
 }
 const lock=pathOrUrl+'.process-lock';
 if(existsSync(lock)){
  const owner=Number(readFileSync(lock,'utf8'));let running=true;
  try{process.kill(owner,0);}catch(e){if((e as NodeJS.ErrnoException).code==='ESRCH')running=false;}
  if(running)throw new Error('Local PostgreSQL is already open in another process. Stop the app before running seed/migration scripts. Hosted concurrency requires Neon PostgreSQL.');
  unlinkSync(lock);
 }
 writeFileSync(lock,String(process.pid),{flag:'wx',mode:0o600});
 const release=()=>{try{if(readFileSync(lock,'utf8')===String(process.pid))unlinkSync(lock);}catch{}};
 process.once('exit',release);
 try{
  const pg=new PGlite(pathOrUrl);await pg.waitReady;await pg.exec(schema());
  return {backend:'PGlite PostgreSQL (local)',query:(q,v)=>pg.query(q,v),transaction:fn=>pg.transaction(tx=>fn({query:(q,v)=>tx.query(q,v)})),close:async()=>{await pg.close();release();process.removeListener('exit',release);}};
 }catch(e){release();throw e;}
}
const globalDb=globalThis as unknown as {routeTillDb?:Map<string,Promise<Database>>};
globalDb.routeTillDb??=new Map();
export async function db(mode:Mode='demo'){
 assertIsolatedStores(process.env.DATABASE_URL,process.env.DEMO_DATABASE_URL);
 const url=mode==='demo'?process.env.DEMO_DATABASE_URL:process.env.DATABASE_URL;
 if(process.env.VERCEL){
  if(!url)throw new Error(`${mode==='demo'?'DEMO_DATABASE_URL':'DATABASE_URL'} is required on Vercel`);
  if(mode==='demo'&&url===process.env.DATABASE_URL)throw new Error('Demo and live must use separate PostgreSQL databases');
 }
 const key=url||join(process.cwd(),'data',mode);
 if(!url)mkdirSync(join(process.cwd(),'data'),{recursive:true});
 if(!globalDb.routeTillDb!.has(key))globalDb.routeTillDb!.set(key,createDatabase(key));
 return globalDb.routeTillDb!.get(key)!;
}
export async function migrate(database:Sql){await database.query(schema());}
