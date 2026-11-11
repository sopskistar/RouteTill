import {verifyQuoteSignature} from '@defuse-protocol/one-click-sdk-typescript';
import {fingerprint,sha256,verifyPayload} from './crypto';
import {inspectTransfer,ChainFacts} from '../integrations/settlement';
import {checkQuote} from '../integrations/near';
export type Verification={integrity:'PASS'|'FAIL';settlement:'UNVERIFIED'|'INDEPENDENTLY_OBSERVED';checks:{name:string;pass:boolean;detail:string}[];synthetic:boolean};
export function verifyPassport(document:any,options:{trustedKey?:string;artifact?:Buffer|string;chainFacts?:ChainFacts}={}):Verification {
 const checks:Verification['checks']=[];
 const add=(name:string,pass:boolean,detail:string)=>checks.push({name,pass,detail});
 try{
  const p=document.payload,s=document.signature;
  add('Issuer key pinned',!!options.trustedKey&&options.trustedKey===s.publicKey,'Obtain the issuer key through a separate trusted channel.');
  add('Application signature',s.algorithm==='Ed25519'&&verifyPayload(p,s.value,options.trustedKey||s.publicKey),'Ed25519 protects the exported application assertions.');
  add('Purchase fingerprint',fingerprint(p.approvedTerms)===p.approvedTermsHash,'Canonical SHA-256 of approved terms.');
  add('Environment binding',p.mode===p.approvedTerms.mode&&p.settlement.kind===(p.mode==='demo'?'SYNTHETIC':'CHAIN'),'Synthetic evidence is never live evidence.');
  add('Delivery binding',p.fulfillment.artifactSha256===p.approvedTerms.artifactSha256,'Delivered digest must equal the approved digest.');
  add('Settlement binding',p.destination.transactionHash===p.settlement.txHash&&p.destination.recipient===p.approvedTerms.recipient&&p.destination.token===p.approvedTerms.destinationToken&&p.destination.chainId===p.approvedTerms.destinationChain&&p.destination.expectedAmount===p.approvedTerms.destinationAmount&&p.destination.actualAmount===p.settlement.actualAmount,'Transaction, recipient, asset, chain, and amounts stay linked.');
  if(p.mode==='live'){
   let valid=false;try{valid=verifyQuoteSignature(p.quoteEvidence.response);}catch{}
   add('Provider quote signature',valid,'Official SDK production manager key; this does not sign provider execution status.');
   const q=p.quoteEvidence.response;
   let terms=false;try{checkQuote(q,p.approvedTerms,false,Date.parse(q.timestamp),false);terms=true;}catch{}
   add('Quote policy binding',terms,'Executable quote must satisfy the original authorization at its quoted timestamp; a dry quote cannot prove execution.');
   add('Provider transaction association',p.providerEvidence?.status==='SUCCESS'&&fingerprint(p.providerEvidence.quoteResponse)===fingerprint(q)&&p.providerEvidence.swapDetails?.destinationChainTxHashes?.length===1&&p.providerEvidence.swapDetails.destinationChainTxHashes[0].hash===p.destination.transactionHash,'Association is a saved provider assertion, not a signed causal proof.');
  }else add('Synthetic disclosure',p.settlementLevel==='SYNTHETIC_ONLY','No blockchain payment is represented by this fixture.');
  if(options.artifact!==undefined)add('Artifact SHA-256',sha256(options.artifact)===p.fulfillment.artifactSha256,'Checks the actual delivered bytes.');
  else add('Artifact supplied',false,'Provide the artifact to verify its bytes independently.');
  let observed=false;
  if(p.mode==='live'&&options.chainFacts){const inspected=inspectTransfer(p.approvedTerms,p.destination.transactionHash,options.chainFacts);observed=inspected.verified&&inspected.actualAmount===p.destination.actualAmount&&inspected.logIndex===p.settlement.logIndex;add('Independent destination RPC',observed,inspected.reasons.join('; ')||'Canonical successful token transfer, confirmations and finality observed.');}
  return {integrity:checks.every(c=>c.pass)?'PASS':'FAIL',settlement:observed&&checks.every(c=>c.pass)?'INDEPENDENTLY_OBSERVED':'UNVERIFIED',checks,synthetic:p.mode==='demo'};
 }catch{add('Document structure',false,'Malformed or incomplete Purchase Passport.');return {integrity:'FAIL',settlement:'UNVERIFIED',checks,synthetic:false};}
}
