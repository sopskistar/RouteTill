import {readFileSync,existsSync,mkdirSync,writeFileSync} from 'node:fs';
import {parseEnv} from 'node:util';
import {randomUUID} from 'node:crypto';
import assert from 'node:assert/strict';
import {Pool} from 'pg';
import {assertIsolatedStores,createDatabase,migrate,Database} from '../src/db';
import {prepareLab,runChallenge} from '../src/services/lab';
import {approve,consumeApproval,getOrder} from '../src/services/orders';
import {Actor} from '../src/core/types';
import {sha256} from '../src/core/crypto';
const local=(file:string)=>existsSync(file)?parseEnv(readFileSync(file,'utf8')):{};
const live=local('.env.release-production.local'),demo=local('.env.release-demo.local');
const urls={production:process.env.DATABASE_URL||live.DATABASE_URL,demo:process.env.DEMO_DATABASE_URL||demo.DEMO_DATABASE_URL};
assert(!process.env.VERCEL,'Run this release test locally, outside a hosted request.');
assert(urls.production&&urls.demo,'Configure DATABASE_URL in .env.release-production.local and DEMO_DATABASE_URL in .env.release-demo.local. No local fallback is allowed.');
assertIsolatedStores(urls.production,urls.demo);
for(const value of Object.values(urls)){const u=new URL(value!);assert(/\.neon\.tech$/.test(u.hostname),'This command requires actual Neon endpoints.');assert(['require','verify-full','verify-ca'].includes(u.searchParams.get('sslmode')||''),'Neon TLS is required.');}
process.env.DEMO_PASSPORT_PRIVATE_KEY ||= demo.DEMO_PASSPORT_PRIVATE_KEY;
assert(process.env.DEMO_PASSPORT_PRIVATE_KEY,'Configure the distinct demo Passport signing key.');
const report:any={testedAt:new Date().toISOString(),backend:'Real Neon PostgreSQL',productionOrdersTouched:false,mainnetSettlement:'UNVERIFIED',stores:[]};
for(const [name,url] of Object.entries(urls)){
 const namespace='rt_release_test_'+randomUUID().replaceAll('-','');
 const admin=new Pool({connectionString:url,max:1,connectionTimeoutMillis:15000});let database:Database|undefined;
 try{
  const version=(await admin.query('SELECT version() AS version')).rows[0].version;
  // Idempotent application migrations; test purchases themselves live only in our generated schema.
  await migrate(admin);await admin.query(`CREATE SCHEMA "${namespace}"`);
  database=await createDatabase(url!,namespace);await migrate(database);
  const actor:Actor={merchantId:'neon-release-test',buyerId:'neon-release-buyer',mode:'demo',role:'judge',authKind:'cookie',sessionHash:'isolated-release-test'};
  const order=await prepareLab(database,actor);await approve(database,actor,order.id,order.fingerprint);
  const consumption=await Promise.allSettled(Array.from({length:12},()=>consumeApproval(database!,actor,order.id,order.policy,randomUUID())));
  assert.equal(consumption.filter(v=>v.status==='fulfilled').length,1,'Concurrent approval consumption');
  const attacks:any[]=[];
  const challengeOrder=await prepareLab(database,actor);
  for(const attack of ['merchant','price','reuse','replay','tamper']){const r=await runChallenge(database,actor,challengeOrder.id,attack);assert(r.passed,attack);attacks.push({attack,passed:r.passed,...('storedEntitlements' in r?{storedEntitlements:r.storedEntitlements,deliveries:r.deliveries,concurrentDeliveries:r.concurrentDeliveries}:{} )});}
  const rollbackOrder=await prepareLab(database,actor);await approve(database,actor,rollbackOrder.id,rollbackOrder.fingerprint);
  const key=(await database.query('SELECT idempotency_key FROM attempts WHERE order_id=$1',[order.id])).rows[0].idempotency_key;
  await assert.rejects(consumeApproval(database,actor,rollbackOrder.id,rollbackOrder.policy,key));
  assert.equal((await getOrder(database,rollbackOrder.id)).state,'APPROVED');
  assert.equal((await database.query('SELECT consumed_at FROM approvals WHERE order_id=$1',[rollbackOrder.id])).rows[0].consumed_at,null);
  await assert.rejects(getOrder(database,challengeOrder.id,{...actor,merchantId:'unrelated',buyerId:'unrelated'}));
  await database.close();database=await createDatabase(url!,namespace);
  const count=(await database.query('SELECT count(*)::int AS n FROM entitlements WHERE order_id=$1',[challengeOrder.id])).rows[0].n;assert.equal(count,1);
  report.stores.push({name,identityHash:sha256(new URL(url!).hostname.replace('-pooler.','.')+new URL(url!).pathname),version,migrations:'PASS',concurrentApprovalRequests:12,acceptedApprovals:1,rollback:'PASS',merchantIsolation:'PASS',persistentEntitlementCount:count,attacks});
  console.log(`PASS ${name}: Neon migrations, 12 concurrent approval requests, all five challenges, replay 20 → 1, rollback, isolation and reconnect persistence.`);
 }finally{await database?.close();await admin.query(`DROP SCHEMA IF EXISTS "${namespace}" CASCADE`);await admin.end();}
}
mkdirSync('docs/evidence',{recursive:true});writeFileSync('docs/evidence/neon-verification.json',JSON.stringify(report,null,2));
console.log('Saved sanitized Neon evidence. No real purchase, blockchain settlement or funds movement was performed.');
