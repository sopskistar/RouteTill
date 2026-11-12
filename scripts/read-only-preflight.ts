import {mkdirSync,writeFileSync} from 'node:fs';
import {isAddress,getAddress,encodeFunctionData,parseAbi,formatEther} from 'viem';
import {assets,quote} from '../src/integrations/near';
import {rpc} from '../src/integrations/settlement';
import {ARB_TOKEN,BASE_TOKEN,ARB_USDC,BASE_USDC} from '../src/core/constants';
import {sha256} from '../src/core/crypto';
import {atomic,decimal} from '../src/core/amounts';
import {RESOURCE_ARTIFACT,RESOURCE_TITLE} from '../src/core/resource';
import {transferData} from '../src/wallet/evm';
import {Policy} from '../src/core/types';
const argument=(name:string)=>process.argv[process.argv.indexOf(name)+1];
const buyer=process.argv.includes('--buyer')?argument('--buyer'):'',merchant=process.argv.includes('--merchant')?argument('--merchant'):'';
if(!isAddress(buyer)||!isAddress(merchant))throw new Error('Supply checksum-valid public --buyer and --merchant EVM addresses. No private key is used.');
const amount=atomic(process.argv.includes('--amount')?argument('--amount'):'10');
const policy:Policy={version:1,authorizationId:crypto.randomUUID(),merchantId:'read-only-proposal',merchantName:'Owner-selected recipient (ownership unverified)',productId:'purchase-vectors',productName:RESOURCE_TITLE,artifactSha256:sha256(RESOURCE_ARTIFACT),recipient:merchant,sourceAsset:ARB_USDC,destinationAsset:BASE_USDC,sourceChain:42161,destinationChain:8453,destinationToken:BASE_TOKEN,destinationAmount:amount,maxSourceAmount:(BigInt(amount)*110n/100n).toString(),refundAddress:buyer,expiresAt:new Date(Date.now()+1800000).toISOString(),mode:'live'};
const [catalog,result]=await Promise.all([assets(),quote(policy,true)]);
const abi=parseAbi(['function balanceOf(address owner) view returns (uint256)','function decimals() view returns (uint8)']);
const q=result.response.quote;
const requests:[string,Promise<any>][]=[['sourceChain',rpc('eth_chainId',[],true)],['destinationChain',rpc('eth_chainId',[])],
 ['sourceDecimals',rpc('eth_call',[{to:ARB_TOKEN,data:encodeFunctionData({abi,functionName:'decimals'})},'latest'],true)],['destinationDecimals',rpc('eth_call',[{to:BASE_TOKEN,data:encodeFunctionData({abi,functionName:'decimals'})},'latest'])],
 ['sourceUsdcBalance',rpc('eth_call',[{to:ARB_TOKEN,data:encodeFunctionData({abi,functionName:'balanceOf',args:[buyer as `0x${string}`]})},'latest'],true)],
 ['sourceEthBalance',rpc('eth_getBalance',[buyer,'latest'],true)],['sourceGasPrice',rpc('eth_gasPrice',[],true)],
 // Dry quotes have no deposit address. This is an explicitly indicative transfer simulation, never broadcast.
 ['indicativeTransferGas',rpc('eth_estimateGas',[{from:buyer,to:ARB_TOKEN,value:'0x0',data:transferData(merchant,q.amountIn)}],true)],
 ['sourceAccountCode',rpc('eth_getCode',[buyer,'latest'],true)],['merchantAccountCode',rpc('eth_getCode',[merchant,'latest'])]];
const outcomes=await Promise.allSettled(requests.map(([,promise])=>promise));const evidence:any={};
for(let i=0;i<outcomes.length;i++){const r=outcomes[i];evidence[requests[i][0]]=r.status==='fulfilled'?{verified:true,value:r.value}:{verified:false,error:'Independent RPC did not return this check. UNVERIFIED.'};}
const val=(key:string)=>evidence[key].verified?BigInt(evidence[key].value):null;
const gas=val('indicativeTransferGas'),price=val('sourceGasPrice'),eth=val('sourceEthBalance'),usdc=val('sourceUsdcBalance');
const cost=gas!==null&&price!==null?gas*price:null,reserve=gas!==null&&price!==null?((gas*120n+99n)/100n)*((price*125n+99n)/100n):null;
const report={checkedAt:new Date().toISOString(),readOnly:true,fundsMoved:false,depositCreated:false,registeredPurchase:false,
 buyer:{address:buyer,checksumValid:getAddress(buyer)===buyer,chainId:42161,ownership:'UNVERIFIED; no signature requested'},merchant:{address:merchant,checksumValid:getAddress(merchant)===merchant,chainId:8453,ownership:'UNVERIFIED; verify in merchant settings'},refund:{address:buyer,equalsBuyer:true,chainId:42161,type:'ORIGIN_CHAIN'},
 source:{asset:ARB_USDC,token:ARB_TOKEN,amountUsdc:decimal(q.amountIn),minimumUsdc:decimal(q.minAmountIn),balanceUsdc:usdc===null?null:decimal(usdc.toString()),ethBalance:eth===null?null:formatEther(eth),sufficientUsdc:usdc===null?null:usdc>=BigInt(q.amountIn)},
 destination:{asset:BASE_USDC,token:BASE_TOKEN,expectedReceiptUsdc:decimal(q.amountOut)},
 quote:{signatureVerified:result.verification.signatureVerified,catalogCount:catalog.length,quotedAt:result.response.timestamp,priceFreshnessUntil:new Date(Date.parse(result.response.timestamp)+90000).toISOString(),requestedDeadline:result.request.deadline,executableExpiry:null,depositAddress:null,timeEstimateSeconds:q.timeEstimate},
 fees:{quotedInputMinusOutputUsdc:decimal((BigInt(q.amountIn)-BigInt(q.amountOut)).toString()),interpretation:'Aggregate quoted USDC input/output difference, including route costs/spread; not an independently itemized protocol fee.',providerRefundFeeUsdc:q.refundFee?decimal(q.refundFee):null,providerWithdrawalFeeUsdc:q.withdrawFee?decimal(q.withdrawFee):null,appFees:result.response.quoteRequest.appFees||[],feeFieldLimit:'Provider-reported fee/time fields may be unsigned. Do not add the quoted withdrawal fee a second time. Refund fees apply only if the provider refunds.'},
 gas:{indicativeOnly:true,simulation:'Native USDC transfer on Arbitrum to the supplied merchant address FOR GAS ESTIMATION ONLY; a dry quote has no actual deposit address.',units:gas?.toString()||null,gasPriceWei:price?.toString()||null,estimatedEth:cost===null?null:formatEther(cost),bufferedReserveEth:reserve===null?null:formatEther(reserve),sufficientEth:eth===null||reserve===null?null:eth>=reserve},
 networkChecks:{sourceChainCorrect:val('sourceChain')===42161n,destinationChainCorrect:val('destinationChain')===8453n,sourceDecimalsCorrect:val('sourceDecimals')===6n,destinationDecimalsCorrect:val('destinationDecimals')===6n},rpcEvidence:evidence,
 transactionReady:false,mainnetSettlement:'UNVERIFIED',remaining:['Verify both account selections and merchant ownership in Rabby.','Configure and verify the isolated production database and deployed application.','Approve the exact purchase in RouteTill, obtain fresh executable deposit instructions and run the exact-deposit gas preflight.','Review the complete fresh transaction packet, then obtain separate explicit human payment authorization. No transfer is authorized by this report.']};
mkdirSync('artifacts/live',{recursive:true});writeFileSync('artifacts/live/owner-readonly-quote.json',JSON.stringify(result,null,2));writeFileSync('artifacts/live/owner-readonly-preflight.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
