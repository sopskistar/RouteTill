import {randomUUID} from 'node:crypto';
import {Database,Sql} from '../db';
import {Actor,Order,Policy,requireThat} from '../core/types';
import {fingerprint,sha256} from '../core/crypto';
import {enforceLiveTrial} from '../core/live-trial';
import {ARB_USDC,BASE_USDC,BASE_TOKEN,enforcePolicy,transition} from '../core/policy';
import {assertAtomic} from '../core/amounts';
import {productById} from './catalog';
import {quote} from '../integrations/near';
export async function audit(sql:Sql,orderId:string,kind:string,data:unknown={},externalKey:string|null=null){await sql.query('INSERT INTO events(id,order_id,kind,data,external_key) VALUES($1,$2,$3,$4,$5) ON CONFLICT(external_key) DO NOTHING',[randomUUID(),orderId,kind,JSON.stringify(data),externalKey]);}
export async function getOrder(sql:Sql,id:string,actor?:Actor,lock=false):Promise<Order>{
 const order=(await sql.query<Order>('SELECT * FROM orders WHERE id=$1'+(lock?' FOR UPDATE':''),[id])).rows[0];requireThat(order,'ORDER_NOT_FOUND','Order not found.',404);
 if(actor)requireThat(order.buyer_id===actor.buyerId||order.merchant_id===actor.merchantId||(actor.authKind!=='bearer'&&order.buyer_owner_id===actor.merchantId),'ORDER_FORBIDDEN','This order belongs to another session.',403);return order;
}
export async function propose(database:Database,actor:Actor,input:{productId:string;maxSourceAmount:string;refundAddress:string;sourceAsset?:string}){
 const p=await productById(database,input.productId);assertAtomic(input.maxSourceAmount);
 requireThat(BigInt(input.maxSourceAmount)<=1100000000n&&BigInt(input.maxSourceAmount)>=BigInt(p.amount),'PRICE_LIMIT','Source maximum must cover the price and stay below 1,100 USDC.');
 requireThat(actor.mode==='demo'||p.wallet_verified,'WALLET_UNVERIFIED','Merchant settlement wallet ownership is not verified.');
 requireThat(!input.sourceAsset||input.sourceAsset===ARB_USDC,'UNSUPPORTED_ROUTE','This verifier supports Arbitrum USDC → Base USDC.');
 const policy:Policy={version:1,authorizationId:randomUUID(),merchantId:p.merchant_id,merchantName:p.merchant_name!,recipient:p.wallet!,productId:p.id,productName:p.title,artifactSha256:p.artifact_hash,sourceAsset:ARB_USDC,destinationAsset:BASE_USDC,sourceChain:42161,destinationChain:8453,destinationToken:BASE_TOKEN,destinationAmount:p.amount,maxSourceAmount:input.maxSourceAmount,refundAddress:input.refundAddress.toLowerCase(),expiresAt:new Date(Date.now()+30*60000).toISOString(),mode:actor.mode};
 const id=randomUUID();const hash=fingerprint(policy);
 await database.transaction(async sql=>{await sql.query('INSERT INTO orders(id,merchant_id,buyer_id,buyer_owner_id,product_id,policy,fingerprint,state) VALUES($1,$2,$3,$4,$5,$6,$7,$8)',[id,p.merchant_id,actor.buyerId,actor.merchantId,p.id,JSON.stringify(policy),hash,'PROPOSED']);await audit(sql,id,'purchase.proposed',{fingerprint:hash});});return getOrder(database,id,actor);
}
export async function approve(database:Database,actor:Actor,id:string,approvedFingerprint:string){
 return database.transaction(async sql=>{
  const o=await getOrder(sql,id,actor,true);requireThat(actor.role!=='agent'&&actor.authKind!=='bearer'&&(o.buyer_id===actor.buyerId||o.buyer_owner_id===actor.merchantId),'HUMAN_REQUIRED','Only the human buyer or agent owner may approve this purchase.',403);
  requireThat(o.fingerprint===approvedFingerprint,'POLICY_MISMATCH','Displayed approval fingerprint does not match the stored terms.');enforcePolicy(o.policy,o.policy,o.fingerprint);
  transition(o.state,'APPROVED');requireThat(o.state==='PROPOSED','ALREADY_APPROVED','This purchase has already been approved.',409);
  await sql.query('INSERT INTO approvals(id,order_id,buyer_id,fingerprint,expires_at) VALUES($1,$2,$3,$4,$5)',[o.policy.authorizationId,id,actor.buyerId,o.fingerprint,o.policy.expiresAt]);
  await sql.query("UPDATE orders SET state='APPROVED',updated_at=now() WHERE id=$1",[id]);await audit(sql,id,'purchase.human-approved',{fingerprint:o.fingerprint,scope:'single purchase; no wallet access'});return {approved:true,fingerprint:o.fingerprint};
 });
}
export async function consumeApproval(database:Database,actor:Actor,id:string,requested:Policy,idempotencyKey:string){
 return database.transaction(async sql=>{
  const o=await getOrder(sql,id,actor,true);requireThat(o.buyer_id===actor.buyerId,'BUYER_REQUIRED','Only the approved buyer can execute this purchase.',403);
  requireThat(o.policy.mode===actor.mode,'ENVIRONMENT_MISMATCH','Purchase and session environments must match.',403);
  enforcePolicy(o.policy,requested,o.fingerprint);
  const a=(await sql.query('SELECT * FROM approvals WHERE order_id=$1 FOR UPDATE',[id])).rows[0];
  requireThat(a,'HUMAN_REQUIRED','Explicit human approval is required.',403);
  requireThat(!a.consumed_at,'APPROVAL_REUSED','This single-use approval has already been consumed. No second purchase was authorized.',409);
  requireThat(new Date(a.expires_at).getTime()>Date.now(),'APPROVAL_EXPIRED','Approval expired. Prepare a new purchase.');
  const p=await productById(sql,o.product_id);
  if(o.policy.mode==='live')enforceLiveTrial(o,actor,a);
  requireThat(p.wallet===o.policy.recipient&&p.amount===o.policy.destinationAmount&&p.artifact_hash===o.policy.artifactSha256,'TERMS_CHANGED','Merchant terms changed since approval. Prepare a new purchase.');
  if(o.policy.mode==='live'){
   requireThat(p.wallet_verified&&p.merchant_id===o.merchant_id,'WALLET_UNVERIFIED','The trial merchant settlement wallet must remain verified.',403);
   requireThat(sha256(p.artifact)===o.policy.artifactSha256,'ARTIFACT_MISMATCH','Product bytes do not match the approved trial artifact.');
  }
  transition(o.state,'QUOTING');const attemptId=randomUUID();
  await sql.query('UPDATE approvals SET consumed_at=now() WHERE order_id=$1 AND consumed_at IS NULL',[id]);
  await sql.query("INSERT INTO attempts(id,order_id,idempotency_key,state) VALUES($1,$2,$3,'QUOTING')",[attemptId,id,idempotencyKey]);
  await sql.query("UPDATE orders SET state='QUOTING',updated_at=now() WHERE id=$1",[id]);await audit(sql,id,'approval.consumed',{attemptId});return {order:o,attemptId};
 });
}
export async function execute(database:Database,actor:Actor,id:string,requested:Policy,idempotencyKey:string){
 requireThat(actor.mode==='live','DEMO_PAYMENT_BLOCKED','Synthetic orders cannot create live payment instructions.',403);
 requireThat(process.env.ENABLE_LIVE_PAYMENTS==='true','LIVE_DISABLED','Live deposit creation is disabled until the owner enables it.',403);
 const {order,attemptId}=await consumeApproval(database,actor,id,requested,idempotencyKey);
 try{
  // A slow commit must not start provider quoting after the approved policy expires.
  enforcePolicy(order.policy,order.policy,order.fingerprint);
  const q=await quote(order.policy,false);
  await database.transaction(async sql=>{await sql.query("UPDATE attempts SET quote=$1,deposit_address=$2,state='AWAITING_DEPOSIT',next_poll_at=now() WHERE id=$3",[JSON.stringify(q),q.response.quote.depositAddress,attemptId]);await sql.query("UPDATE orders SET state='AWAITING_DEPOSIT',updated_at=now() WHERE id=$1",[id]);await audit(sql,id,'payment.instructions-created',{attemptId});});
  return {attemptId,...q};
 }catch(error){await database.query("UPDATE attempts SET state='FAILED',last_error=$1 WHERE id=$2",[error instanceof Error?error.message:'Quote failed',attemptId]);await database.query("UPDATE orders SET state='FAILED',updated_at=now() WHERE id=$1",[id]);throw error;}
}
