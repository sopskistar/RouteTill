import {PGlite} from '@electric-sql/pglite';
import {Pool} from 'pg';
import {Pool as NeonPool} from '@neondatabase/serverless';
import {readFileSync,mkdirSync,writeFileSync,unlinkSync,existsSync} from 'node:fs';
import {join} from 'node:path';
import {Mode} from '../core/types';
import {requireThat} from '../core/types';
import {assertDeploymentMode} from '../core/deployment';
export interface Sql {query<T=any>(text:string,values?:unknown[]):Promise<{rows:T[];rowCount?:number|null}>}
export interface Database extends Sql {transaction<T>(fn:(sql:Sql)=>Promise<T>):Promise<T>;close():Promise<void>;backend:string}
interface PgPoolLike extends Sql {connect():Promise<Sql&{release():void}>;end():Promise<void>;on(event:'error',listener:()=>void):unknown}
export function assertIsolatedStores(live?:string,demo?:string){
 if(!live||!demo)return;
 const identity=(raw:string)=>{let u:URL;try{u=new URL(raw);}catch{throw new Error('Invalid PostgreSQL connection URL; credential values withheld.');}if(!['postgres:','postgresql:'].includes(u.protocol))throw new Error('Expected a PostgreSQL connection URL; credential values withheld.');return u.hostname.replace(/-pooler(?=\.)/,'').toLowerCase()+':'+(u.port||'5432')+u.pathname;};
 if(identity(live)===identity(demo))throw new Error('Demo and live must use separate PostgreSQL databases; credentials or pooler parameters do not create isolation.');
}
const schema=()=>['001_init.sql','002_release.sql','003_guest_demo.sql'].map(name=>readFileSync(join(process.cwd(),'migrations',name),'utf8')).join('\n');
export async function createDatabase(pathOrUrl:string,namespace?:string,transport:'tcp'|'neon-ws'='tcp'):Promise<Database>{
 if(/^postgres(ql)?:/.test(pathOrUrl)){
  if(namespace&&!/^rt_release_test_[a-z0-9_]+$/.test(namespace))throw new Error('Only an isolated generated release-test schema may be selected.');
  if(transport==='neon-ws'&&!new URL(pathOrUrl).hostname.endsWith('.neon.tech'))throw new Error('Neon WebSocket verification requires an actual Neon endpoint.');
  const options={connectionString:pathOrUrl,max:4,connectionTimeoutMillis:30000,idleTimeoutMillis:15000};
  const pool=(transport==='neon-ws'?new NeonPool(options):new Pool(options)) as unknown as PgPoolLike;
  pool.on('error',()=>console.error('RouteTill database idle connection closed; a subsequent request must reconnect.'));
  const transaction:Database['transaction']=async fn=>{const c=await pool.connect();try{await c.query('BEGIN');if(namespace)await c.query(`SET LOCAL search_path TO "${namespace}"`);const r=await fn({query:(q,v)=>c.query(q,v) as any});await c.query('COMMIT');return r;}catch(e){await c.query('ROLLBACK');throw e;}finally{c.release();}};
  return {backend:transport==='neon-ws'?'Neon PostgreSQL (WebSocket)':'PostgreSQL',query:(q,v)=>namespace?transaction(sql=>sql.query(q,v)):pool.query(q,v) as any,transaction,close:()=>pool.end()};
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
 assertDeploymentMode(mode);
 assertIsolatedStores(process.env.DATABASE_URL,process.env.DEMO_DATABASE_URL);
 const url=mode==='demo'?process.env.DEMO_DATABASE_URL:process.env.DATABASE_URL;
 if(url)requireThat(/^postgres(ql)?:\/\//.test(url),'DATABASE_CONFIGURATION','The database setting must contain a PostgreSQL URL value, without a variable name, shell command or wrapping quotes.',503);
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
