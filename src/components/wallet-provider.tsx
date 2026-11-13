'use client';
import {createContext,useCallback,useContext,useEffect,useRef,useState} from 'react';
import {createWalletClient,custom,isAddress} from 'viem';
import {arbitrum} from 'viem/chains';
import {announcedWallet,chainNumber,EvmProvider,legacyWallets,mergeWallets,WalletOption,walletError} from '@/wallet/evm';

type Runtime={mode:'live'|'demo'|'local';demoUrl:string|null;walletConnectProjectId:string|null};
const RuntimeContext=createContext<Runtime>({mode:'local',demoUrl:null,walletConnectProjectId:null});
type WalletState={options:WalletOption[];selected:WalletOption|null;account:string|null;chainId:number|null;revision:number;busy:boolean;error:string;qr:string|null;select:(id:string)=>void;connect:()=>Promise<string>;connectWalletConnect:()=>Promise<void>;switchToArbitrum:()=>Promise<void>;disconnect:()=>void;refresh:()=>void;client:()=>ReturnType<typeof createWalletClient>};
const WalletContext=createContext<WalletState|null>(null);
export const useRuntime=()=>useContext(RuntimeContext);
export function useWallet(){const v=useContext(WalletContext);if(!v)throw new Error('Wallet context missing');return v;}
export function WalletProvider({runtime,children}:{runtime:Runtime;children:React.ReactNode}){
  const [options,setOptions]=useState<WalletOption[]>([]),[selectedId,setSelectedId]=useState<string|null>(null),[account,setAccount]=useState<string|null>(null),[chainId,setChainId]=useState<number|null>(null),[revision,setRevision]=useState(0),[busy,setBusy]=useState(false),[error,setError]=useState(''),[qr,setQr]=useState<string|null>(null);
  const selectedIdRef=useRef<string|null>(null);
  const generation=useRef(0),wc=useRef<EvmProvider|null>(null);
  const selected=options.find(o=>o.id===selectedId)||null;
  const refresh=useCallback(()=>window.dispatchEvent(new Event('eip6963:requestProvider')),[]);
  useEffect(()=>{
    const receive=(event:Event)=>{const entry=announcedWallet((event as CustomEvent).detail);if(entry)setOptions(v=>mergeWallets(v,entry,selectedIdRef.current));};
    window.addEventListener('eip6963:announceProvider',receive);refresh();
    const fallback=setTimeout(()=>{for(const provider of [(window as any).ethereum,(window as any).okxwallet])for(const option of legacyWallets(provider))setOptions(v=>mergeWallets(v,option,selectedIdRef.current));},400);
    return()=>{clearTimeout(fallback);window.removeEventListener('eip6963:announceProvider',receive);};
  },[refresh]);
  useEffect(()=>{
    if(!selected)return;
    const accounts=(addresses:string[])=>{setAccount(addresses?.[0]&&isAddress(addresses[0])?addresses[0]:null);setRevision(v=>v+1);};
    const chain=(id:unknown)=>{setChainId(chainNumber(id));setRevision(v=>v+1);};
    const gone=()=>{setAccount(null);setChainId(null);setQr(null);setRevision(v=>v+1);};
    selected.provider.on?.('accountsChanged',accounts);selected.provider.on?.('chainChanged',chain);selected.provider.on?.('disconnect',gone);
    return()=>{selected.provider.removeListener?.('accountsChanged',accounts);selected.provider.removeListener?.('chainChanged',chain);selected.provider.removeListener?.('disconnect',gone);};
  },[selected]);
  function select(id:string){generation.current++;selectedIdRef.current=id;setSelectedId(id);setAccount(null);setChainId(null);setError('');setQr(null);setRevision(v=>v+1);}
  async function connect(){
    if(!selected)throw new Error('Select Rabby or another discovered wallet first.');
    const g=++generation.current;setBusy(true);setError('');
    try{const addresses=await selected.provider.request({method:'eth_requestAccounts'});if(g!==generation.current)throw new Error('Wallet selection changed. Connect the selected wallet again.');if(!isAddress(addresses?.[0]))throw new Error('The selected wallet did not return an EVM account.');const chain=await selected.provider.request({method:'eth_chainId'});setAccount(addresses[0]);setChainId(chainNumber(chain));setRevision(v=>v+1);return addresses[0] as string;}catch(e){setError(walletError(e));throw e;}finally{if(g===generation.current)setBusy(false);}
  }
  async function connectWalletConnect(){
    if(!runtime.walletConnectProjectId){setError('WalletConnect is not configured on this deployment.');return;}
    const g=++generation.current;setBusy(true);setError('');
    try{
      const [{UniversalProvider},QRCode]=await Promise.all([import('@walletconnect/universal-provider'),import('qrcode')]);
      const provider=await UniversalProvider.init({projectId:runtime.walletConnectProjectId,metadata:{name:'RouteTill',description:'Human-approved digital purchases',url:location.origin,icons:[location.origin+'/icon.svg']},disableProviderPing:true});
      const bridge:EvmProvider={request:async args=>{const method=args.method==='eth_requestAccounts'?'eth_accounts':args.method;const result=await provider.request({method,params:args.params});return method==='eth_chainId'?'0x'+BigInt(String(result)).toString(16):result;},on:(name,fn)=>provider.on(name,fn),removeListener:(name,fn)=>provider.removeListener(name,fn),disconnect:async()=>{provider.abortPairingAttempt();if(provider.session)await provider.disconnect();}};
      wc.current=bridge;
      provider.on('display_uri',async(uri:string)=>{const image=await QRCode.toDataURL(uri,{width:256,margin:2});if(g===generation.current)setQr(image);});
      const option:WalletOption={id:'walletconnect',name:'WalletConnect',rdns:'org.walletconnect',kind:'walletconnect',provider:bridge};
      setOptions(v=>[...v.filter(w=>w.id!=='walletconnect'),option]);selectedIdRef.current=option.id;setSelectedId(option.id);setAccount(null);setChainId(null);
      await provider.connect({namespaces:{eip155:{chains:['eip155:42161'],methods:['eth_sendTransaction','personal_sign'],events:['accountsChanged','chainChanged']}},optionalNamespaces:{eip155:{chains:['eip155:8453'],methods:['wallet_switchEthereumChain'],events:['accountsChanged','chainChanged']}}});if(g!==generation.current)return;
      const addresses=await provider.request({method:'eth_accounts'});if(!Array.isArray(addresses)||!isAddress(addresses[0]))throw new Error('WalletConnect returned no EVM account.');
      setAccount(addresses[0]);setChainId(chainNumber(await provider.request({method:'eth_chainId'})));setQr(null);setRevision(v=>v+1);
    }catch(e){if(g===generation.current){setError(walletError(e));setQr(null);}}finally{if(g===generation.current)setBusy(false);}
  }
  async function switchToArbitrum(){if(!selected||!account)throw new Error('Connect your selected wallet first.');setError('');try{await selected.provider.request({method:'wallet_switchEthereumChain',params:[{chainId:'0xa4b1'}]});const actual=chainNumber(await selected.provider.request({method:'eth_chainId'}));if(actual!==42161)throw new Error('Wallet is not on Arbitrum One. No transfer was requested.');setChainId(actual);setRevision(v=>v+1);}catch(e){setError(walletError(e));throw e;}}
  function disconnect(){generation.current++;void wc.current?.disconnect?.().catch(()=>{});wc.current=null;setAccount(null);setChainId(null);setQr(null);setBusy(false);setError('');setRevision(v=>v+1);}
  function client(){if(!selected||!account)throw new Error('Connect the explicitly selected wallet first.');return createWalletClient({chain:arbitrum,transport:custom(selected.provider as any)});}
  return <RuntimeContext.Provider value={runtime}><WalletContext.Provider value={{options,selected,account,chainId,revision,busy,error,qr,select,connect,connectWalletConnect,switchToArbitrum,disconnect,refresh,client}}>{children}</WalletContext.Provider></RuntimeContext.Provider>;
}
