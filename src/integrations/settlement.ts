import {fingerprint} from '../core/crypto';
import {Policy,SettlementEvidence,requireThat} from '../core/types';
import {ARB_TOKEN} from '../core/policy';
import {transferData} from '../wallet/evm';
import {sameSignedQuote,checkQuote} from './near';
export const TRANSFER_TOPIC='0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
export type ChainFacts={chainId:string;receipt:any;head:string;finalized:any;canonicalBlock:any};
export function inspectTransfer(policy:Policy,txHash:string,facts:ChainFacts):SettlementEvidence {
 const reasons:string[]=[];const receipt=facts.receipt;
 const result:SettlementEvidence={kind:'CHAIN',verified:false,reasons,chainId:policy.destinationChain,token:policy.destinationToken,recipient:policy.recipient,expectedAmount:policy.destinationAmount,actualAmount:'0',txHash,logIndex:null,blockNumber:null,blockHash:null,confirmations:0,requiredConfirmations:12,finalized:false,checkedAt:new Date().toISOString(),receipt,finalizedBlock:facts.finalized};
 const fail=(test:unknown,reason:string)=>{if(!test)reasons.push(reason);};
 fail(BigInt(facts.chainId)===BigInt(policy.destinationChain),'Wrong destination chain');
 if(!receipt){reasons.push('Transaction receipt unavailable');return result;}
 fail(receipt.transactionHash?.toLowerCase()===txHash.toLowerCase(),'Transaction reference mismatch');
 fail(receipt.status==='0x1','Transaction did not succeed');
 fail(receipt.blockHash&&receipt.blockHash===facts.canonicalBlock?.hash,'Receipt is not in the canonical block');
 result.blockNumber=receipt.blockNumber;result.blockHash=receipt.blockHash;
 if(receipt.blockNumber&&facts.head){result.confirmations=Number(BigInt(facts.head)-BigInt(receipt.blockNumber)+1n);}
 result.finalized=!!(facts.finalized?.number&&receipt.blockNumber&&BigInt(facts.finalized.number)>=BigInt(receipt.blockNumber));
 fail(result.confirmations>=result.requiredConfirmations,'Insufficient confirmations');fail(result.finalized,'Destination block is not finalized');
 const matches=(receipt.logs||[]).filter((log:any)=>log.address?.toLowerCase()===policy.destinationToken.toLowerCase()&&log.topics?.length===3&&log.topics[0]===TRANSFER_TOPIC&&log.topics[2]?.toLowerCase()==='0x'+policy.recipient.slice(2).toLowerCase().padStart(64,'0')&&!log.removed&&/^0x[0-9a-fA-F]{64}$/.test(log.data));
 fail(matches.length===1,'Expected exactly one unambiguous token transfer to the merchant');
 if(matches.length===1){result.actualAmount=BigInt(matches[0].data).toString();result.logIndex=Number(BigInt(matches[0].logIndex));fail(BigInt(result.actualAmount)>=BigInt(policy.destinationAmount),'Insufficient destination amount');}
 result.verified=reasons.length===0;return result;
}
export async function rpc(method:string,params:unknown[],source=false){
 const url=source?(process.env.ARBITRUM_RPC_URL||'https://arb1.arbitrum.io/rpc'):(process.env.BASE_RPC_URL||'https://mainnet.base.org');
 const res=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method,params}),signal:AbortSignal.timeout(12000),cache:'no-store'});
 requireThat(res.ok,'RPC_UNAVAILABLE','Independent chain evidence is unavailable. Settlement remains UNVERIFIED.',502);
 const data=await res.json();requireThat(!data.error&&data.result!==undefined,'RPC_UNAVAILABLE','Chain RPC could not return the required evidence.',502);return data.result;
}
export async function chainFacts(txHash:string,source=false):Promise<ChainFacts>{
 const [chainId,receipt,head,finalized]=await Promise.all([rpc('eth_chainId',[],source),rpc('eth_getTransactionReceipt',[txHash],source),rpc('eth_blockNumber',[],source),rpc('eth_getBlockByNumber',['finalized',false],source)]);
 const canonicalBlock=receipt?await rpc('eth_getBlockByNumber',[receipt.blockNumber,false],source):null;return {chainId,receipt,head,finalized,canonicalBlock};
}
export function providerAssociationMatches(policy:Policy,providerStatus:any,originalQuote:any,sourceTx:string,depositAddress:string):boolean {
 const details=providerStatus?.swapDetails,origins=details?.originChainTxHashes;
 return providerStatus?.status==='SUCCESS'&&!!sourceTx&&sameSignedQuote(originalQuote,providerStatus.quoteResponse)&&
  providerStatus.quoteResponse?.quote?.depositAddress===depositAddress&&
  Array.isArray(origins)&&origins.length===1&&origins[0].hash?.toLowerCase()===sourceTx.toLowerCase()&&
  details.depositedAmount===originalQuote?.quote?.amountIn&&/^\d+$/.test(details.amountOut)&&BigInt(details.amountOut)>=BigInt(policy.destinationAmount);
}
/** An extra provider reference may be a canonical origin-chain USDC refund. */
export function inspectRefund(policy:Policy,txHash:string,amount:string,facts:ChainFacts):boolean {
 if(!/^[1-9]\d*$/.test(amount||''))return false;
 const proof=inspectTransfer({...policy,destinationChain:42161,destinationToken:ARB_TOKEN,recipient:policy.refundAddress,destinationAmount:amount},txHash,facts);
 // Refund observation excludes a non-Base reference; merchant settlement still requires finality.
 return proof.actualAmount===amount&&proof.reasons.every(reason=>reason==='Destination block is not finalized');
}
export async function verifyDestination(policy:Policy,providerStatus:any,attempt:any,read:typeof chainFacts=chainFacts):Promise<SettlementEvidence>{
 requireThat(providerStatus.status==='SUCCESS','PROVIDER_PENDING','Provider has not reported successful settlement.');
 requireThat(providerAssociationMatches(policy,providerStatus,attempt.quote.response,attempt.source_tx,attempt.deposit_address),'ASSOCIATION','Provider status does not match the signed quote, exact source deposit and saved payment.');
 checkQuote(providerStatus.quoteResponse,policy,false,Date.parse(attempt.quote.response.timestamp),false);
 const references=providerStatus.swapDetails?.destinationChainTxHashes;
 requireThat(Array.isArray(references)&&references.length>=1&&references.length<=2&&references.every((r:any)=>/^0x[0-9a-fA-F]{64}$/.test(r.hash))&&new Set(references.map((r:any)=>r.hash.toLowerCase())).size===references.length,'MISSING_CHAIN_EVIDENCE','Destination transaction is missing or ambiguous. Settlement remains UNVERIFIED.');
 const observations=await Promise.all(references.map(async(r:any)=>({hash:r.hash,facts:await read(r.hash)})));
 const merchantTopic='0x'+policy.recipient.slice(2).toLowerCase().padStart(64,'0');
 const candidates=observations.filter(r=>(r.facts.receipt?.logs||[]).some((log:any)=>log.address?.toLowerCase()===policy.destinationToken.toLowerCase()&&log.topics?.[0]===TRANSFER_TOPIC&&log.topics?.[2]?.toLowerCase()===merchantTopic));
 // Preserve pending receipt handling for the usual single-reference response.
 requireThat(candidates.length===1||(observations.length===1&&candidates.length===0),'MISSING_CHAIN_EVIDENCE','No single unambiguous Base merchant payment was identified. Settlement remains UNVERIFIED.');
 const chosen=candidates[0]||observations[0],evidence=inspectTransfer(policy,chosen.hash,chosen.facts);
 const extras=observations.filter(r=>r!==chosen);
 if(extras.length){
  const extra=extras[0],amount=providerStatus.swapDetails.refundedAmount,facts=await read(extra.hash,true);
  requireThat(inspectRefund(policy,extra.hash,amount,facts),'REFUND_ASSOCIATION','The additional provider reference is not a verified origin-chain refund. Settlement remains UNVERIFIED.');
  evidence.relatedRefunds=[{chainId:42161,txHash:extra.hash,amount,proof:facts}];
 }
 evidence.providerAssociation=providerStatus.correlationId;return evidence;
}
export async function verifySource(txHash:string,attempt:any,policy:Policy){
 const [chainId,receipt,transaction]=await Promise.all([rpc('eth_chainId',[],true),rpc('eth_getTransactionReceipt',[txHash],true),rpc('eth_getTransactionByHash',[txHash],true)]);
 requireThat(BigInt(chainId)===42161n,'SOURCE_CHAIN','Wrong source chain.');
 requireThat(receipt?.status==='0x1','SOURCE_PENDING','Source transaction is not yet confirmed. Retry after confirmation.');
 const canonical=await rpc('eth_getBlockByNumber',[receipt.blockNumber,false],true);
 requireThat(receipt.transactionHash?.toLowerCase()===txHash.toLowerCase()&&receipt.blockHash===canonical?.hash,'SOURCE_REFERENCE','The source receipt reference or canonical block is invalid.');
 requireThat(transaction?.hash?.toLowerCase()===txHash.toLowerCase()&&transaction.from?.toLowerCase()===policy.refundAddress.toLowerCase()&&transaction.to?.toLowerCase()===ARB_TOKEN&&BigInt(transaction.value)===0n&&transaction.input?.toLowerCase()===transferData(attempt.deposit_address,attempt.quote.response.quote.amountIn).toLowerCase(),'SOURCE_TRANSACTION','The source transaction is not the exact approved native USDC transfer from the refund wallet.');
 const matches=receipt.logs.filter((l:any)=>!l.removed&&l.address?.toLowerCase()===ARB_TOKEN&&l.topics?.length===3&&l.topics[0]===TRANSFER_TOPIC&&l.topics[1]?.toLowerCase()==='0x'+policy.refundAddress.slice(2).toLowerCase().padStart(64,'0')&&l.topics[2]?.toLowerCase()==='0x'+attempt.deposit_address.slice(2).toLowerCase().padStart(64,'0')&&/^0x[0-9a-fA-F]{64}$/.test(l.data)&&BigInt(l.data)===BigInt(attempt.quote.response.quote.amountIn));
 requireThat(matches.length===1,'SOURCE_TRANSFER','Source receipt must contain one exact authorized USDC deposit.');return {chainId,transaction,receipt,canonicalBlock:canonical,checkedAt:new Date().toISOString()};
}
export function syntheticFacts(policy:Policy,seed:string):ChainFacts{
 const tx='0x'+fingerprint({seed,fixture:'synthetic-transaction'});const block='0x'+fingerprint({seed,fixture:'synthetic-block'});
 return {chainId:'0x2105',head:'0x10020',finalized:{number:'0x10018',hash:block},canonicalBlock:{hash:block},receipt:{transactionHash:tx,status:'0x1',blockNumber:'0x10000',blockHash:block,logs:[{address:policy.destinationToken,topics:[TRANSFER_TOPIC,'0x'+'2'.repeat(64),'0x'+policy.recipient.slice(2).toLowerCase().padStart(64,'0')],data:'0x'+BigInt(policy.destinationAmount).toString(16).padStart(64,'0'),logIndex:'0x0',removed:false}]}};
}
