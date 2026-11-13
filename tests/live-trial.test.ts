import {afterAll,afterEach,beforeAll,beforeEach,describe,expect,it,vi} from 'vitest';
import {generateKeyPairSync,randomUUID} from 'node:crypto';
import {mkdtemp,rm} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {createDatabase,Database} from '../src/db';
import {Actor,Order,Policy} from '../src/core/types';
import {fingerprint,sha256} from '../src/core/crypto';
import {LiveTrial} from '../src/core/live-trial';
import {ARB_USDC} from '../src/core/policy';
import {approve,consumeApproval,execute,getOrder,propose} from '../src/services/orders';
import {createProduct} from '../src/services/catalog';
import {RESOURCE_ARTIFACT} from '../src/core/resource';
import {quote,status} from '../src/integrations/near';
import {inspectTransfer,syntheticFacts,verifyDestination} from '../src/integrations/settlement';
import {reconcile} from '../src/services/reconcile';

// No provider or blockchain network calls: preparation, SQL and guards are real;
// executable quote and finalized chain observations are isolated test fixtures.
vi.mock('../src/integrations/near',()=>({quote:vi.fn(),status:vi.fn()}));
vi.mock('../src/integrations/settlement',async importOriginal=>({
  ...await importOriginal<typeof import('../src/integrations/settlement')>(),verifyDestination:vi.fn(),
}));
const quoteMock=vi.mocked(quote),statusMock=vi.mocked(status),destinationMock=vi.mocked(verifyDestination);
let database:Database,folder:string,productId:string;
const actor:Actor={merchantId:randomUUID(),buyerId:randomUUID(),mode:'live',role:'merchant',authKind:'cookie',sessionHash:'trial-test'};
const recipient='0x1111111111111111111111111111111111111111';
const buyer='0x2222222222222222222222222222222222222222';
let trial:LiveTrial;
beforeAll(async()=>{
  folder=await mkdtemp(join(tmpdir(),'routetill-trial-'));
  database=await createDatabase(join(folder,'pg'));
  await database.query('INSERT INTO merchants(id,email,name,wallet,wallet_verified) VALUES($1,$2,$3,$4,true)',[actor.merchantId,'trial@example.invalid','Trial test merchant',recipient]);
  productId=(await createProduct(database,actor,{title:'Agent Purchase Test Vectors',description:'Isolated test bytes for trial enforcement',price:'10',artifact:RESOURCE_ARTIFACT})).id;
});
afterAll(async()=>{await database.close();await rm(folder,{recursive:true,force:true});});
beforeEach(()=>{
  vi.stubEnv('VERCEL','');vi.stubEnv('ENABLE_LIVE_PAYMENTS','true');vi.stubEnv('LIVE_PAYMENT_TRIAL','');
  quoteMock.mockReset().mockImplementation(async p=>({
    request:{dry:false,swapType:'EXACT_OUTPUT',slippageTolerance:100,originAsset:p.sourceAsset,destinationAsset:p.destinationAsset,
      amount:p.destinationAmount,depositType:'ORIGIN_CHAIN',recipientType:'DESTINATION_CHAIN',refundType:'ORIGIN_CHAIN',
      recipient:p.recipient as `0x${string}`,refundTo:p.refundAddress as `0x${string}`,deadline:p.expiresAt},
    response:{quote:{depositAddress:'0x'+sha256(p.authorizationId).slice(0,40),amountIn:'10105478',amountOut:'10000000',deadline:p.expiresAt,timeWhenInactive:p.expiresAt}},
    verification:{signatureVerified:true,checkedAt:new Date().toISOString(),dry:false,limitations:[]},
  }));
  statusMock.mockReset();destinationMock.mockReset();
});
afterEach(()=>vi.unstubAllEnvs());
async function prepared(changes:Partial<Policy>={},purchaser=actor){
  let o=await propose(database,purchaser,{productId,maxSourceAmount:'11000000',refundAddress:buyer});
  if(Object.keys(changes).length){const p={...o.policy,...changes};await database.query('UPDATE orders SET policy=$1,fingerprint=$2 WHERE id=$3',[JSON.stringify(p),fingerprint(p),o.id]);o=await getOrder(database,o.id);}
  await approve(database,actor,o.id,o.fingerprint);
  trial={orderId:o.id,policyFingerprint:o.fingerprint,authorizationId:o.policy.authorizationId,
    merchantId:actor.merchantId,buyerId:purchaser.buyerId,approverBuyerId:actor.buyerId,productId,
    recipient,buyerAddress:buyer,refundAddress:buyer,artifactSha256:sha256(RESOURCE_ARTIFACT),expiresAt:o.policy.expiresAt};
  configure();return o;
}
function configure(changes:Partial<LiveTrial>={}){vi.stubEnv('LIVE_PAYMENT_TRIAL',JSON.stringify({...trial,...changes}));}
const prepare=(o:Order,purchaser=actor,key=randomUUID())=>execute(database,purchaser,o.id,o.policy,key);
async function rejected(o:Order,code:string,invoke:()=>Promise<unknown>=()=>prepare(o)){
  await expect(invoke()).rejects.toMatchObject({code});
  expect(quoteMock).not.toHaveBeenCalled();
  expect((await database.query('SELECT consumed_at FROM approvals WHERE order_id=$1',[o.id])).rows[0].consumed_at).toBeNull();
  expect((await database.query('SELECT count(*)::int AS n FROM attempts WHERE order_id=$1',[o.id])).rows[0].n).toBe(0);
  expect((await getOrder(database,o.id)).state).toBe('APPROVED');
}

describe('single production purchase trial — transactional preparation',()=>{
  it('prepares exactly the configured human-approved purchase',async()=>{
    const o=await prepared();const result=await prepare(o);
    expect(quoteMock).toHaveBeenCalledExactlyOnceWith(o.policy,false);
    expect(result.response.quote.amountIn).toBe('10105478');
    const a=(await database.query('SELECT * FROM approvals WHERE order_id=$1',[o.id])).rows[0];
    expect(a.consumed_at).not.toBeNull();
    const attempt=(await database.query('SELECT * FROM attempts WHERE order_id=$1',[o.id])).rows[0];
    expect(attempt.state).toBe('AWAITING_DEPOSIT');expect(attempt.deposit_address).toBe(result.response.quote.depositAddress);
    expect(attempt.source_tx).toBeNull();
  });
  it.each([
    ['orderId',():string=>randomUUID(),'TRIAL_SCOPE'],['policyFingerprint',():string=>'b'.repeat(64),'TRIAL_SCOPE'],
    ['authorizationId',():string=>randomUUID(),'TRIAL_TERMS'],['merchantId',():string=>randomUUID(),'TRIAL_TERMS'],
    ['buyerId',():string=>randomUUID(),'TRIAL_TERMS'],['approverBuyerId',():string=>randomUUID(),'TRIAL_AUTHORIZATION'],
    ['productId',():string=>randomUUID(),'TRIAL_TERMS'],['recipient',():string=>buyer,'TRIAL_TERMS'],
    ['artifactSha256',():string=>'b'.repeat(64),'TRIAL_TERMS'],
    ['expiresAt',():string=>new Date(Date.now()+60000).toISOString(),'TRIAL_TERMS'],
  ] as const)('rejects mismatched configured %s without a provider request',async(field,value,code)=>{
    const o=await prepared();configure({[field]:value()});await rejected(o,code);
  });
  it('rejects a substituted configured buyer/refund pair',async()=>{
    const o=await prepared();configure({buyerAddress:recipient,refundAddress:recipient});await rejected(o,'TRIAL_TERMS');
  });
  it('rejects another authenticated buyer',async()=>{
    const o=await prepared();await rejected(o,'BUYER_REQUIRED',()=>prepare(o,{...actor,buyerId:randomUUID()}));
  });
  it('rejects another merchant identity even with the buyer identifier',async()=>{
    const o=await prepared();await rejected(o,'TRIAL_TERMS',()=>prepare(o,{...actor,merchantId:randomUUID()}));
  });
  it.each([
    ['source chain',{sourceChain:1}],['destination chain',{destinationChain:1}],
    ['source token',{sourceAsset:'nep141:arb-bridged-usdc.omft.near'}],['destination asset',{destinationAsset:ARB_USDC}],
    ['destination token',{destinationToken:recipient}],['destination amount',{destinationAmount:'10000001'}],
    ['higher ceiling',{maxSourceAmount:'11000001'}],['different ceiling',{maxSourceAmount:'10999999'}],
  ] as const)('rejects even a pinned, human-approved wrong %s',async(_name,changes)=>{
    const o=await prepared(changes);await rejected(o,'TRIAL_ROUTE');
  });
  it('rejects a human-approved substituted refund address',async()=>{
    const o=await prepared({refundAddress:recipient});await rejected(o,'TRIAL_TERMS');
  });
  it('rejects a different requested policy before consuming the pinned approval',async()=>{
    const o=await prepared();await rejected(o,'POLICY_MISMATCH',()=>execute(database,actor,o.id,{...o.policy,artifactSha256:'b'.repeat(64)},randomUUID()));
  });
  it.each(['', '{}','not-json','[]'])('fails closed for missing or malformed configuration %j',async config=>{
    const o=await prepared();vi.stubEnv('LIVE_PAYMENT_TRIAL',config);await rejected(o,'TRIAL_CONFIGURATION');
  });
  it('rejects an array containing an otherwise valid trial',async()=>{
    const o=await prepared();vi.stubEnv('LIVE_PAYMENT_TRIAL',JSON.stringify([trial]));await rejected(o,'TRIAL_CONFIGURATION');
  });
  it('rejects unknown configuration fields and wildcard extensions',async()=>{
    const o=await prepared();vi.stubEnv('LIVE_PAYMENT_TRIAL',JSON.stringify({...trial,allowAll:true}));await rejected(o,'TRIAL_CONFIGURATION');
  });
  it('rejects internally inconsistent buyer/refund configuration',async()=>{
    const o=await prepared();configure({buyerAddress:recipient});await rejected(o,'TRIAL_CONFIGURATION');
  });
  it('rejects expired trial configuration',async()=>{
    const o=await prepared();configure({expiresAt:new Date(Date.now()-1).toISOString()});await rejected(o,'TRIAL_EXPIRED');
  });
  it('rejects an expired persisted policy',async()=>{
    const o=await prepared();const p={...o.policy,expiresAt:new Date(Date.now()-1).toISOString()};
    await database.query('UPDATE orders SET policy=$1,fingerprint=$2 WHERE id=$3',[JSON.stringify(p),fingerprint(p),o.id]);
    await rejected(o,'APPROVAL_EXPIRED',()=>execute(database,actor,o.id,p,randomUUID()));
  });
  it('rejects an expired approval row',async()=>{
    const o=await prepared();await database.query("UPDATE approvals SET expires_at=now()-interval '1 minute' WHERE order_id=$1",[o.id]);await rejected(o,'APPROVAL_EXPIRED');
  });
  it('does not consume approval if expiry occurs during the product database read',async()=>{
    const o=await prepared(),clock=vi.spyOn(Date,'now');
    const delayed:Database={...database,transaction:fn=>database.transaction(sql=>fn({query:async(q,v)=>{
      const result=await sql.query(q,v);
      if(q.startsWith('SELECT p.*,m.name'))clock.mockReturnValue(Date.parse(o.policy.expiresAt)+1);
      return result;
    }}))};
    try{await rejected(o,'TRIAL_EXPIRED',()=>execute(delayed,actor,o.id,o.policy,randomUUID()));}finally{clock.mockRestore();}
  });
  it('does not call the provider if expiry occurs while committing valid consumption',async()=>{
    const o=await prepared(),clock=vi.spyOn(Date,'now');
    const delayed:Database={...database,transaction:async fn=>{
      const result=await database.transaction(fn);clock.mockReturnValue(Date.parse(o.policy.expiresAt)+1);return result;
    }};
    try{
      await expect(execute(delayed,actor,o.id,o.policy,randomUUID())).rejects.toMatchObject({code:'APPROVAL_EXPIRED'});
      expect(quoteMock).not.toHaveBeenCalled();expect((await getOrder(database,o.id)).state).toBe('FAILED');
      expect((await database.query('SELECT deposit_address FROM attempts WHERE order_id=$1',[o.id])).rows[0].deposit_address).toBeNull();
    }finally{clock.mockRestore();}
  });
  it('rejects approval fingerprint or authorization tampering',async()=>{
    const o=await prepared();await database.query('UPDATE approvals SET fingerprint=$1 WHERE order_id=$2',['b'.repeat(64),o.id]);await rejected(o,'TRIAL_AUTHORIZATION');
  });
  it('rejects a missing human authorization',async()=>{
    const o=await prepared();await database.query('DELETE FROM approvals WHERE order_id=$1',[o.id]);
    await expect(prepare(o)).rejects.toMatchObject({code:'HUMAN_REQUIRED'});expect(quoteMock).not.toHaveBeenCalled();
    expect((await database.query('SELECT count(*)::int AS n FROM attempts WHERE order_id=$1',[o.id])).rows[0].n).toBe(0);
  });
  it('rejects already-consumed authorization',async()=>{
    const o=await prepared();await prepare(o);quoteMock.mockClear();
    await expect(prepare(o)).rejects.toMatchObject({code:'APPROVAL_REUSED'});expect(quoteMock).not.toHaveBeenCalled();
    expect((await database.query('SELECT count(*)::int AS n FROM attempts WHERE order_id=$1',[o.id])).rows[0].n).toBe(1);
  });
  it('fails with the live flag disabled, including direct approval-consumption access',async()=>{
    const o=await prepared();vi.stubEnv('ENABLE_LIVE_PAYMENTS','false');await rejected(o,'LIVE_DISABLED');
    await rejected(o,'LIVE_DISABLED',()=>consumeApproval(database,actor,o.id,o.policy,randomUUID()));
  });
  it('does not bypass the trial guard via direct approval consumption',async()=>{
    const o=await prepared();vi.stubEnv('LIVE_PAYMENT_TRIAL','');await rejected(o,'TRIAL_CONFIGURATION',()=>consumeApproval(database,actor,o.id,o.policy,randomUUID()));
  });
  it('blocks demo execution regardless of the flag and trial configuration',async()=>{
    const o=await prepared();await rejected(o,'DEMO_PAYMENT_BLOCKED',()=>prepare(o,{...actor,mode:'demo'}));
  });
  it('blocks live preparation on a hosted demo deployment',async()=>{
    const o=await prepared();vi.stubEnv('VERCEL','1');vi.stubEnv('DATABASE_URL','');vi.stubEnv('DEMO_DATABASE_URL','present');vi.stubEnv('ENABLE_LIVE_PAYMENTS','false');
    await rejected(o,'LIVE_DISABLED');
    await expect(consumeApproval(database,actor,o.id,o.policy,randomUUID())).rejects.toMatchObject({code:'ENVIRONMENT_DISABLED'});
    expect(quoteMock).not.toHaveBeenCalled();
  });
  it('requires the merchant ownership record to remain verified',async()=>{
    const o=await prepared();await database.query('UPDATE merchants SET wallet_verified=false WHERE id=$1',[actor.merchantId]);
    try{await rejected(o,'WALLET_UNVERIFIED');}finally{await database.query('UPDATE merchants SET wallet_verified=true WHERE id=$1',[actor.merchantId]);}
  });
  it('checks actual artifact bytes before consumption',async()=>{
    const o=await prepared();await database.query('UPDATE products SET artifact=$1 WHERE id=$2',['changed bytes',productId]);
    try{await rejected(o,'ARTIFACT_MISMATCH');}finally{await database.query('UPDATE products SET artifact=$1 WHERE id=$2',[RESOURCE_ARTIFACT,productId]);}
  });
  it('supports scoped agent execution only after the human owner approves',async()=>{
    const agent={...actor,buyerId:randomUUID(),role:'agent' as const,authKind:'bearer' as const};const o=await prepared({},agent);
    await expect(prepare(o,agent)).resolves.toHaveProperty('attemptId');expect(quoteMock).toHaveBeenCalledTimes(1);
  });
  it('permits one preparation across twelve concurrent executions',async()=>{
    const o=await prepared();const result=await Promise.allSettled(Array.from({length:12},()=>prepare(o)));
    expect(result.filter(r=>r.status==='fulfilled')).toHaveLength(1);expect(quoteMock).toHaveBeenCalledTimes(1);
    expect((await database.query('SELECT count(*)::int AS n FROM attempts WHERE order_id=$1',[o.id])).rows[0].n).toBe(1);
  });
  it('does not duplicate a provider request for the same idempotency key',async()=>{
    const o=await prepared(),key=randomUUID();await prepare(o,actor,key);await expect(prepare(o,actor,key)).rejects.toMatchObject({code:'APPROVAL_REUSED'});
    expect(quoteMock).toHaveBeenCalledTimes(1);
  });
  it('rolls back consumption and calls no provider on an idempotency-key collision',async()=>{
    const key=randomUUID(),a=await prepared();await prepare(a,actor,key);const b=await prepared();quoteMock.mockClear();
    await expect(prepare(b,actor,key)).rejects.toThrow();expect(quoteMock).not.toHaveBeenCalled();
    expect((await database.query('SELECT consumed_at FROM approvals WHERE order_id=$1',[b.id])).rows[0].consumed_at).toBeNull();expect((await getOrder(database,b.id)).state).toBe('APPROVED');
  });
  it('does not retry a failed provider quote with the consumed authorization',async()=>{
    const o=await prepared();quoteMock.mockRejectedValueOnce(new Error('Sanitized provider test failure'));
    await expect(prepare(o)).rejects.toThrow('provider test failure');await expect(prepare(o)).rejects.toMatchObject({code:'APPROVAL_REUSED'});
    expect(quoteMock).toHaveBeenCalledTimes(1);expect((await getOrder(database,o.id)).state).toBe('FAILED');
  });
  it('keeps reconciliation and fulfillment working after new preparation is disabled',async()=>{
    const o=await prepared(),r=await prepare(o);const source='0x'+'3'.repeat(64);
    await database.query('UPDATE attempts SET source_tx=$1 WHERE id=$2',[source,r.attemptId]);
    const facts=syntheticFacts(o.policy,o.id),evidence=inspectTransfer(o.policy,facts.receipt.transactionHash,facts);
    evidence.providerAssociation='test-provider-association';
    destinationMock.mockResolvedValue(evidence);statusMock.mockResolvedValue({status:'SUCCESS',updatedAt:new Date().toISOString()});
    vi.stubEnv('ENABLE_LIVE_PAYMENTS','false');vi.stubEnv('LIVE_PAYMENT_TRIAL','');
    // Ephemeral test-only identity; no existing local or hosted signing key is read or changed.
    vi.stubEnv('PASSPORT_PRIVATE_KEY',generateKeyPairSync('ed25519').privateKey.export({type:'pkcs8',format:'pem'}).toString());
    await expect(reconcile(database,r.attemptId)).resolves.toMatchObject({created:true});
    expect((await getOrder(database,o.id)).state).toBe('FULFILLED');
    expect((await database.query('SELECT count(*)::int AS n FROM entitlements WHERE order_id=$1',[o.id])).rows[0].n).toBe(1);
    expect((await database.query('SELECT count(*)::int AS n FROM passports WHERE order_id=$1',[o.id])).rows[0].n).toBe(1);
    expect(quoteMock).toHaveBeenCalledTimes(1);
  });
});
