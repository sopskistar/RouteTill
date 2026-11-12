'use client';
import {Check,RefreshCw,Wallet,X} from 'lucide-react';
import {Badge,Hash} from './ui';
import {useRuntime,useWallet} from './wallet-provider';

export function WalletSelector({onAccount}:{onAccount?:(address:string)=>void}){
  const wallet=useWallet(),runtime=useRuntime();
  return <section className="wallet-selector" aria-label="EVM wallet selector">
    <div className="stage-heading"><h3>Choose your wallet</h3><button type="button" className="icon-button" aria-label="Refresh detected wallets" onClick={wallet.refresh}><RefreshCw size={15}/></button></div>
    <div className="wallet-options" role="group" aria-label="Detected browser wallets">
      {wallet.options.filter(w=>w.kind==='injected').map(w=><button type="button" key={w.id} className={'wallet-option'+(wallet.selected?.id===w.id?' wallet-selected':'')} disabled={wallet.busy} aria-pressed={wallet.selected?.id===w.id} onClick={()=>wallet.select(w.id)}><Wallet size={20}/><span><strong>{w.name}</strong><small>{w.rdns==='io.rabby'?'Preferred wallet':w.rdns==='legacy.browser'?'Legacy browser provider':'Discovered browser wallet'}</small></span>{wallet.selected?.id===w.id&&<Check size={17}/>}</button>)}
      {!wallet.options.length&&<p className="terms-description">No browser wallet detected. Open this page in a browser with Rabby, MetaMask, or a compatible EVM wallet.</p>}
    </div>
    {wallet.selected?.kind==='injected'&&!wallet.account&&<button type="button" className="button button-full margin-top" disabled={wallet.busy} onClick={async()=>{try{const account=await wallet.connect();onAccount?.(account);}catch{}}}>{wallet.busy?'Review connection in your wallet…':`Connect ${wallet.selected.name}`}</button>}
    <button type="button" className="button button-quiet button-full margin-top" disabled={wallet.busy||!runtime.walletConnectProjectId} onClick={()=>wallet.connectWalletConnect()}>Connect with WalletConnect</button>
    {!runtime.walletConnectProjectId&&<p className="terms-description">WalletConnect is unavailable until this deployment is configured. Discovered browser wallets remain available.</p>}
    {wallet.qr&&<div className="wallet-qr"><img src={wallet.qr} width={256} height={256} alt="Scan with a WalletConnect-compatible EVM wallet to connect"/><p>Scan to connect. This does not authorize payment.</p><button type="button" className="button button-quiet" onClick={wallet.disconnect}><X size={15}/>Cancel connection</button></div>}
    {wallet.account&&<><dl className="data-list margin-top"><div><dt>Selected wallet</dt><dd>{wallet.selected?.name}</dd></div><div><dt>Selected account</dt><dd><Hash value={wallet.account}/></dd></div><div><dt>Network</dt><dd><Badge tone={wallet.chainId===42161?'good':'warn'}>{wallet.chainId===42161?'Arbitrum One':wallet.chainId===8453?'Base':wallet.chainId?`Chain ${wallet.chainId}`:'Unknown network'}</Badge></dd></div><div><dt>Payment asset</dt><dd>Native USDC on Arbitrum One</dd></div></dl><div className="actions margin-top">{onAccount&&<button type="button" className="button button-quiet" onClick={()=>onAccount(wallet.account!)}>Use selected account</button>}{wallet.chainId!==42161&&<button type="button" className="button button-quiet" onClick={async()=>{try{await wallet.switchToArbitrum();}catch{}}}>Switch to Arbitrum One</button>}<button type="button" className="text-link" onClick={wallet.disconnect}>Disconnect</button></div></>}
    {wallet.error&&<p className="field-error margin-top" role="alert">{wallet.error}</p>}
    <p className="terms-description">Only the selected provider receives wallet requests. Connecting never signs a transaction or grants unrestricted spending.</p>
  </section>;
}
