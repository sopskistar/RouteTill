import {assertIsolatedStores} from '../src/db';
const required=['DATABASE_URL','DEMO_DATABASE_URL','PASSPORT_PRIVATE_KEY','APP_ORIGIN','JUDGE_ACCESS_CODE','CRON_SECRET','NEAR_INTENTS_JWT'];
let failed=false;
for(const name of required){const ok=!!process.env[name];console.log(`${ok?'PASS':'MISSING'} ${name}`);failed ||= !ok;}
try{assertIsolatedStores(process.env.DATABASE_URL,process.env.DEMO_DATABASE_URL);}catch{console.log('FAIL: live and demo database identities must differ');failed=true;}
if(process.env.APP_ORIGIN&&!process.env.APP_ORIGIN.startsWith('https://')){console.log('FAIL: production origin must use HTTPS');failed=true;}
console.log('Live payments:',process.env.ENABLE_LIVE_PAYMENTS==='true'?'owner-enabled':'disabled (safe default)');
console.log('Reconciliation schedule: confirm a Vercel plan or external scheduler supports a five-minute interval.');
console.log('No deployment, push, signing, or funds movement performed.');
process.exitCode=failed?1:0;
