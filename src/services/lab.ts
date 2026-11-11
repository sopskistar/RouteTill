import {randomUUID} from 'node:crypto';
import {Database} from '../db';
import {Actor,DomainError,requireThat} from '../core/types';
import {consumeApproval,approve,getOrder,propose} from './orders';
import {seedMerchant} from './catalog';
import {inspectTransfer,syntheticFacts} from '../integrations/settlement';
import {drainOutbox,issuePassport,qualifyAndFulfill} from './fulfillment';
import {verifyPassport} from '../core/verifier';
import {publicKeyPem} from '../core/crypto';
import {DEMO_WALLET} from '../core/policy';
export async function prepareLab(database:Database,actor:Actor){
 requireThat(actor.mode==='demo'&&actor.role==='judge','JUDGE_ONLY','Break-It Lab requires an isolated judge session.',403);
 const productId=await seedMerchant(database,actor.merchantId,'RouteTill Studio');return propose(database,actor,{productId,maxSourceAmount:'11000000',refundAddress:DEMO_WALLET});
}
export async function runChallenge(database:Database,actor:Actor,id:string,attack:string){
 requireThat(actor.mode==='demo'&&actor.role==='judge','JUDGE_ONLY','Challenges are restricted to the synthetic judge database.',403);
 let o=await getOrder(database,id,actor);
 requireThat(o.policy.mode==='demo','ENVIRONMENT_MISMATCH','Live orders cannot enter the lab.',403);
 if(o.state==='PROPOSED')await approve(database,actor,id,o.fingerprint);
 o=await getOrder(database,id,actor);
 const purchaser={...actor,buyerId:o.buyer_id}; // Only inside the protected synthetic judge environment.
 if(attack==='merchant'||attack==='price'){
  const changed={...o.policy,...(attack==='merchant'?{recipient:'0x9999999999999999999999999999999999999999'}:{maxSourceAmount:(BigInt(o.policy.maxSourceAmount)+1n).toString()})};
  try{await consumeApproval(database,purchaser,id,changed,randomUUID());return {passed:false,message:'Attack unexpectedly accepted'};}catch(e){if(!(e instanceof DomainError))throw e;return {passed:e.code===(attack==='merchant'?'MERCHANT_SUBSTITUTION':'PRICE_LIMIT'),code:e.code,message:e.message,approvedFingerprint:o.fingerprint};}
 }
 if(attack==='reuse'){
  if(o.state==='APPROVED')await consumeApproval(database,purchaser,id,o.policy,randomUUID());
  try{await consumeApproval(database,purchaser,id,o.policy,randomUUID());return {passed:false};}catch(e){if(!(e instanceof DomainError))throw e;const count=(await database.query('SELECT count(*)::int AS count FROM attempts WHERE order_id=$1',[id])).rows[0].count;return {passed:e.code==='APPROVAL_REUSED'&&count===1,code:e.code,message:e.message,storedAttempts:count};}
 }
 if(attack==='replay'||attack==='tamper'){
  if(o.state==='APPROVED')await consumeApproval(database,purchaser,id,o.policy,randomUUID());
  const attempt=(await database.query('SELECT * FROM attempts WHERE order_id=$1',[id])).rows[0];
  requireThat(attempt,'ATTEMPT_REQUIRED','Run approval consumption before replay.');
  await database.transaction(async sql=>{await sql.query("UPDATE orders SET state='AWAITING_DEPOSIT' WHERE id=$1 AND state='QUOTING'",[id]);await sql.query("UPDATE attempts SET state='AWAITING_DEPOSIT',quote=$1 WHERE id=$2 AND state='QUOTING'",[JSON.stringify({synthetic:true,note:'No provider quote is claimed for this settlement fixture.'}),attempt.id]);});
  const facts=syntheticFacts(o.policy,id);const evidence=inspectTransfer(o.policy,facts.receipt.transactionHash,facts);evidence.kind='SYNTHETIC';evidence.providerAssociation='synthetic:'+attempt.id;
  const prefix=randomUUID();
  const deliver=(i:number)=>qualifyAndFulfill(database,'demo',attempt.id,evidence,`demo:${attempt.id}:${prefix}:${i%10}`,{status:'SYNTHETIC_SUCCESS',fixture:true,association:attempt.id});
  const outcomes=[];
  for(let i=0;i<5;i++)outcomes.push(await deliver(i));
  outcomes.push(...await Promise.all(Array.from({length:15},(_,i)=>deliver(i+5))));
  await drainOutbox(database);const passport=await issuePassport(database,id);
  const entitlement=(await database.query('SELECT * FROM entitlements WHERE order_id=$1',[id])).rows[0];
  const count=(await database.query('SELECT count(*)::int AS count FROM entitlements WHERE order_id=$1',[id])).rows[0].count;
  const before=verifyPassport(passport,{trustedKey:publicKeyPem(),artifact:entitlement.artifact});
  const tampered=structuredClone(passport);tampered.payload.destination.recipient='0x9999999999999999999999999999999999999999';
  const after=verifyPassport(tampered,{trustedKey:publicKeyPem(),artifact:entitlement.artifact});
  const artifactTamper=verifyPassport(passport,{trustedKey:publicKeyPem(),artifact:entitlement.artifact+'tampered'});
  return {passed:attack==='replay'?count===1:before.integrity==='PASS'&&after.integrity==='FAIL'&&artifactTamper.integrity==='FAIL',deliveries:20,concurrentDeliveries:15,uniqueEventKeys:10,storedEntitlements:count,newEntitlements:outcomes.filter(x=>x.created).length,orderId:id,entitlementId:entitlement.id,before,after,artifactTamper,message:attack==='replay'?'20 notifications reached the transaction handler. PostgreSQL stores one entitlement.':'Original record passes. Modified recipient and artifact bytes fail verification.',passport};
 }
 throw new DomainError('UNKNOWN_CHALLENGE','Unknown challenge.',404);
}
