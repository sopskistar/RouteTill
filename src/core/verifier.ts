import {verifyQuoteSignature} from '@defuse-protocol/one-click-sdk-typescript';
import {fingerprint,sha256,verifyPayload} from './crypto';
import {inspectTransfer,inspectRefund,providerAssociationMatches,ChainFacts} from '../integrations/settlement';
import {checkQuote} from '../integrations/near';
export type Verification={integrity:'PASS'|'FAIL';settlement:'UNVERIFIED'|'INDEPENDENTLY_OBSERVED';checks:{name:string;pass:boolean;detail:string}[];synthetic:boolean};
export function verifyPassport(document:any,options:{trustedKey?:string;artifact?:Buffer|string;chainFacts?:ChainFacts;refundFacts?:Record<string,ChainFacts>}={}):Verification {
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
   const refs=p.providerEvidence?.swapDetails?.destinationChainTxHashes||[],refunds=p.settlement.relatedRefunds||[];
   const expected=[p.destination.transactionHash,...refunds.map((r:any)=>r.txHash)];
   add('Provider transaction association',providerAssociationMatches(p.approvedTerms,p.providerEvidence,q,p.source.transactionHash,q.quote.depositAddress)&&refs.length===expected.length&&expected.length<=2&&new Set(expected).size===expected.length&&refs.every((r:any)=>expected.includes(r.hash))&&refunds.every((r:any)=>r.chainId===42161&&r.amount===p.providerEvidence.swapDetails.refundedAmount),'Signed quote and confirmed source stay bound; additional references must be origin-chain refunds. Provider status itself is an unsigned assertion.');
  }else add('Synthetic disclosure',p.settlementLevel==='SYNTHETIC_ONLY','No blockchain payment is represented by this fixture.');
  if(options.artifact!==undefined)add('Artifact SHA-256',sha256(options.artifact)===p.fulfillment.artifactSha256,'Checks the actual delivered bytes.');
  else add('Artifact supplied',false,'Provide the artifact to verify its bytes independently.');
  let observed=false;
  if(p.mode==='live'&&options.chainFacts){
   const inspected=inspectTransfer(p.approvedTerms,p.destination.transactionHash,options.chainFacts);observed=inspected.verified&&inspected.actualAmount===p.destination.actualAmount&&inspected.logIndex===p.settlement.logIndex;add('Independent destination RPC',observed,inspected.reasons.join('; ')||'Canonical successful token transfer, confirmations and finality observed.');
   for(const r of p.settlement.relatedRefunds||[]){const facts=options.refundFacts?.[r.txHash];add('Independent origin refund RPC',!!facts&&inspectRefund(p.approvedTerms,r.txHash,r.amount,facts),'Re-query the origin chain to distinguish an origin refund from a second destination payment.');}
  }
  return {integrity:checks.every(c=>c.pass)?'PASS':'FAIL',settlement:observed&&checks.every(c=>c.pass)?'INDEPENDENTLY_OBSERVED':'UNVERIFIED',checks,synthetic:p.mode==='demo'};
 }catch{add('Document structure',false,'Malformed or incomplete Purchase Passport.');return {integrity:'FAIL',settlement:'UNVERIFIED',checks,synthetic:false};}
}
