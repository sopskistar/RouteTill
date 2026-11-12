import {randomBytes,randomUUID,scryptSync,timingSafeEqual} from 'node:crypto';
import {verifyMessage,isAddress} from 'viem';
import {NextRequest} from 'next/server';
import {Database,Sql,db} from '../db';
import {sha256} from '../core/crypto';
import {Actor,Mode,requireThat} from '../core/types';
import {seedMerchant} from './catalog';
export const COOKIE='routetill_session';
export function hashPassword(password:string){const salt=randomBytes(16).toString('hex');return salt+':'+scryptSync(password,salt,64).toString('hex');}
function checkPassword(password:string,stored:string){try{const [salt,hash]=stored.split(':');const a=scryptSync(password,salt,64);const b=Buffer.from(hash,'hex');return a.length===b.length&&timingSafeEqual(a,b);}catch{return false;}}
export async function rateLimit(database:Database,key:string,limit=40,seconds=60){
 const result=await database.query("INSERT INTO rate_limits(key,count,expires_at) VALUES($1,1,now()+($2*interval '1 second')) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN rate_limits.expires_at<=now() THEN 1 ELSE rate_limits.count+1 END,expires_at=CASE WHEN rate_limits.expires_at<=now() THEN now()+($2*interval '1 second') ELSE rate_limits.expires_at END RETURNING count",[key,seconds]);
 requireThat(result.rows[0].count<=limit,'RATE_LIMIT','Request limit reached. Please wait before retrying.',429);
}
export function safeEqual(a:string,b:string){const x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length&&timingSafeEqual(x,y);}
export async function newSession(database:Sql,mode:Mode,merchantId:string,role:Actor['role']='merchant',buyerId?:string,lifetimeMinutes=720){
 requireThat(role!=='guest'||mode==='demo','GUEST_LIVE_BLOCKED','Guest sessions cannot access live purchases.',403);
 requireThat(Number.isInteger(lifetimeMinutes)&&lifetimeMinutes>=1&&lifetimeMinutes<=720,'SESSION_LIFETIME','Invalid session lifetime.');
 const raw=`rt_${mode}_${randomBytes(32).toString('base64url')}`;const sessionHash=sha256(raw);const buyer=buyerId||randomUUID();
 await database.query('INSERT INTO sessions(token_hash,merchant_id,buyer_id,role,expires_at) VALUES($1,$2,$3,$4,now()+($5*interval \'1 minute\'))',[sessionHash,merchantId,buyer,role,lifetimeMinutes]);
 return {token:raw,actor:{merchantId,buyerId:buyer,role,mode,sessionHash,authKind:'cookie'} as Actor};
}
export async function auth(request:NextRequest):Promise<{actor:Actor;database:Database}>{
 const bearer=request.headers.get('authorization');const raw=bearer?.startsWith('Bearer ')?bearer.slice(7):request.cookies.get(COOKIE)?.value;
 requireThat(raw&&/^rt_(demo|live)_[\w-]{43}$/.test(raw),'AUTH_REQUIRED','Sign in or open an isolated judge session.',401);
 const mode=raw.startsWith('rt_demo_')?'demo':'live';const database=await db(mode);const sessionHash=sha256(raw);
 const s=(await database.query('SELECT * FROM sessions WHERE token_hash=$1 AND expires_at>now()',[sessionHash])).rows[0];requireThat(s,'SESSION_EXPIRED','Session expired. Sign in again.',401);
 if(bearer)requireThat(s.role==='agent','AGENT_TOKEN_REQUIRED','Use a scoped agent API token for bearer requests.',403);
 return {database,actor:{mode,merchantId:s.merchant_id,buyerId:s.buyer_id,role:s.role,sessionHash,authKind:bearer?'bearer':'cookie'}};
}
export async function login(input:{email:string;password:string;name?:string;register?:boolean}){
 const database=await db('live');
 if(input.register){const id=randomUUID();await database.query('INSERT INTO merchants(id,email,name,password_hash) VALUES($1,$2,$3,$4)',[id,input.email.toLowerCase(),input.name||'My studio',hashPassword(input.password)]);return newSession(database,'live',id);}
 const m=(await database.query('SELECT * FROM merchants WHERE email=$1',[input.email.toLowerCase()])).rows[0];
 const valid=checkPassword(input.password,m?.password_hash||hashPassword('dummy-auth-timing'));
 requireThat(m&&valid,'INVALID_LOGIN','Email or password is incorrect.',401);return newSession(database,'live',m.id);
}
export async function judgeSession(accessCode:string){
 requireThat(process.env.ENABLE_JUDGE_DEMO!=='false','DEMO_DISABLED','Judge demonstration is disabled.',403);
 if(process.env.VERCEL||process.env.JUDGE_ACCESS_CODE)requireThat(process.env.JUDGE_ACCESS_CODE&&safeEqual(accessCode,process.env.JUDGE_ACCESS_CODE),'JUDGE_ACCESS','Enter the owner-provided judge access code.',403);
 const database=await db('demo');const id='judge-'+randomUUID();await seedMerchant(database,id,'RouteTill Studio');return newSession(database,'demo',id,'judge');
}
export async function walletChallenge(database:Database,actor:Actor,wallet:string,origin:string){
 requireThat(actor.mode==='live'&&actor.role==='merchant','MERCHANT_REQUIRED','Wallet ownership is verified for live merchant accounts only.',403);
 requireThat(isAddress(wallet),'INVALID_ADDRESS','Enter a valid EVM address.');
 const id=randomUUID();const expiresAt=new Date(Date.now()+5*60000).toISOString();
 const message=`RouteTill settlement wallet ownership\nOrigin: ${origin}\nMerchant: ${actor.merchantId}\nAddress: ${wallet.toLowerCase()}\nNonce: ${id}\nExpires: ${expiresAt}\nThis message verifies an address. It authorizes no transaction or funds movement.`;
 await database.query('INSERT INTO wallet_challenges(id,merchant_id,wallet,message,expires_at) VALUES($1,$2,$3,$4,$5)',[id,actor.merchantId,wallet.toLowerCase(),message,expiresAt]);return {id,message,expiresAt};
}
export async function confirmWallet(database:Database,actor:Actor,id:string,signature:`0x${string}`){
 return database.transaction(async sql=>{const c=(await sql.query('SELECT * FROM wallet_challenges WHERE id=$1 AND merchant_id=$2 FOR UPDATE',[id,actor.merchantId])).rows[0];requireThat(c&&!c.consumed&&new Date(c.expires_at).getTime()>Date.now(),'WALLET_CHALLENGE','Wallet challenge expired or was already used.');
  requireThat(await verifyMessage({address:c.wallet,message:c.message,signature}),'WALLET_SIGNATURE','The message signature does not match the settlement wallet.');
  await sql.query('UPDATE wallet_challenges SET consumed=true WHERE id=$1',[id]);await sql.query('UPDATE merchants SET wallet=$1,wallet_verified=true WHERE id=$2',[c.wallet,actor.merchantId]);return {verified:true,wallet:c.wallet};});
}
export function checkOrigin(request:NextRequest){
 if(['GET','HEAD'].includes(request.method))return;
 if(request.headers.get('authorization')?.startsWith('Bearer '))return;
 const localHost=request.headers.get('host')||'';
 const localOrigin=/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(localHost)?request.nextUrl.protocol+'//'+localHost:request.nextUrl.origin;
 const expected=process.env.APP_ORIGIN||localOrigin;
 requireThat(request.headers.get('origin')===expected,'ORIGIN_REJECTED','Request origin did not match this application.',403);
}
