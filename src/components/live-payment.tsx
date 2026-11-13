'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import {arbitrum} from 'viem/chains';
import {formatEther} from 'viem';
import {Wallet,RefreshCw} from 'lucide-react';
import {api} from './api';
import {Badge,Hash,Notice} from './ui';
import {WalletSelector} from './wallet-selector';
import {useWallet} from './wallet-provider';
import {assertTransfer,chainNumber,walletRequestRejected} from '@/wallet/evm';
import {fundingDeadline,preflightBudget} from '@/core/payment-window';
import {decimal} from '@/core/amounts';

type WalletProgress={status:'wallet-open'|'unknown'|'broadcast';hash?:string};
const message=(error:unknown)=>error instanceof Error?error.message:'The check could not complete. RouteTill will check the saved purchase again.';

/** Read-only checks may repeat. Execution and wallet submission never silently repeat. */
export function LivePayment({data,refresh}:{data:any;refresh:()=>Promise<any>}){
 const wallet=useWallet(),o=data.order,p=o.policy,a=data.attempt,q=a?.quote?.response;
 const [packet,setPacket]=useState<any>(null),[packetUntil,setPacketUntil]=useState(0),[tick,setTick]=useState(0);
 const [checking,setChecking]=useState(false),[busy,setBusy]=useState(''),[error,setError]=useState(''),[note,setNote]=useState('');
 const [consent,setConsent]=useState(false),[tx,setTx]=useState(''),[progress,setProgress]=useState<WalletProgress|null>(null);
 const action=useRef(false),checkRequest=useRef<Promise<any>|null>(null),retryAt=useRef(0),packetExpires=useRef(0);
 const current=useRef({revision:wallet.revision,orderId:o.id});
 const executionStarted=useRef(false),registrationBusy=useRef(false),registrationFailures=useRef(0),registrationAt=useRef(0);
 const storageKey='routetill-payment-'+o.id,txKey='routetill-tx-'+o.id;
 const correctWallet=!!wallet.account&&wallet.account.toLowerCase()===p.refundAddress.toLowerCase()&&wallet.chainId===42161;
 const submitted=!!(tx||a?.source_tx),deadline=fundingDeadline(p,q);
 const serverNow=(data.clockServerNow||Date.parse(data.serverNow)||Number.POSITIVE_INFINITY)+Math.max(0,tick-(data.clockObservedAt||tick));
 const expired=serverNow>=deadline-15000;
 const fresh=!!packet&&packetUntil>tick;
 const liveAttempt=a?.state==='AWAITING_DEPOSIT'&&o.state==='AWAITING_DEPOSIT'&&!!q;

 useEffect(()=>{const timer=setInterval(()=>setTick(performance.now()),1000);setTick(performance.now());return()=>clearInterval(timer);},[]);
 useEffect(()=>{
  current.current={revision:wallet.revision,orderId:o.id};packetExpires.current=0;retryAt.current=0;setPacket(null);setPacketUntil(0);setConsent(false);setError('');
 },[wallet.revision,o.id,a?.id]);
 useEffect(()=>{
  const restore=()=>{setTx(localStorage.getItem(txKey)||a?.source_tx||'');try{setProgress(JSON.parse(localStorage.getItem(storageKey)||'null'));}catch{setProgress({status:'unknown'});}};
  restore();window.addEventListener('storage',restore);return()=>window.removeEventListener('storage',restore);
 },[storageKey,txKey,a?.source_tx]);

 const checks=useCallback(async(force=false):Promise<any>=>{
  if(checkRequest.current){if(!force)return checkRequest.current;try{await checkRequest.current;}catch{ /* A fresh final check may recover a read-only failure. */ }}
  const revision=wallet.revision,orderId=o.id;
  const task=(async()=>{
   setChecking(true);setError('');const started=performance.now();
   try{
    const result=await api(`orders/${orderId}/preflight`,{},{signal:AbortSignal.timeout(45000)});
    if(current.current.revision!==revision||current.current.orderId!==orderId)throw new Error('Wallet selection changed. Connect the approved buyer wallet; checks will run again.');
    const budget=preflightBudget(result,performance.now()-started);
    if(budget<5000)throw Object.assign(new Error('The connection was too slow for fresh checks. Retrying read-only checks; do not confirm an old wallet request.'),{code:'PREFLIGHT_STALE'});
    assertTransfer(result.transaction,{account:p.refundAddress,depositAddress:a.deposit_address,amount:q.quote.amountIn});
    if(result.policyFingerprint!==o.fingerprint)throw new Error('The payment checks do not match the saved purchase. No wallet request was made.');
    packetExpires.current=performance.now()+budget;setPacketUntil(packetExpires.current);setPacket(result);retryAt.current=0;return result;
   }catch(e){packetExpires.current=0;setPacketUntil(0);setPacket(null);retryAt.current=performance.now()+15000;setError(message(e));throw e;}
   finally{setChecking(false);}
  })();
  checkRequest.current=task;try{return await task;}finally{if(checkRequest.current===task)checkRequest.current=null;}
 },[wallet.revision,o.id,o.fingerprint,p.refundAddress,a,q]);

 // A live wallet connection refreshes checks automatically; focus/online wakes recovery.
 useEffect(()=>{
  if(!liveAttempt||!correctWallet||submitted||expired||progress||busy||document.hidden)return;
  if(performance.now()>=retryAt.current&&packetExpires.current-performance.now()<20000&&!checkRequest.current)void checks().catch(()=>{});
 },[tick,liveAttempt,correctWallet,submitted,expired,progress,busy,checks]);
 useEffect(()=>{const wake=()=>{retryAt.current=0;setTick(performance.now());void refresh();};window.addEventListener('online',wake);window.addEventListener('focus',wake);return()=>{window.removeEventListener('online',wake);window.removeEventListener('focus',wake);};},[refresh]);

 // Only this authenticated buyer's approved, server-eligible trial can prepare once.
 useEffect(()=>{
  if(o.state!=='APPROVED'||data.approvalConsumed||!data.preparation?.ready||!correctWallet||expired||executionStarted.current)return;
  executionStarted.current=true;
  const key='routetill-prepare-'+o.id;
  if(localStorage.getItem(key)){setNote('Checking the saved instruction request. Do not create another purchase or repeat the request.');return;}
  const idempotencyKey=crypto.randomUUID();localStorage.setItem(key,idempotencyKey);setBusy('instructions');setError('');
  void api(`orders/${o.id}/execute`,{policy:p,idempotencyKey},{signal:AbortSignal.timeout(90000)}).catch(e=>setError(message(e))).finally(async()=>{await refresh();setBusy('');});
 },[o.id,o.state,p,data.approvalConsumed,data.preparation?.ready,correctWallet,expired,refresh]);

 // After broadcast, only idempotent source verification/registration is retried.
 useEffect(()=>{
  if(!/^0x[0-9a-fA-F]{64}$/.test(tx)||a?.source_tx||registrationBusy.current||performance.now()<registrationAt.current)return;
  registrationBusy.current=true;setNote('Checking source confirmation and registering the saved transaction. No second transfer will be requested.');
  void api(`orders/${o.id}/deposit`,{txHash:tx},{signal:AbortSignal.timeout(45000)}).then(()=>{setNote('Source transaction verified. Tracking provider settlement and independent merchant receipt.');registrationFailures.current=0;}).catch(e=>{
   registrationFailures.current++;setNote((e as any).code==='SOURCE_PENDING'?'Waiting for Arbitrum confirmation. This page will register the transaction automatically.':`Registration is pending: ${message(e)} Your transaction hash is saved; do not pay again.`);
  }).finally(async()=>{registrationAt.current=performance.now()+Math.min(60000,3000*2**Math.min(5,registrationFailures.current));registrationBusy.current=false;await refresh();});
 },[tick,tx,a?.source_tx,o.id,refresh]);

 async function pay(){
  if(action.current||!consent||!wallet.account||!wallet.selected)return;
  action.current=true;setBusy('payment');setError('');
  try{
   if(!navigator.locks)throw new Error('This browser cannot protect against simultaneous payment tabs. Open RouteTill in a current Chrome browser with Rabby.');
   await navigator.locks.request('routetill-payment-'+o.id,{ifAvailable:true},async lock=>{
    if(!lock)throw new Error('This purchase already has a wallet request open in another tab. Continue there.');
    if(localStorage.getItem(storageKey)||localStorage.getItem(txKey)||a?.source_tx)throw new Error('A wallet request or transaction is already saved. Check Rabby activity; do not send another transfer.');
    const revision=wallet.revision,provider=wallet.selected!.provider;
    let result:any;
    for(let attempt=0;attempt<2;attempt++){
     try{result=await checks(true);break;}catch(e){if(attempt||!['PREFLIGHT_STALE','RESPONSE_INTERRUPTED'].includes((e as any).code))throw e;}
    }
    const [addresses,chain]=await Promise.all([provider.request({method:'eth_accounts'}),provider.request({method:'eth_chainId'})]);
    if(current.current.revision!==revision||current.current.orderId!==o.id||addresses?.[0]?.toLowerCase()!==p.refundAddress.toLowerCase()||chainNumber(chain)!==42161)throw new Error('Wallet account or network changed. Select the approved buyer on Arbitrum One; no payment was requested.');
    if(packetExpires.current<=performance.now()+5000)throw new Error('The network delayed the final checks. RouteTill will refresh automatically; no wallet request was made.');
    const serverTime=Date.parse(result.validUntil)-(packetExpires.current-performance.now());
    if(Date.parse(result.fundingDeadline)-serverTime<60000)throw new Error('Less than a minute remains to review this payment safely. Do not fund this expired or closing purchase.');
    assertTransfer(result.transaction,{account:p.refundAddress,depositAddress:a.deposit_address,amount:q.quote.amountIn});
    const pending:WalletProgress={status:'wallet-open'};localStorage.setItem(storageKey,JSON.stringify(pending));setProgress(pending);
    try{
     const hash=await wallet.client().sendTransaction({chain:arbitrum,account:p.refundAddress,to:result.transaction.to,data:result.transaction.data,value:0n,gas:BigInt(result.gas.gasLimit)});
     if(!/^0x[0-9a-fA-F]{64}$/.test(hash))throw new Error('The wallet response did not include a transaction hash. Check wallet activity before continuing.');
     localStorage.setItem(txKey,hash);localStorage.setItem(storageKey,JSON.stringify({status:'broadcast',hash}));setProgress({status:'broadcast',hash});setTx(hash);setConsent(false);setNote('Transaction hash saved. Waiting for source confirmation; registration and settlement tracking are automatic.');
    }catch(e){
     if(walletRequestRejected(e)){localStorage.removeItem(storageKey);setProgress(null);setError('You rejected the wallet transaction. Nothing was sent by this request. You can review and try again while the purchase is valid.');}
     else{localStorage.setItem(storageKey,JSON.stringify({status:'unknown'}));setProgress({status:'unknown'});setError('The wallet result is uncertain. Check Rabby activity and restore the existing transaction hash below. Do not send another payment.');}
    }
   });
  }catch(e){setError(message(e));}
  finally{action.current=false;setBusy('');await refresh();}
 }

 const date=(value:number|string)=>new Date(value).toLocaleString(undefined,{timeZoneName:'short'});
 return <div className="form-section">
  <h3>{submitted?'Track your payment':a?.deposit_address?'Confirm the exact payment':'Connect your payment wallet'}</h3>
  <dl className="data-list"><div><dt>Buyer & refund wallet</dt><dd><Hash value={p.refundAddress}/></dd></div><div><dt>Purchase authorization ends</dt><dd>{date(p.expiresAt)}</dd></div>{q&&<><div><dt>Exact source spend</dt><dd>{decimal(q.quote.amountIn)} native USDC on Arbitrum One</dd></div><div><dt>Merchant receives</dt><dd>{decimal(p.destinationAmount)} native USDC on Base</dd></div><div><dt>Merchant recipient</dt><dd><Hash value={p.recipient}/></dd></div><div><dt>Deposit address</dt><dd><Hash value={a.deposit_address}/></dd></div><div><dt>Fund before</dt><dd>{date(deadline)} — later provider dates do not extend this purchase</dd></div></>}</dl>
  {error&&<p className="field-error" role="alert">{error}</p>}{note&&<p role="status">{note}</p>}
  {!submitted&&!expired&&!progress&&['APPROVED','AWAITING_DEPOSIT'].includes(o.state)&&<>
   <WalletSelector/>
   {wallet.account&&!correctWallet&&<Notice tone="warn">{wallet.account.toLowerCase()!==p.refundAddress.toLowerCase()?'Select the approved buyer account in Rabby. The merchant wallet cannot fund this purchase.':'Switch the selected wallet to Arbitrum One. Checks resume automatically.'}</Notice>}
  </>}
  {o.state==='APPROVED'&&!expired&&!data.preparation?.ready&&<Notice>Waiting for this exact purchase’s secure trial activation. This page checks automatically. No approval is consumed until the server allows preparation.</Notice>}
  {(o.state==='QUOTING'||busy==='instructions')&&<p role="status">Preparing one signed instruction set. Your approval is single-use; do not repeat the request. No wallet transaction is being signed.</p>}
  {liveAttempt&&!submitted&&!expired&&!progress&&<div className="payment-preflight">
   <Badge tone={fresh?'good':'neutral'}>{checking?'Checking balances & gas…':fresh?'Read-only checks current':'Refreshing read-only checks'}</Badge>
   {packet&&<dl className="data-list"><div><dt>USDC balance</dt><dd>{decimal(packet.source.usdcBalance)}</dd></div><div><dt>Arbitrum ETH balance</dt><dd>{formatEther(BigInt(packet.source.ethBalanceWei))} ETH</dd></div><div><dt>Estimated gas</dt><dd>{formatEther(BigInt(packet.gas.estimatedGasWei))} ETH, additional to USDC</dd></div><div><dt>Buffered gas reserve</dt><dd>{formatEther(BigInt(packet.gas.reserveWei))} ETH</dd></div></dl>}
   <p className="terms-description">Balances and gas refresh automatically. Pay performs fresh server checks before opening Rabby. Connecting and checking never move funds.</p>
   {q&&<details><summary>Exact transaction, provider deadline & risks</summary><p>Provider deposit lifetime: {date(q.quote.deadline)}. RouteTill’s earlier funding deadline above controls this purchase.</p><pre>{JSON.stringify(packet?.transaction||{chainId:42161,token:'Native Arbitrum USDC',depositAddress:a.deposit_address,amount:q.quote.amountIn},null,2)}</pre><p>Gas is spent even if settlement fails. Refunds use the approved refund wallet and depend on the provider; recovery can be delayed or reduced by fees. Reject a wallet request if the funding deadline passes while it is open.</p></details>}
   <label className="check-label"><input type="checkbox" checked={consent} disabled={!!busy||!correctWallet} onChange={e=>setConsent(e.target.checked)}/><span>I authorize exactly {decimal(q.quote.amountIn)} native Arbitrum USDC to this deposit address, plus ETH gas. I will personally review and confirm the transaction in Rabby.</span></label>
   <button className="button button-full" disabled={!consent||!correctWallet||!!busy} onClick={pay}><Wallet size={17}/>{busy==='payment'?'Checking, then awaiting your wallet confirmation…':`Pay ${decimal(q.quote.amountIn)} USDC with ${wallet.selected?.name||'your wallet'}`}</button>
  </div>}
  {progress&&!submitted&&<Notice tone="warn">{progress.status==='wallet-open'?'Review the one request in Rabby. Do not confirm after the funding deadline.':'Wallet outcome unknown. Check Rabby activity before doing anything else.'} A second transfer is blocked. If a transaction was submitted, paste its hash below to resume tracking.</Notice>}
  {expired&&!submitted&&<Notice tone="warn">The funding window has closed. Do not send to this deposit, even if its provider date is later. Existing evidence and reconciliation are preserved; an expired approval cannot be reused.</Notice>}
  {submitted&&<><p role="status">{a?.source_tx?'Source deposit recorded. Waiting for qualifying merchant settlement and finality.':'Transaction saved. Verifying its source confirmation automatically.'}</p><Hash value={tx||a.source_tx}/></>}
  {a?.deposit_address&&<details className="margin-top"><summary>Recover a transaction after a refresh or lost wallet response</summary><p>Use an existing Arbitrum transaction hash from Rabby. This only registers and verifies an existing transfer; it never sends another payment.</p><label className="field">Existing source transaction hash<input value={tx||a.source_tx||''} readOnly={!!a.source_tx} onChange={e=>{const value=e.target.value;setTx(value);if(/^0x[0-9a-fA-F]{64}$/.test(value))localStorage.setItem(txKey,value);}} placeholder="0x…"/></label><button className="button button-quiet" onClick={()=>void refresh()}><RefreshCw size={16}/>Check saved purchase status</button></details>}
 </div>;
}
