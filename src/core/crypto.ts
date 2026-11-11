import {createHash,createPrivateKey,createPublicKey,generateKeyPairSync,sign,verify} from 'node:crypto';
import {existsSync,mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
export function canonical(value:unknown):string {
  if(value instanceof Date)return JSON.stringify(value.toISOString());
  if(value===null || typeof value!=='object')return JSON.stringify(value);
  if(Array.isArray(value))return '['+value.map(canonical).join(',')+']';
  const object=value as Record<string,unknown>;
  return '{'+Object.keys(object).sort().filter(k=>object[k]!==undefined).map(k=>JSON.stringify(k)+':'+canonical(object[k])).join(',')+'}';
}
export const sha256=(value:string|Buffer)=>createHash('sha256').update(value).digest('hex');
export const fingerprint=(value:unknown)=>sha256(canonical(value));
export function signingKey() {
  const configured=process.env.PASSPORT_PRIVATE_KEY;
  if(configured)return createPrivateKey(configured.replace(/\\n/g,'\n'));
  if(process.env.VERCEL)throw new Error('PASSPORT_PRIVATE_KEY is required on Vercel');
  const dir=join(process.cwd(),'data');mkdirSync(dir,{recursive:true});
  const path=join(dir,'passport-private.pem');
  if(!existsSync(path))writeFileSync(path,generateKeyPairSync('ed25519').privateKey.export({type:'pkcs8',format:'pem'}),{mode:0o600,flag:'wx'});
  return createPrivateKey(readFileSync(path));
}
export function publicKeyPem(){return createPublicKey(signingKey()).export({type:'spki',format:'pem'}).toString();}
export function signPayload(payload:unknown){return sign(null,Buffer.from(canonical(payload)),signingKey()).toString('base64');}
export function verifyPayload(payload:unknown,signature:string,key:string){try{return verify(null,Buffer.from(canonical(payload)),key,Buffer.from(signature,'base64'));}catch{return false;}}
