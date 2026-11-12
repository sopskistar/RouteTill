import {randomUUID} from 'node:crypto';
import {Database} from '../db';
import {Actor,requireThat} from '../core/types';
import {assertDeploymentMode} from '../core/deployment';
import {newSession,rateLimit} from './auth';

export function guestScope(actor:Actor,method:string,resource:string,id?:string,action?:string){
 if(actor.role!=='guest')return;
 const allowed=(resource==='auth'&&((method==='GET'&&id==='me')||(method==='POST'&&id==='logout')))
  ||(resource==='lab'&&method==='POST'&&['prepare','challenge','reset'].includes(id||''))
  ||(['orders','entitlements'].includes(resource)&&method==='GET'&&!!id)
  ||(resource==='orders'&&method==='POST'&&!!id&&action==='approve')
  ||(resource==='verify'&&method==='POST');
 requireThat(actor.mode==='demo'&&actor.authKind==='cookie'&&allowed,'GUEST_SCOPE','Guest access is limited to the isolated prepared challenge, its evidence and entitled file. Merchant administration, agent tokens, live payments and provider requests require elevated access.',403);
}

export async function guestSession(database:Database,ipHash:string){
 assertDeploymentMode('demo');
 requireThat(process.env.ENABLE_JUDGE_DEMO!=='false','DEMO_DISABLED','The isolated challenge is unavailable.',403);
 // Global budgets remain effective even if a request supplies an untrusted forwarding header.
 await rateLimit(database,'guest:create:day',240,86400);
 await rateLimit(database,'guest:create:hour',60,3600);
 await rateLimit(database,'guest:create:ip:'+ipHash,12,3600);
 return database.transaction(async sql=>{
  const id='guest-'+randomUUID();await sql.query('INSERT INTO merchants(id,email,name) VALUES($1,$2,$3)',[id,id+'@demo.invalid','Guest buyer']);
  const session=await newSession(sql,'demo',id,'guest',undefined,30);
  await sql.query('INSERT INTO demo_guest_limits(session_hash) VALUES($1)',[session.actor.sessionHash]);
  return session;
 });
}

export async function guestBudget(database:Database,actor:Actor){
 if(actor.role!=='guest')return null;
 return (await database.query('SELECT g.order_count,g.challenge_count,s.expires_at FROM demo_guest_limits g JOIN sessions s ON s.token_hash=g.session_hash WHERE g.session_hash=$1 AND s.expires_at>now()',[actor.sessionHash])).rows[0]||null;
}

export async function reserveGuestChallenge(database:Database,actor:Actor,orderId:string){
 if(actor.role!=='guest')return;
 await rateLimit(database,'guest:challenge:hour',180,3600);
 const row=(await database.query('UPDATE demo_guest_limits g SET challenge_count=challenge_count+1 FROM sessions s WHERE g.session_hash=$1 AND s.token_hash=g.session_hash AND s.expires_at>now() AND g.active_order_id=$2 AND g.challenge_count<15 RETURNING g.challenge_count',[actor.sessionHash,orderId])).rows[0];
 requireThat(row,'GUEST_CHALLENGE_LIMIT','This guest session has expired, reached 15 challenge runs, or selected an inactive order. Use your current prepared purchase or the elevated judge workspace.',429);
}
