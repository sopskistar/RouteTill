import {encodeFunctionData,parseAbi} from 'viem';
import {Database} from '../db';
import {Actor,Policy,requireThat} from '../core/types';
import {ARB_TOKEN,BASE_TOKEN} from '../core/constants';
import {fingerprint} from '../core/crypto';
import {enforcePolicy} from '../core/policy';
import {checkQuote} from '../integrations/near';
import {rpc} from '../integrations/settlement';
import {transferData} from '../wallet/evm';
import {getOrder} from './orders';

const erc20=parseAbi(['function balanceOf(address owner) view returns (uint256)','function decimals() view returns (uint8)']);
export type ReadRpc=(method:string,params:unknown[],source?:boolean)=>Promise<any>;
/** Read-only RPC preflight. Estimates are neither a fee guarantee nor a wallet signature. */
export async function inspectPayment(policy:Policy,response:any,read:ReadRpc=rpc,now=Date.now()){
 const q=response.quote;
 const transaction={chainId:42161,from:policy.refundAddress,to:ARB_TOKEN,value:'0',data:transferData(q.depositAddress,q.amountIn)};
 const call={from:transaction.from,to:transaction.to,value:'0x0',data:transaction.data};
 const [sourceChain,destinationChain,sourceDecimals,destinationDecimals,usdc,eth,gas,gasPrice]=await Promise.all([
  read('eth_chainId',[],true),read('eth_chainId',[]),
  read('eth_call',[{to:ARB_TOKEN,data:encodeFunctionData({abi:erc20,functionName:'decimals'})},'latest'],true),
  read('eth_call',[{to:BASE_TOKEN,data:encodeFunctionData({abi:erc20,functionName:'decimals'})},'latest']),
  read('eth_call',[{to:ARB_TOKEN,data:encodeFunctionData({abi:erc20,functionName:'balanceOf',args:[policy.refundAddress as `0x${string}`]})},'latest'],true),
  read('eth_getBalance',[policy.refundAddress,'latest'],true),read('eth_estimateGas',[call],true),read('eth_gasPrice',[],true)
 ]);
 requireThat(BigInt(sourceChain)===42161n&&BigInt(destinationChain)===8453n,'WRONG_CHAIN','The independent RPC networks do not match Arbitrum One → Base.');
 requireThat(BigInt(sourceDecimals)===6n&&BigInt(destinationDecimals)===6n,'TOKEN_PRECISION','The configured native USDC contracts must have six decimals.');
 requireThat(BigInt(usdc)>=BigInt(q.amountIn),'INSUFFICIENT_USDC','The approved source wallet has insufficient native USDC on Arbitrum One.');
 const gasLimit=(BigInt(gas)*120n+99n)/100n,bufferedGasPrice=(BigInt(gasPrice)*125n+99n)/100n;
 const estimatedGasWei=BigInt(gas)*BigInt(gasPrice),gasReserveWei=gasLimit*bufferedGasPrice;
 requireThat(BigInt(gas)>0n&&BigInt(gasPrice)>0n,'GAS_UNAVAILABLE','A positive gas estimate and gas price are required.');
 requireThat(BigInt(eth)>=gasReserveWei,'INSUFFICIENT_GAS','The source wallet needs more Arbitrum ETH for the estimated gas reserve.');
 const validUntil=Math.min(now+60000,Date.parse(q.deadline)-15000,Date.parse(q.timeWhenInactive)-15000,Date.parse(policy.expiresAt));
 requireThat(validUntil>now+5000,'QUOTE_EXPIRED','Too little quote lifetime remains. Do not send a deposit.');
 return {checkedAt:new Date(now).toISOString(),validUntil:new Date(validUntil).toISOString(),policyFingerprint:fingerprint(policy),quoteFingerprint:fingerprint(response),
  source:{chainId:42161,token:ARB_TOKEN,decimals:6,account:policy.refundAddress,amount:q.amountIn,usdcBalance:BigInt(usdc).toString(),ethBalanceWei:BigInt(eth).toString()},
  destination:{chainId:8453,token:BASE_TOKEN,recipient:policy.recipient,expectedAmount:policy.destinationAmount,quotedAmount:q.amountOut},
  depositAddress:q.depositAddress,refundAddress:policy.refundAddress,quoteExpiresAt:q.deadline,inactiveAt:q.timeWhenInactive,
  gas:{estimatedUnits:BigInt(gas).toString(),gasPriceWei:BigInt(gasPrice).toString(),estimatedGasWei:estimatedGasWei.toString(),gasLimit:gasLimit.toString(),reserveWei:gasReserveWei.toString()},
  transaction,risks:['The source maximum covers USDC only. Arbitrum ETH gas is additional and is spent even if settlement fails.',
   'The provider quote includes route costs; its fee breakdown and time estimates may be unsigned. Gas estimates can change.',
   'Send exactly the quoted native USDC on Arbitrum One before expiry. Incorrect tokens, networks or late deposits can cause loss or provider-managed refunds.',
   'The refund wallet is fixed by the approved policy. RouteTill cannot reverse a blockchain transaction.']};
}
export async function paymentPreflight(database:Database,actor:Actor,id:string){
 requireThat(actor.mode==='live','DEMO_PAYMENT_BLOCKED','Synthetic purchases cannot request a real payment preflight.',403);
 requireThat(process.env.ENABLE_LIVE_PAYMENTS==='true','LIVE_DISABLED','Live payment requests are disabled.',403);
 const order=await getOrder(database,id,actor);
 requireThat(order.buyer_id===actor.buyerId||order.buyer_owner_id===actor.merchantId,'BUYER_REQUIRED','Only the buyer or human agent owner can prepare this payment.',403);
 requireThat(order.policy.mode==='live'&&order.state==='AWAITING_DEPOSIT','PAYMENT_STATE','This purchase is not awaiting a source deposit.');
 enforcePolicy(order.policy,order.policy,order.fingerprint);
 const attempt=(await database.query('SELECT * FROM attempts WHERE order_id=$1',[id])).rows[0];
 requireThat(attempt?.deposit_address&&!attempt.source_tx,'PAYMENT_STATE','There is no unfunded executable payment attempt.');
 checkQuote(attempt.quote.response,order.policy,false,Date.now(),false);
 requireThat(attempt.deposit_address===attempt.quote.response.quote.depositAddress,'ASSOCIATION','Stored deposit instructions do not match the signed quote.');
 const packet=await inspectPayment(order.policy,attempt.quote.response);
 const saved=await database.query('UPDATE attempts SET preflight=$1 WHERE id=$2 AND source_tx IS NULL AND state=\'AWAITING_DEPOSIT\' RETURNING id',[JSON.stringify(packet),attempt.id]);
 requireThat(saved.rows.length===1,'PAYMENT_STATE','The payment state changed during preflight. Refresh the purchase.');
 return packet;
}
