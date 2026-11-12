import {Database} from '../db';
import {Actor,Attempt,DomainError,Mode,State,requireThat} from '../core/types';
import {getOrder,audit} from './orders';
import {status} from '../integrations/near';
import {verifyDestination} from '../integrations/settlement';
import {transition} from '../core/policy';
import {drainOutbox,qualifyAndFulfill} from './fulfillment';
export async function reconcile(database:Database,attemptId:string,actor?:Actor){
 const a=await database.transaction(async sql=>{const row=(await sql.query<Attempt>('SELECT * FROM attempts WHERE id=$1 FOR UPDATE',[attemptId])).rows[0];requireThat(row,'ATTEMPT_NOT_FOUND','Payment attempt not found.',404);
  const o=await getOrder(sql,row.order_id,actor);requireThat(o.policy.mode==='live','DEMO_RECONCILIATION_BLOCKED','Synthetic attempts cannot poll or authorize live payments.');
  if(['FULFILLED','REFUNDED','FAILED','DISPUTED'].includes(row.state))return null;
  requireThat(row.poll_count<120,'POLL_LIMIT','Automatic polling limit reached. Manual investigation is required.',409);
  const lease=(await sql.query("UPDATE attempts SET lease_until=now()+interval '1 minute',poll_count=poll_count+1,next_poll_at=now()+($2*interval '1 second') WHERE id=$1 AND (lease_until IS NULL OR lease_until<now()) AND next_poll_at<=now() RETURNING id",[attemptId,Math.min(300,10*2**Math.min(5,Math.floor(row.poll_count/5)))])).rows;
  requireThat(lease.length,'POLL_BACKOFF','This attempt is already being checked or is waiting for its next scheduled check.',429);return row;
 });
 if(!a)return {terminal:true};
 try{
  const o=await getOrder(database,a.order_id,actor);const s=await status(a.deposit_address!);
  if(s.status==='SUCCESS'){
   const evidence=await verifyDestination(o.policy,s,a);
   await database.query('UPDATE attempts SET provider=$1,evidence=$2 WHERE id=$3',[JSON.stringify(s),JSON.stringify(evidence),a.id]);
   if(evidence.verified){const result=await qualifyAndFulfill(database,'live',a.id,evidence,`poll:${a.id}:${s.updatedAt}`,s);await drainOutbox(database);return result;}
   const disputed=evidence.finalized&&evidence.confirmations>=12&&evidence.reasons.some(r=>!['Insufficient confirmations','Destination block is not finalized','Transaction receipt unavailable','Receipt is not in the canonical block'].includes(r));
   const next=disputed?'DISPUTED':'PROVIDER_SUCCESS';
   await database.transaction(async sql=>{const current=await getOrder(sql,o.id,undefined,true);transition(current.state,next);await sql.query('UPDATE attempts SET state=$1,last_error=$2 WHERE id=$3',[next,evidence.reasons.join('; '),a.id]);await sql.query('UPDATE orders SET state=$1,updated_at=now() WHERE id=$2',[next,o.id]);await audit(sql,o.id,disputed?'settlement.disputed':'settlement.awaiting-evidence',{reasons:evidence.reasons});});return {verified:false,state:next,reasons:evidence.reasons};
  }
  const next=({PENDING_DEPOSIT:'AWAITING_DEPOSIT',KNOWN_DEPOSIT_TX:'PROCESSING',PROCESSING:'PROCESSING',INCOMPLETE_DEPOSIT:'INCOMPLETE',REFUNDED:'REFUNDED',FAILED:'FAILED'} as Record<string,State>)[s.status];
  requireThat(next,'UNKNOWN_STATUS','Unknown provider status; settlement remains UNVERIFIED.',502);
  await database.transaction(async sql=>{const current=await getOrder(sql,o.id,undefined,true);transition(current.state,next);await sql.query('UPDATE attempts SET state=$1,provider=$2 WHERE id=$3',[next,JSON.stringify(s),a.id]);await sql.query('UPDATE orders SET state=$1,updated_at=now() WHERE id=$2',[next,o.id]);await audit(sql,o.id,'provider.status',{status:s.status});});return {state:next};
 }catch(error){await database.query('UPDATE attempts SET last_error=$1 WHERE id=$2',[error instanceof Error?error.message:'Reconciliation error',a.id]);throw error;}finally{await database.query('UPDATE attempts SET lease_until=NULL WHERE id=$1',[a.id]);}
}
export async function sweep(database:Database,mode:Mode='live'){
 if(mode==='demo')return {checked:0,syntheticOnly:true,outbox:await drainOutbox(database)};
 const stuck=(await database.query("SELECT id,order_id FROM attempts WHERE state='QUOTING' AND created_at<now()-interval '3 minutes' LIMIT 10")).rows;
 for(const a of stuck){await database.transaction(async sql=>{const o=await getOrder(sql,a.order_id,undefined,true);if(o.state==='QUOTING'){await sql.query("UPDATE attempts SET state='FAILED',last_error='Quote creation interrupted; create a new approval.' WHERE id=$1",[a.id]);await sql.query("UPDATE orders SET state='FAILED' WHERE id=$1",[o.id]);}});}
 const due=(await database.query("SELECT id FROM attempts WHERE state IN ('AWAITING_DEPOSIT','PROCESSING','INCOMPLETE','PROVIDER_SUCCESS') AND next_poll_at<=now() AND poll_count<120 AND (lease_until IS NULL OR lease_until<now()) LIMIT 10")).rows;
 const results=await Promise.allSettled(due.map(a=>reconcile(database,a.id)));await drainOutbox(database);
 return {checked:results.length,succeeded:results.filter(x=>x.status==='fulfilled').length,failed:results.filter(x=>x.status==='rejected').map(x=>(x as PromiseRejectedResult).reason instanceof DomainError?(x as PromiseRejectedResult).reason.code:'CHECK_FAILED')};
}
