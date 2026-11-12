import {generateKeyPairSync,randomBytes} from 'node:crypto';
import {existsSync,writeFileSync} from 'node:fs';
const secret=()=>randomBytes(32).toString('hex');
for(const mode of ['production','demo'] as const){
 const file=`.env.release-${mode}.local`;
 if(existsSync(file)){console.log(`PRESERVED ${file}; no values printed.`);continue;}
 const key=generateKeyPairSync('ed25519').privateKey.export({type:'pkcs8',format:'pem'}).toString().replace(/\n/g,'\\n');
 const demo=mode==='demo';
 const rows=[`# Private ${mode} configuration. Never commit or share this file.`,`${demo?'DEMO_DATABASE_URL':'DATABASE_URL'}=`,`${demo?'DEMO_PASSPORT_PRIVATE_KEY':'PASSPORT_PRIVATE_KEY'}="${key}"`,
  `NEAR_INTENTS_JWT=${process.env.NEAR_INTENTS_JWT||''}`,'APP_ORIGIN=',`ENABLE_JUDGE_DEMO=${demo}`, 'ENABLE_LIVE_PAYMENTS=false',`CRON_SECRET=${secret()}`,
  ...(demo?[`JUDGE_ACCESS_CODE=${secret()}`]:['DEMO_APP_URL=']), 'RECONCILE_WEBHOOK_SECRET=','BASE_RPC_URL=https://mainnet.base.org','ARBITRUM_RPC_URL=https://arb1.arbitrum.io/rpc','NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=',''];
 writeFileSync(file,rows.join('\n'),{mode:0o600,flag:'wx'});
 console.log(`CREATED ${file} (0600). Add its Neon connection and actual application origin in your editor. Signing identities and cron credentials are distinct; values were not printed.`);
}
