import {createPrivateKey,createPublicKey} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {deploymentMode} from '../src/core/deployment';
import {assertIsolatedStores} from '../src/db';
import {liveTrialConfiguration} from '../src/core/live-trial';
const mode=process.argv.includes('--demo')?'demo':'live';
const required=mode==='demo'?['DEMO_DATABASE_URL','DEMO_PASSPORT_PRIVATE_KEY','APP_ORIGIN','JUDGE_ACCESS_CODE','CRON_SECRET','NEAR_INTENTS_JWT']:['DATABASE_URL','PASSPORT_PRIVATE_KEY','APP_ORIGIN','CRON_SECRET','NEAR_INTENTS_JWT'];
let failed=false;
const check=(ok:boolean,label:string)=>{console.log(`${ok?'PASS':'FAIL'} ${label}`);failed ||= !ok;};
for(const name of required)check(!!process.env[name],`${name} configured`);
try{check(deploymentMode({...process.env,VERCEL:'1'})===mode,'single-store deployment isolation');assertIsolatedStores(process.env.DATABASE_URL,process.env.DEMO_DATABASE_URL);}catch{check(false,'single-store deployment isolation');}
try{const u=new URL(process.env.APP_ORIGIN||'');check(u.protocol==='https:'&&!u.username&&!u.password&&u.pathname==='/'&&!u.search&&!u.hash,'APP_ORIGIN is an HTTPS origin');}catch{check(false,'APP_ORIGIN is an HTTPS origin');}
for(const key of ['CRON_SECRET',...(mode==='demo'?['JUDGE_ACCESS_CODE']:[])])check((process.env[key]?.length||0)>=32,`${key} has at least 32 characters`);
try{const value=process.env[mode==='demo'?'DEMO_PASSPORT_PRIVATE_KEY':'PASSPORT_PRIVATE_KEY']||'';const key=createPrivateKey(value.replace(/\\n/g,'\n'));check(key.asymmetricKeyType==='ed25519','Ed25519 Passport signing identity');const other=process.env[mode==='demo'?'PASSPORT_PRIVATE_KEY':'DEMO_PASSPORT_PRIVATE_KEY'];if(other)check(!createPublicKey(key).export({type:'spki',format:'der'}).equals(createPublicKey(createPrivateKey(other.replace(/\\n/g,'\n'))).export({type:'spki',format:'der'})),'separate signing identities');}catch{check(false,'Ed25519 Passport signing identity');}
try{const v=JSON.parse(readFileSync('vercel.json','utf8'));check(v.crons?.length===1&&v.crons[0].schedule==='0 3 * * *','Hobby-compatible daily fallback');}catch{check(false,'Vercel configuration');}
check(mode!=='demo'||process.env.ENABLE_LIVE_PAYMENTS!=='true','demo cannot authorize live payment');
if(mode==='live'&&process.env.ENABLE_LIVE_PAYMENTS==='true'){
 try{const trial=liveTrialConfiguration();check(Date.parse(trial.expiresAt)>Date.now(),'single-order trial configuration is complete and unexpired');}
 catch{check(false,'single-order trial configuration is complete and unexpired');}
}
console.log(`Live deposits: ${process.env.ENABLE_LIVE_PAYMENTS==='true'?'ENABLED — owner authorization still required in wallet':'disabled'}.`);
console.log('Neon connectivity/concurrency, external scheduler activation and real wallet confirmation are separate checks. No deployment, signing, or funds movement performed.');
process.exitCode=failed?1:0;
