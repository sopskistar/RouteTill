import {randomUUID} from 'node:crypto';
import {Database} from '../db';
import {fingerprint,publicKeyPem,sha256,signPayload} from '../core/crypto';
import {Attempt,Mode,SettlementEvidence,requireThat} from '../core/types';
import {transition} from '../core/policy';
import {audit,getOrder} from './orders';
import {productById} from './catalog';
export async function qualifyAndFulfill(database:Database,mode:Mode,attemptId:string,evidence:SettlementEvidence,eventKey:string,providerEvidence:unknown){
 return database.transaction(async sql=>{
  const attempt=(await sql.query<Attempt>('SELECT * FROM attempts WHERE id=$1',[attemptId])).rows[0];requireThat(attempt,'ATTEMPT_NOT_FOUND','Payment attempt not found.',404);
  const o=await getOrder(sql,attempt.order_id,undefined,true);
  requireThat(o.policy.mode===mode,'ENVIRONMENT_MISMATCH','Demo and live evidence cannot cross environments.',403);
  requireThat(evidence.kind===(mode==='demo'?'SYNTHETIC':'CHAIN'),'SYNTHETIC_LIVE_BLOCKED','Synthetic evidence cannot authorize live delivery.',403);
  requireThat(evidence.verified&&evidence.reasons.length===0,'SETTLEMENT_UNVERIFIED','Required settlement checks did not pass. No entitlement was created.');
  requireThat(evidence.chainId===o.policy.destinationChain&&evidence.token.toLowerCase()===o.policy.destinationToken.toLowerCase()&&evidence.recipient.toLowerCase()===o.policy.recipient.toLowerCase()&&BigInt(evidence.actualAmount)>=BigInt(o.policy.destinationAmount),'SETTLEMENT_TERMS','Settlement does not match the approved purchase.');
  requireThat(evidence.txHash&&evidence.logIndex!==null&&evidence.finalized&&evidence.confirmations>=12,'FINALITY','Final chain evidence is required for fulfillment.');
  if(mode==='live')requireThat(attempt.source_tx&&(providerEvidence as any)?.status==='SUCCESS'&&evidence.providerAssociation,'ASSOCIATION','Confirmed source deposit and provider association are required.');
  const existing=(await sql.query('SELECT * FROM entitlements WHERE order_id=$1',[o.id])).rows[0];
  await audit(sql,o.id,'settlement.notification',{attemptId,evidenceFingerprint:fingerprint(evidence)},eventKey);
  if(existing)return {created:false,entitlementId:existing.id,orderId:o.id};
  const approval=(await sql.query('SELECT * FROM approvals WHERE order_id=$1',[o.id])).rows[0];requireThat(approval?.consumed_at,'APPROVAL_REQUIRED','Approval must be consumed before delivery.');
  transition(o.state,'PROVIDER_SUCCESS');
  const p=await productById(sql,o.product_id);requireThat(sha256(p.artifact)===o.policy.artifactSha256&&p.artifact_hash===o.policy.artifactSha256,'ARTIFACT_MISMATCH','Product bytes do not match the approved artifact digest.');
  const entitlementId=randomUUID();
  await sql.query('INSERT INTO settlements(id,attempt_id,chain_id,tx_hash,log_index,proof) VALUES($1,$2,$3,$4,$5,$6)',[randomUUID(),attemptId,evidence.chainId,evidence.txHash,evidence.logIndex,JSON.stringify(evidence)]);
  await sql.query("UPDATE attempts SET state='VERIFIED',evidence=$1,provider=$2 WHERE id=$3",[JSON.stringify(evidence),JSON.stringify(providerEvidence),attemptId]);
  await audit(sql,o.id,'settlement.qualified',{level:mode==='demo'?'SYNTHETIC_ONLY':'INDEPENDENT_RPC_OBSERVATION',txHash:evidence.txHash});
  await sql.query('INSERT INTO entitlements(id,order_id,merchant_id,attempt_id,artifact,artifact_hash) VALUES($1,$2,$3,$4,$5,$6)',[entitlementId,o.id,o.merchant_id,attemptId,p.artifact,p.artifact_hash]);
  await sql.query("UPDATE orders SET state='FULFILLED',updated_at=now() WHERE id=$1",[o.id]);
  await sql.query("UPDATE attempts SET state='FULFILLED' WHERE id=$1",[attemptId]);
  await audit(sql,o.id,'fulfillment.issued',{entitlementId,artifactSha256:p.artifact_hash});
  await sql.query("INSERT INTO outbox(id,order_id,topic,payload) VALUES($1,$2,'passport.issue',$3) ON CONFLICT(order_id,topic) DO NOTHING",[randomUUID(),o.id,JSON.stringify({entitlementId})]);
  return {created:true,entitlementId,orderId:o.id};
 });
}
export async function issuePassport(database:Database,orderId:string){
 return database.transaction(async sql=>{
  const o=await getOrder(sql,orderId,undefined,true);
  const saved=(await sql.query('SELECT document FROM passports WHERE order_id=$1',[orderId])).rows[0];if(saved)return saved.document;
  requireThat(o.state==='FULFILLED','NOT_FULFILLED','A final passport requires qualified fulfillment.');
  const a=(await sql.query<Attempt>('SELECT * FROM attempts WHERE order_id=$1',[orderId])).rows[0];
  const e=(await sql.query('SELECT * FROM entitlements WHERE order_id=$1',[orderId])).rows[0];
  const events=(await sql.query('SELECT id,kind,data,created_at FROM events WHERE order_id=$1 AND kind IN (\'purchase.human-approved\',\'approval.consumed\',\'settlement.qualified\',\'fulfillment.issued\') ORDER BY created_at,id',[orderId])).rows;
  const payload={schema:'routetill.purchase-passport.v1',mode:o.policy.mode,orderId:o.id,approvedTerms:o.policy,approvedTermsHash:o.fingerprint,quoteEvidence:a.quote,source:{chainId:o.policy.sourceChain,transactionHash:a.source_tx},destination:{chainId:o.policy.destinationChain,token:o.policy.destinationToken,recipient:o.policy.recipient,expectedAmount:o.policy.destinationAmount,actualAmount:a.evidence!.actualAmount,transactionHash:a.evidence!.txHash},providerEvidence:a.provider,settlement:a.evidence,settlementLevel:o.policy.mode==='demo'?'SYNTHETIC_ONLY':'INDEPENDENT_RPC_OBSERVATION',fulfillment:{entitlementId:e.id,eventId:events.find((x:any)=>x.kind==='fulfillment.issued')?.id,artifactSha256:e.artifact_hash,issuedAt:new Date(e.created_at).toISOString()},events,issuedAt:new Date().toISOString(),limitations:[
   'Human approval and database uniqueness are application assertions. They are not independently proved by this signature.',
   'A SHA-256 match establishes byte identity, not usefulness, quality, or off-platform delivery.',
   'Destination transfer association relies on the provider status response; that response is not a signed proof of causal routing.',
   o.policy.mode==='demo'?'Synthetic fixture. No funds moved. Mainnet settlement is UNVERIFIED.':'Chain facts were observed through an independent RPC. Re-query a trusted RPC; stored JSON alone does not establish blockchain finality.',
   'The issuer public key must be obtained or pinned independently. A self-supplied key is not an identity proof.'
  ]};
  const document={payload,signature:{algorithm:'Ed25519',value:signPayload(payload,o.policy.mode),publicKey:publicKeyPem(o.policy.mode),keyFingerprint:sha256(publicKeyPem(o.policy.mode))}};
  await sql.query('INSERT INTO passports(order_id,document) VALUES($1,$2) ON CONFLICT(order_id) DO NOTHING',[orderId,JSON.stringify(document)]);return document;
 });
}
export async function drainOutbox(database:Database,limit=20){
 const jobs=await database.transaction(async sql=>{const rows=(await sql.query('SELECT * FROM outbox WHERE delivered_at IS NULL AND next_at<=now() AND (lease_until IS NULL OR lease_until<now()) ORDER BY next_at LIMIT $1 FOR UPDATE SKIP LOCKED',[limit])).rows;
  for(const j of rows)await sql.query("UPDATE outbox SET lease_until=now()+interval '2 minutes',attempts=attempts+1 WHERE id=$1",[j.id]);return rows;});
 const results=[];
 for(const j of jobs){try{await issuePassport(database,j.order_id);await database.query('UPDATE outbox SET delivered_at=now(),lease_until=NULL,last_error=NULL WHERE id=$1',[j.id]);results.push({id:j.id,ok:true});}catch(e){await database.query("UPDATE outbox SET lease_until=NULL,last_error=$1,next_at=now()+interval '5 minutes' WHERE id=$2",[e instanceof Error?e.message:'Worker error',j.id]);results.push({id:j.id,ok:false});}}
 return results;
}
