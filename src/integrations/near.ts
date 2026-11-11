import {verifyQuoteSignature} from '@defuse-protocol/one-click-sdk-typescript';
import {isAddress} from 'viem';
import {Policy,requireThat} from '../core/types';
import {assertAtomic,decimal} from '../core/amounts';
import {ARB_USDC,BASE_USDC} from '../core/policy';
const base='https://1click.chaindefuser.com';
export async function provider(path:string,body?:unknown){
 const jwt=process.env.NEAR_INTENTS_JWT;
 requireThat(jwt,'NEAR_CREDENTIAL_MISSING','Authenticated NEAR Intents quoting is not configured.',503);
 const response=await fetch(base+path,{method:body?'POST':'GET',headers:{'Content-Type':'application/json','X-API-Key':jwt},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(20000),cache:'no-store'});
 requireThat(response.ok,'PROVIDER_ERROR',`NEAR Intents returned HTTP ${response.status}. No payment was authorized by this response.`,502);
 return response.json();
}
export async function assets(){
 const response=await fetch(base+'/v0/tokens',{signal:AbortSignal.timeout(15000),next:{revalidate:300}});
 requireThat(response.ok,'CATALOG_UNAVAILABLE','The live asset catalog is unavailable. Try again shortly.',502);
 const list=await response.json();requireThat(Array.isArray(list),'CATALOG_INVALID','Unexpected provider catalog.',502);return list;
}
export function checkQuote(response:any,policy:Policy,dry:boolean,now=Date.now(),checkFresh=true){
 let signature=false;try{signature=verifyQuoteSignature(response);}catch{ /* fail closed */ }
 requireThat(signature,'QUOTE_SIGNATURE','The provider quote signature could not be verified.',502);
 return checkQuoteTerms(response,policy,dry,now,checkFresh);
}
export function checkQuoteTerms(response:any,policy:Policy,dry:boolean,now=Date.now(),checkFresh=true){
 const r=response.quoteRequest,q=response.quote;
 requireThat(r&&q,'QUOTE_INVALID','Quote fields are missing.',502);
 for(const [key,value] of Object.entries({dry,swapType:'EXACT_OUTPUT',originAsset:policy.sourceAsset,destinationAsset:policy.destinationAsset,recipient:policy.recipient,refundTo:policy.refundAddress,amount:policy.destinationAmount,depositType:'ORIGIN_CHAIN',recipientType:'DESTINATION_CHAIN',refundType:'ORIGIN_CHAIN'})){
  requireThat(r[key]===value,'QUOTE_TERMS',`Provider quote does not match approved ${key}.`,502);
 }
 requireThat(checkFresh===false||Math.abs(now-Date.parse(response.timestamp))<90000,'QUOTE_STALE','Quote is stale. Request a fresh quote.');
 requireThat(assertAtomic(q.amountIn)<=assertAtomic(policy.maxSourceAmount),'PRICE_LIMIT','Quoted source amount exceeds your approved maximum.');
 requireThat(assertAtomic(q.amountOut)===assertAtomic(policy.destinationAmount)&&assertAtomic(q.minAmountOut)>=assertAtomic(policy.destinationAmount),'INSUFFICIENT_OUTPUT','Quote does not guarantee the approved product price.');
 requireThat(assertAtomic(q.amountIn)>=assertAtomic(q.minAmountIn),'MINIMUM_DEPOSIT','Quoted input is below the minimum deposit.');
 requireThat(decimal(q.amountIn,6)===decimalString(q.amountInFormatted),'QUOTE_PRECISION','Provider amount formatting does not match atomic units.');
 if(!dry){
  requireThat(isAddress(q.depositAddress),'DEPOSIT_ADDRESS','Executable quote has no valid deposit address.',502);
  requireThat(!q.depositMemo,'UNSUPPORTED_MEMO','This route unexpectedly requires a memo.',502);
  requireThat(Date.parse(q.deadline)>now+15000&&Date.parse(q.timeWhenInactive)>now+15000,'QUOTE_EXPIRED','Executable quote has expired. Prepare a new purchase.');
 }
 return {signatureVerified:true,checkedAt:new Date(now).toISOString(),dry,limitations:['Signature coverage follows the pinned official SDK; fees and time estimates may be unsigned.','A quote is not evidence of payment.']};
}
function decimalString(s:unknown){requireThat(typeof s==='string'&&/^\d+(\.\d+)?$/.test(s),'QUOTE_PRECISION','Invalid decimal formatting.');return s.includes('.')?s.replace(/0+$/,'').replace(/\.$/,''):s;}
export async function quote(policy:Policy,dry=true){
 requireThat(policy.sourceAsset===ARB_USDC&&policy.destinationAsset===BASE_USDC,'UNSUPPORTED_ROUTE','Live settlement verification currently supports Arbitrum USDC → Base USDC.');
 requireThat(isAddress(policy.recipient)&&isAddress(policy.refundAddress),'INVALID_ADDRESS','A valid EVM merchant and refund address are required.');
 const catalog=await assets();
 for(const id of [policy.sourceAsset,policy.destinationAsset])requireThat(catalog.some((a:any)=>a.assetId===id&&a.decimals===6),'ASSET_UNAVAILABLE','The approved USDC asset is not currently available.');
 const request={dry,swapType:'EXACT_OUTPUT',slippageTolerance:100,originAsset:policy.sourceAsset,destinationAsset:policy.destinationAsset,amount:policy.destinationAmount,depositType:'ORIGIN_CHAIN',recipientType:'DESTINATION_CHAIN',refundType:'ORIGIN_CHAIN',recipient:policy.recipient,refundTo:policy.refundAddress,deadline:new Date(Math.min(Date.parse(policy.expiresAt),Date.now()+20*60000)).toISOString()};
 const response=await provider('/v0/quote',request);const verification=checkQuote(response,policy,dry);return {request,response,verification};
}
export async function status(depositAddress:string){return provider('/v0/status?'+new URLSearchParams({depositAddress}));}
