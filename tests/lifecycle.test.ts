import {beforeAll,afterAll,describe,it,expect} from 'vitest';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createDatabase,Database} from '../src/db';
import {Actor} from '../src/core/types';
import {sha256,publicKeyPem} from '../src/core/crypto';
import {approve,consumeApproval,getOrder,propose} from '../src/services/orders';
import {seedMerchant} from '../src/services/catalog';
import {DEMO_WALLET} from '../src/core/policy';
import {inspectTransfer,syntheticFacts} from '../src/integrations/settlement';
import {drainOutbox,issuePassport,qualifyAndFulfill} from '../src/services/fulfillment';
import {runChallenge} from '../src/services/lab';
import {verifyPassport} from '../src/core/verifier';
let database:Database,folder:string;
const actor:Actor={merchantId:'test-merchant',buyerId:'test-buyer',mode:'demo',role:'judge',sessionHash:'test-session',authKind:'cookie'};
beforeAll(async()=>{folder=await mkdtemp(join(tmpdir(),'routetill-db-'));database=await createDatabase(join(folder,'pg'));await seedMerchant(database,actor.merchantId);await seedMerchant(database,'other-merchant');},30000);
afterAll(async()=>{await database.close();await rm(folder,{recursive:true,force:true});});
async function prepared(){const order=await propose(database,actor,{productId:actor.merchantId+'-field-notes',maxSourceAmount:'11000000',refundAddress:DEMO_WALLET});await approve(database,actor,order.id,order.fingerprint);return order;}
async function ready(){const order=await prepared();const c=await consumeApproval(database,actor,order.id,order.policy,crypto.randomUUID());await database.query("UPDATE orders SET state='AWAITING_DEPOSIT' WHERE id=$1",[order.id]);const f=syntheticFacts(order.policy,order.id);const evidence=inspectTransfer(order.policy,f.receipt.transactionHash,f);evidence.kind='SYNTHETIC';return {order,attemptId:c.attemptId,evidence};}
describe('transactional authorization and tenant isolation',()=>{
 it('rejects execution before human approval',async()=>{const o=await propose(database,actor,{productId:actor.merchantId+'-field-notes',maxSourceAmount:'11000000',refundAddress:DEMO_WALLET});await expect(consumeApproval(database,actor,o.id,o.policy,crypto.randomUUID())).rejects.toThrow('human approval');});
 it('consumes exactly one approval under concurrent requests',async()=>{const o=await prepared();const r=await Promise.allSettled(Array.from({length:12},()=>consumeApproval(database,actor,o.id,o.policy,crypto.randomUUID())));expect(r.filter(v=>v.status==='fulfilled')).toHaveLength(1);expect((await database.query('SELECT count(*)::int AS n FROM attempts WHERE order_id=$1',[o.id])).rows[0].n).toBe(1);});
 it('rejects reused approval',async()=>{const o=await prepared();await consumeApproval(database,actor,o.id,o.policy,crypto.randomUUID());await expect(consumeApproval(database,actor,o.id,o.policy,crypto.randomUUID())).rejects.toThrow('already been consumed');});
 it('rolls back approval consumption when idempotency key conflicts',async()=>{const a=await prepared(),b=await prepared(),key=crypto.randomUUID();await consumeApproval(database,actor,a.id,a.policy,key);await expect(consumeApproval(database,actor,b.id,b.policy,key)).rejects.toThrow();expect((await database.query('SELECT consumed_at FROM approvals WHERE order_id=$1',[b.id])).rows[0].consumed_at).toBeNull();expect((await getOrder(database,b.id)).state).toBe('APPROVED');});
 it('blocks another merchant from accessing the order',async()=>{const o=await prepared();await expect(getOrder(database,o.id,{...actor,merchantId:'other-merchant',buyerId:'other'})).rejects.toThrow('another session');});
 it('blocks bearer-token approval even for the owning buyer',async()=>{const o=await propose(database,actor,{productId:actor.merchantId+'-field-notes',maxSourceAmount:'11000000',refundAddress:DEMO_WALLET});await expect(approve(database,{...actor,authKind:'bearer',role:'agent'},o.id,o.fingerprint)).rejects.toThrow('human buyer');});
 it('lets the authenticated human owner approve an agent proposal',async()=>{const agent={...actor,buyerId:'agent-buyer',role:'agent' as const,authKind:'bearer' as const};const o=await propose(database,agent,{productId:actor.merchantId+'-field-notes',maxSourceAmount:'11000000',refundAddress:DEMO_WALLET});await expect(approve(database,actor,o.id,o.fingerprint)).resolves.toMatchObject({approved:true});});
 it('rejects changed stored product bytes before consumption',async()=>{const o=await prepared();await database.query('UPDATE products SET artifact_hash=$1 WHERE id=$2',['b'.repeat(64),o.product_id]);await expect(consumeApproval(database,actor,o.id,o.policy,crypto.randomUUID())).rejects.toThrow('terms changed');await database.query('UPDATE products SET artifact_hash=$1 WHERE id=$2',[o.policy.artifactSha256,o.product_id]);});
});
describe('durable exactly-once entitlement issuance',()=>{
 it('creates one entitlement for qualifying evidence',async()=>{const r=await ready();const result=await qualifyAndFulfill(database,'demo',r.attemptId,r.evidence,crypto.randomUUID(),{fixture:true});expect(result.created).toBe(true);expect((await database.query('SELECT count(*)::int AS n FROM entitlements WHERE order_id=$1',[r.order.id])).rows[0].n).toBe(1);});
 it('handles sequential retries without additional entitlements',async()=>{const r=await ready();for(let i=0;i<8;i++)await qualifyAndFulfill(database,'demo',r.attemptId,r.evidence,'seq-'+r.order.id+i,{});expect((await database.query('SELECT count(*)::int AS n FROM entitlements WHERE order_id=$1',[r.order.id])).rows[0].n).toBe(1);});
 it('handles twenty concurrent deliveries with real SQL constraints',async()=>{const r=await ready();const outcomes=await Promise.all(Array.from({length:20},(_,i)=>qualifyAndFulfill(database,'demo',r.attemptId,r.evidence,`concurrent:${r.order.id}:${i%10}`,{})));expect(outcomes.filter(x=>x.created)).toHaveLength(1);expect((await database.query('SELECT count(*)::int AS n FROM entitlements WHERE order_id=$1',[r.order.id])).rows[0].n).toBe(1);expect((await database.query("SELECT count(*)::int AS n FROM events WHERE order_id=$1 AND kind='settlement.notification'",[r.order.id])).rows[0].n).toBe(10);});
 it('blocks missing required evidence',async()=>{const r=await ready();await expect(qualifyAndFulfill(database,'demo',r.attemptId,{...r.evidence,verified:false,reasons:['missing chain evidence']},crypto.randomUUID(),{})).rejects.toThrow('did not pass');expect((await database.query('SELECT count(*)::int AS n FROM entitlements WHERE order_id=$1',[r.order.id])).rows[0].n).toBe(0);});
 it('blocks synthetic evidence from live fulfillment',async()=>{const r=await ready();await expect(qualifyAndFulfill(database,'live',r.attemptId,r.evidence,crypto.randomUUID(),{})).rejects.toThrow('environments');});
 it('rolls back a settlement and audit insert if artifact integrity fails',async()=>{const r=await ready();const p=(await database.query('SELECT artifact FROM products WHERE id=$1',[r.order.product_id])).rows[0];await database.query('UPDATE products SET artifact=$1 WHERE id=$2',['corrupt bytes',r.order.product_id]);await expect(qualifyAndFulfill(database,'demo',r.attemptId,r.evidence,'rollback:'+r.order.id,{})).rejects.toThrow('approved artifact');expect((await database.query('SELECT count(*)::int AS n FROM settlements WHERE attempt_id=$1',[r.attemptId])).rows[0].n).toBe(0);expect((await database.query('SELECT count(*)::int AS n FROM events WHERE external_key=$1',['rollback:'+r.order.id])).rows[0].n).toBe(0);await database.query('UPDATE products SET artifact=$1 WHERE id=$2',[p.artifact,r.order.product_id]);});
 it('prevents the same destination transfer from settling two attempts',async()=>{const a=await ready(),b=await ready();await qualifyAndFulfill(database,'demo',a.attemptId,a.evidence,crypto.randomUUID(),{});await expect(qualifyAndFulfill(database,'demo',b.attemptId,a.evidence,crypto.randomUUID(),{})).rejects.toThrow();expect((await getOrder(database,b.order.id)).state).toBe('AWAITING_DEPOSIT');});
 it('retries the outbox worker without duplicating the Passport',async()=>{const r=await ready();await qualifyAndFulfill(database,'demo',r.attemptId,r.evidence,crypto.randomUUID(),{});await drainOutbox(database);const first=await issuePassport(database,r.order.id);await database.query('UPDATE outbox SET delivered_at=NULL WHERE order_id=$1',[r.order.id]);await drainOutbox(database);expect(await issuePassport(database,r.order.id)).toEqual(first);});
 it('persists entitlements across closing and reopening PostgreSQL',async()=>{const r=await ready();await qualifyAndFulfill(database,'demo',r.attemptId,r.evidence,crypto.randomUUID(),{});await database.close();database=await createDatabase(join(folder,'pg'));expect((await database.query('SELECT count(*)::int AS n FROM entitlements WHERE order_id=$1',[r.order.id])).rows[0].n).toBe(1);});
});
describe('Purchase Passport independent integrity verification',()=>{
 let doc:any,artifact:string;
 beforeAll(async()=>{const r=await ready();await qualifyAndFulfill(database,'demo',r.attemptId,r.evidence,crypto.randomUUID(),{});doc=await issuePassport(database,r.order.id);artifact=(await database.query('SELECT artifact FROM entitlements WHERE order_id=$1',[r.order.id])).rows[0].artifact;});
 it('verifies original signature, fingerprint and artifact bytes',()=>expect(verifyPassport(doc,{trustedKey:publicKeyPem(),artifact}).integrity).toBe('PASS'));
 it('labels synthetic chain settlement UNVERIFIED even when integrity passes',()=>expect(verifyPassport(doc,{trustedKey:publicKeyPem(),artifact}).settlement).toBe('UNVERIFIED'));
 it('rejects tampered JSON',()=>{const d=structuredClone(doc);d.payload.destination.recipient='substituted';expect(verifyPassport(d,{trustedKey:publicKeyPem(),artifact}).integrity).toBe('FAIL');});
 it('rejects tampered artifact',()=>expect(verifyPassport(doc,{trustedKey:publicKeyPem(),artifact:artifact+'x'}).integrity).toBe('FAIL'));
 it('rejects an incorrect transaction reference',()=>{const d=structuredClone(doc);d.payload.destination.transactionHash='0x'+'0'.repeat(64);const v=verifyPassport(d,{trustedKey:publicKeyPem(),artifact});expect(v.checks.find(x=>x.name==='Settlement binding')?.pass).toBe(false);});
 it('does not trust a self-supplied issuer key as identity',()=>expect(verifyPassport(doc,{artifact}).integrity).toBe('FAIL'));
 it('requires actual artifact bytes for a complete integrity verdict',()=>expect(verifyPassport(doc,{trustedKey:publicKeyPem()}).integrity).toBe('FAIL'));
 it('fails closed on malformed receipts',()=>expect(verifyPassport({payload:{}}).integrity).toBe('FAIL'));
 it('matches the expected artifact digest',()=>expect(sha256(artifact)).toBe(doc.payload.approvedTerms.artifactSha256));
});
describe('judge challenge invokes the real lifecycle',()=>{
 it('executes all five attacks against isolated persistent records',async()=>{const o=await prepared();for(const attack of ['merchant','price','reuse','replay','tamper']){const result=await runChallenge(database,actor,o.id,attack);expect(result.passed).toBe(true);}});
});
