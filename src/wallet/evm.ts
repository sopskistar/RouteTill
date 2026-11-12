import {encodeFunctionData,isAddress,parseAbi} from 'viem';
import {ARB_TOKEN} from '../core/constants';

export type EvmProvider={request:(args:{method:string;params?:any})=>Promise<any>;on?:(name:string,listener:(...args:any[])=>void)=>void;removeListener?:(name:string,listener:(...args:any[])=>void)=>void;disconnect?:()=>Promise<void>;isRabby?:boolean;isMetaMask?:boolean;isCoinbaseWallet?:boolean;providers?:EvmProvider[]};
export type WalletOption={id:string;name:string;rdns:string;provider:EvmProvider;kind:'injected'|'walletconnect'};
export function announcedWallet(detail:any):WalletOption|null {
  if(!detail?.provider||typeof detail.provider.request!=='function'||typeof detail.info?.uuid!=='string'||typeof detail.info?.rdns!=='string'||typeof detail.info?.name!=='string')return null;
  if(detail.info.uuid.length>100||detail.info.rdns.length>100||detail.info.name.length>80)return null;
  return {id:detail.info.uuid,name:detail.info.name.replace(/[\x00-\x1f]/g,''),rdns:detail.info.rdns,provider:detail.provider,kind:'injected'};
}
export function mergeWallets(current:WalletOption[],entry:WalletOption){
  // A later announcement cannot replace the selected provider object.
  if(current.some(w=>w.id===entry.id||w.provider===entry.provider))return current;
  return [...current,entry].sort((a,b)=>(a.rdns==='io.rabby'?-1:b.rdns==='io.rabby'?1:a.name.localeCompare(b.name)));
}
export function legacyWallets(provider?:EvmProvider):WalletOption[]{
  if(!provider)return [];
  return (provider.providers?.length?provider.providers:[provider]).filter(p=>typeof p.request==='function').map((p,index)=>{
    const rdns=p.isRabby?'io.rabby':p.isCoinbaseWallet?'com.coinbase.wallet':p.isMetaMask?'io.metamask':'legacy.browser';
    const name=p.isRabby?'Rabby':p.isCoinbaseWallet?'Coinbase Wallet':p.isMetaMask?'MetaMask':'Browser wallet';
    return {id:`legacy-${rdns}-${index}`,name,rdns,provider:p,kind:'injected' as const};
  });
}
export function chainNumber(value:unknown):number|null {try{const n=Number(BigInt(String(value)));return Number.isSafeInteger(n)&&n>0?n:null;}catch{return null;}}
export function walletError(error:any){
  const code=error?.code??error?.cause?.code;
  if(code===4001||code==='ACTION_REJECTED')return 'You declined the wallet request. Nothing was sent by RouteTill.';
  if(code===-32002)return 'A wallet request is already open. Review it in the selected wallet.';
  if(code===4902)return 'The selected wallet does not have this network configured. Add Arbitrum One and retry.';
  return typeof error?.shortMessage==='string'?error.shortMessage:typeof error?.message==='string'?error.message:'The selected wallet could not complete the request.';
}
export const transferAbi=parseAbi(['function transfer(address to,uint256 amount) returns (bool)']);
export function transferData(recipient:string,amount:string){
  if(!isAddress(recipient)||!(/^[1-9]\d*$/.test(amount)))throw new Error('Invalid exact USDC deposit instructions.');
  return encodeFunctionData({abi:transferAbi,functionName:'transfer',args:[recipient,BigInt(amount)]});
}
export function assertTransfer(details:{chainId:number;from:string;to:string;data:string;value:string},expected:{account:string;depositAddress:string;amount:string}){
  if(details.chainId!==42161||details.from.toLowerCase()!==expected.account.toLowerCase()||details.to.toLowerCase()!==ARB_TOKEN||details.value!=='0'||details.data.toLowerCase()!==transferData(expected.depositAddress,expected.amount).toLowerCase())throw new Error('Wallet transaction details no longer match the approved native-USDC deposit.');
}
