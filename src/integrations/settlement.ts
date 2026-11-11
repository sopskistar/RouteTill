import {fingerprint} from '../core/crypto';
import {Policy,SettlementEvidence,requireThat} from '../core/types';
import {ARB_TOKEN} from '../core/policy';
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
export async function chainFacts(txHash:string):Promise<ChainFacts>{
 const [chainId,receipt,head,finalized]=await Promise.all([rpc('eth_chainId',[]),rpc('eth_getTransactionReceipt',[txHash]),rpc('eth_blockNumber',[]),rpc('eth_getBlockByNumber',['finalized',false])]);
 const canonicalBlock=receipt?await rpc('eth_getBlockByNumber',[receipt.blockNumber,false]):null;return {chainId,receipt,head,finalized,canonicalBlock};
}
export async function verifyDestination(policy:Policy,providerStatus:any,attempt:any):Promise<SettlementEvidence>{
 requireThat(providerStatus.status==='SUCCESS','PROVIDER_PENDING','Provider has not reported successful settlement.');
 requireThat(providerStatus.quoteResponse?.quote?.depositAddress===attempt.deposit_address,'ASSOCIATION','Status is not associated with the stored payment deposit.');
 requireThat(fingerprint(providerStatus.quoteResponse)===fingerprint(attempt.quote.response),'ASSOCIATION','Status quote differs from the original saved quote.');
 const references=providerStatus.swapDetails?.destinationChainTxHashes;
 requireThat(Array.isArray(references)&&references.length===1&&/^0x[0-9a-fA-F]{64}$/.test(references[0].hash),'MISSING_CHAIN_EVIDENCE','Destination transaction is missing or ambiguous. Settlement remains UNVERIFIED.');
 requireThat(BigInt(providerStatus.swapDetails.amountOut)>=BigInt(policy.destinationAmount),'INSUFFICIENT_OUTPUT','Provider output is below the approved price.');
 const evidence=inspectTransfer(policy,references[0].hash,await chainFacts(references[0].hash));
 evidence.providerAssociation=providerStatus.correlationId;return evidence;
}
export async function verifySource(txHash:string,attempt:any,policy:Policy){
 const [chainId,receipt]=await Promise.all([rpc('eth_chainId',[],true),rpc('eth_getTransactionReceipt',[txHash],true)]);
 requireThat(BigInt(chainId)===42161n,'SOURCE_CHAIN','Wrong source chain.');
 requireThat(receipt?.status==='0x1','SOURCE_PENDING','Source transaction is not yet confirmed. Retry after confirmation.');
 requireThat(receipt.logs.some((l:any)=>l.address?.toLowerCase()===ARB_TOKEN&&l.topics?.[0]===TRANSFER_TOPIC&&l.topics?.[1]?.toLowerCase()==='0x'+policy.refundAddress.slice(2).toLowerCase().padStart(64,'0')&&l.topics?.[2]?.toLowerCase()==='0x'+attempt.deposit_address.slice(2).toLowerCase().padStart(64,'0')&&BigInt(l.data)===BigInt(attempt.quote.response.quote.amountIn)),'SOURCE_TRANSFER','Source receipt does not contain the exact authorized USDC deposit.');return receipt;
}
export function syntheticFacts(policy:Policy,seed:string):ChainFacts{
 const tx='0x'+fingerprint({seed,fixture:'synthetic-transaction'});const block='0x'+fingerprint({seed,fixture:'synthetic-block'});
 return {chainId:'0x2105',head:'0x10020',finalized:{number:'0x10018',hash:block},canonicalBlock:{hash:block},receipt:{transactionHash:tx,status:'0x1',blockNumber:'0x10000',blockHash:block,logs:[{address:policy.destinationToken,topics:[TRANSFER_TOPIC,'0x'+'2'.repeat(64),'0x'+policy.recipient.slice(2).toLowerCase().padStart(64,'0')],data:'0x'+BigInt(policy.destinationAmount).toString(16).padStart(64,'0'),logIndex:'0x0',removed:false}]}};
}
