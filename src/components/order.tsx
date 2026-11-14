'use client';
import {useEffect,useState,useCallback,useRef} from 'react';
import Link from 'next/link';
import {ArrowRight,Check,Download,RefreshCw,Clock3,ShieldCheck,FileCheck2} from 'lucide-react';
import {api} from './api';
import {Badge,Notice,PageHead,ProofRail} from './ui';
import {PurchaseTerms} from './terms';
import {decimal} from '@/core/amounts';
import {LivePayment} from './live-payment';
export function OrderView({id}:{id:string}){
 const [data,setData]=useState<any>(null),[error,setError]=useState(''),[busy,setBusy]=useState(''),[approved,setApproved]=useState(false),[quote,setQuote]=useState<any>(null),[note,setNote]=useState('');
 const requestSequence=useRef(0),actionBusy=useRef(false),pendingRead=useRef<{id:string;promise:Promise<any>}|null>(null);
 const refresh=useCallback(async()=>{
  if(pendingRead.current?.id===id)return pendingRead.current.promise;
  const sequence=++requestSequence.current,started=performance.now();
  const task=(async()=>{try{
  const result=await api('orders/'+id,undefined,{signal:AbortSignal.timeout(20000)});
  if(sequence===requestSequence.current)setData({...result,clockServerNow:Date.parse(result.serverNow||new Date().toISOString())+performance.now()-started,clockObservedAt:performance.now()});return result;
  }catch(e){setError((e as Error).message);return null;}})();
  pendingRead.current={id,promise:task};try{return await task;}finally{if(pendingRead.current?.promise===task)pendingRead.current=null;}
 },[id]);
 useEffect(()=>{void refresh();},[refresh]);
 const attemptId=data?.attempt?.id,orderMode=data?.order?.policy?.mode,orderState=data?.order?.state;
 useEffect(()=>{
  if(!orderMode||['FULFILLED','FAILED','REFUNDED','DISPUTED'].includes(orderState))return;
  let reconciling=false;
  const timer=setInterval(async()=>{if(document.hidden)return;
   if(attemptId&&orderMode==='live'&&!reconciling){reconciling=true;try{await api(`orders/${id}/reconcile`,{},{signal:AbortSignal.timeout(45000)});}catch{}finally{reconciling=false;}}
   await refresh();
  },orderState==='APPROVED'||orderState==='QUOTING'?5000:10000);
  return()=>clearInterval(timer);
 },[attemptId,orderMode,orderState,id,refresh]);
 async function run(name:string,fn:()=>Promise<unknown>){if(actionBusy.current)return;actionBusy.current=true;setBusy(name);setError('');try{await fn();}catch(e){setError((e as Error).message);}finally{await refresh();actionBusy.current=false;setBusy('');}}
 if(!data)return <>{error?<Notice tone="bad">{error} <Link href="/" className="text-link">Return to RouteTill</Link></Notice>:<p role="status">Loading the stored purchase…</p>}</>;
 const o=data.order,p=o.policy,demo=p.mode==='demo',fulfilled=o.state==='FULFILLED';
 return <><PageHead title={fulfilled?'Your purchase, accounted for.':o.state==='PROPOSED'?'Approve one precise purchase.':'Follow the purchase.'} description="An agent proposes; you authorize the exact terms. Application approval grants no wallet access. You personally confirm any real transfer in your wallet." action={<Badge tone={fulfilled?'good':'neutral'}>{o.state.replaceAll('_',' ').toLowerCase()}</Badge>}/>
 {demo&&<Notice><strong>No-funds demo purchase.</strong>Approval, database delivery and file checks are real application actions. Payment evidence is simulated; this demonstration sends no money.</Notice>}
 {error&&<div className="field-error" role="alert">{error}</div>}{note&&<p className="status-message" role="status">{note}</p>}
 <div className="purchase-grid"><section className="panel"><PurchaseTerms policy={p} hash={o.fingerprint}/><details className="form-section"><summary>Inspect the immutable policy</summary><pre>{JSON.stringify(p,null,2)}</pre></details></section>
 <div className="stack"><section className="panel"><div className="stage-heading"><h2>{fulfilled?'Delivery is ready':o.state==='PROPOSED'?'Human authorization':'Payment & settlement'}</h2><ShieldCheck size={22}/></div>
 {o.state==='PROPOSED'&&<><p>Approve this merchant, exact product, settlement amount, route, source limit, expiry, and expected artifact hash. This authorization can be consumed once.</p><label className="check-label"><input type="checkbox" checked={approved} onChange={e=>setApproved(e.target.checked)}/><span>{demo?'I reviewed the product, seller, spending limit and test wallet. I approve this one no-funds demonstration purchase.':'I reviewed the purchase terms and authorize this single purchase and one payment preparation. I retain control of my wallet and personally confirm the transaction in Rabby.'}</span></label><button className="button button-full" disabled={!approved||!!busy} onClick={()=>run('approval',()=>api(`orders/${id}/approve`,{fingerprint:o.fingerprint}))}>{busy==='approval'?'Recording approval…':'Authorize this purchase'}<Check size={17}/></button></>}
 {demo&&!fulfilled&&data.viewerRole!=='guest'&&<div className="form-section"><h3>Genuine NEAR Intents quote</h3><p className="terms-description">Authenticated server-side dry quote. No deposit address, signing request, or funds movement.</p><button className="button button-quiet margin-top" disabled={!!busy} onClick={()=>run('quote',async()=>setQuote(await api(`orders/${id}/quote`,{})))}>{busy==='quote'?'Requesting live quote…':'Get live dry quote'}<RefreshCw size={16}/></button>{quote&&<><div className="live-quote"><Badge tone="good">Provider signature verified</Badge><p>Arbitrum USDC → Base USDC</p><strong>{decimal(quote.response.quote.amountIn)} USDC</strong><p>For {decimal(quote.response.quote.amountOut)} USDC to the merchant. Source wallet gas is extra. Preview only; re-quote before payment.</p><p>Quoted {new Date(quote.response.timestamp).toLocaleString()}</p></div><details><summary>Quote evidence & fee details</summary><pre>{JSON.stringify(quote,null,2)}</pre></details></>}</div>}
 {o.state==='APPROVED'&&demo&&<div className="form-section"><h3>Complete the no-funds purchase</h3><p className="terms-description">Simulate the payment notification. RouteTill checks the demo settlement and delivers one entitlement, even when the notification repeats 20 times. No wallet transaction is requested.</p><button className="button button-full margin-top" disabled={!!busy} onClick={()=>run('demo',async()=>{const r=await api('lab/challenge',{orderId:id,attack:'replay'});setNote(`${r.deliveries} notifications; ${r.storedEntitlements} stored entitlement. No real funds moved.`);})}>{busy==='demo'?'Verifying & issuing…':'Simulate payment & deliver'}<ArrowRight size={17}/></button></div>}
 {!demo&&o.state!=='PROPOSED'&&!fulfilled&&<LivePayment key={o.id} data={data} refresh={refresh}/>}
 {fulfilled&&<><ProofRail state="FULFILLED" synthetic={demo}/><div className="actions margin-top"><Link className="button" href={`/entitlements/${data.entitlements[0].id}?order=${id}&mode=${p.mode}`}><Download size={17}/>Get your digital product</Link><Link className="button button-quiet" href={`/passport/${id}?mode=${p.mode}`}><FileCheck2 size={17}/>Open Purchase Passport</Link></div>{demo&&<div className="demo-next-actions"><Link className="text-link" href="/lab">Run the five security checks<ArrowRight size={15}/></Link><Link className="text-link" href="https://routetill.vercel.app/#verified-purchase">Inspect the real mainnet payment<ArrowRight size={15}/></Link></div>}</>}
 {data.attempt?.last_error&&<Notice tone="warn">{data.attempt.last_error}</Notice>}
 {['FAILED','REFUNDED','INCOMPLETE','DISPUTED'].includes(o.state)&&<Notice><strong>{o.state.toLowerCase().replaceAll('_',' ')} payment</strong>No entitlement is issued without qualifying evidence. {o.state==='INCOMPLETE'?'A deposit below the quoted minimum may be refunded by the provider. Inspect status before sending additional funds.':'Check provider evidence and your source wallet. Refunds, if any, use the approved refund address.'}<Link className="text-link" href={`/checkout/${p.productId}?mode=${p.mode}`}>Prepare a new purchase<ArrowRight size={15}/></Link></Notice>}
 </section><section className="panel"><h2>Recorded lifecycle</h2><ol className="timeline">{data.events.map((e:any)=><li key={e.id}><Clock3 size={15}/><span>{e.kind.replaceAll('.',' / ')}</span><time dateTime={e.created_at}>{new Date(e.created_at).toLocaleTimeString()}</time></li>)}</ol><details className="margin-top"><summary>Stored payment evidence</summary><pre>{JSON.stringify(data.attempt,null,2)}</pre></details></section></div></div></>;
}
