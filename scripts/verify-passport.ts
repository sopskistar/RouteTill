import {readFileSync} from 'node:fs';
import {verifyPassport} from '../src/core/verifier';
import {chainFacts} from '../src/integrations/settlement';
const args=process.argv.slice(2);const path=args[0];
function option(name:string){const i=args.indexOf(name);return i>=0?args[i+1]:undefined;}
if(!path){console.error('Usage: npm run verify -- passport.json --key trusted-public-key.pem --artifact product.md [--rpc https://trusted-base-rpc]');process.exit(1);}
const document=JSON.parse(readFileSync(path,'utf8'));
const key=option('--key'),artifact=option('--artifact'),rpc=option('--rpc');
if(rpc)process.env.BASE_RPC_URL=rpc;
let facts;try{if(rpc&&document.payload.mode==='live')facts=await chainFacts(document.payload.destination.transactionHash);}catch{console.error('Independent RPC unavailable; settlement remains UNVERIFIED.');}
const result=verifyPassport(document,{trustedKey:key?readFileSync(key,'utf8'):undefined,artifact:artifact?readFileSync(artifact):undefined,chainFacts:facts});
console.log(JSON.stringify(result,null,2));
process.exitCode=result.integrity==='FAIL'?1:document.payload.mode==='live'&&result.settlement==='UNVERIFIED'?2:0;
