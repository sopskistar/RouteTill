'use client';
import {useState} from 'react';
import Link from 'next/link';
import {ArrowRight,FileCheck2,Fingerprint,LockKeyhole,ShieldCheck,Route,FileJson,ArrowUpRight} from 'lucide-react';
import {Badge,Hash,Mark} from './ui';

export function PassportPreview({digest,labHref}:{digest:string;labHref:string}){
 const [tab,setTab]=useState(0);
 const content=[{title:'The purchase stays specific.',text:'Merchant, product, route, source limit, expiry and file digest are pinned to one use.',label:'Policy',value:'Exact terms; no wallet access'}, {title:'Payment alone is not enough.',text:'Provider status must agree with a finalized token transfer to the intended merchant.',label:'Settlement',value:'Pending until independently checked'}, {title:'The file has a checkable identity.',text:'The downloaded file must match its approved SHA-256. That proves bytes, not quality.',label:'Delivery',value:'Expected digest pinned below'}][tab];
 return <section className="hero-passport" aria-label="Illustrative Purchase Passport"><div className="passport-preview-top"><span><Mark size={22}/>Purchase Passport</span><Badge tone="warn">Illustrative terms</Badge></div>
  <div className="passport-preview-product"><div className="resource-stamp" aria-hidden="true"><FileJson size={30}/><span>JSON<br/>test vectors</span></div><div><p>RouteTill Labs · digital resource</p><h2>Agent Purchase Test Vectors</h2><strong>10 USDC <span>to the merchant on Base</span></strong></div></div>
  <dl className="preview-terms"><div><dt>Approved source limit</dt><dd>11 USDC · Arbitrum</dd></div><div><dt>SHA-256</dt><dd><Hash value={digest} short/></dd></div></dl>
  <div className="preview-stage-tabs" role="group" aria-label="Explore Passport evidence">{['Authorization','Settlement','Delivery'].map((label,i)=><button key={label} type="button" aria-pressed={tab===i} onClick={()=>setTab(i)}>{i===0?<LockKeyhole size={15}/>:i===1?<Route size={15}/>:<FileCheck2 size={15}/>}<span>{label}</span></button>)}</div>
  <div className="preview-evidence" aria-live="polite"><h3>{content.title}</h3><p>{content.text}</p></div>
  <div className="passport-preview-bottom"><span>No payment or settlement is represented.</span><Link href={labHref}>Inspect a real demo record<ArrowUpRight size={14}/></Link></div>
 </section>;
}
const stages=[
 {name:'Propose',title:'The agent asks for one useful file.',body:'It discovers the product, reads structured terms and prepares a purchase. The included client uses deterministic rules and never signs a transaction.',detail:'Agent Purchase Test Vectors · 10 USDC',icon:FileJson},
 {name:'Approve',title:'You decide exactly what is allowed.',body:'Review the merchant, recipient, product, source limit, route, expiration and expected file digest. Approval grants no unrestricted wallet access.',detail:'Single-use policy · 11 USDC source cap',icon:LockKeyhole},
 {name:'Pay',title:'NEAR Intents routes the payment.',body:'A genuine exact-output quote creates deposit instructions after approval. The selected wallet still requires a separate explicit confirmation.',detail:'Arbitrum native USDC → Base native USDC',icon:Route},
 {name:'Verify',title:'The merchant’s receipt has to qualify.',body:'Provider success is checked against the destination token, recipient, amount, canonical receipt, confirmations and finalized block. Missing evidence blocks delivery.',detail:'Provider association + independent chain observation',icon:ShieldCheck},
 {name:'Deliver',title:'One qualifying purchase, one entitlement.',body:'A PostgreSQL transaction binds the payment attempt to a durable entitlement. Retries are idempotent; the entitled file is a real download.',detail:'Unique order and payment-attempt constraints',icon:FileCheck2},
 {name:'Prove',title:'Verify the record and the actual file.',body:'Export the Purchase Passport, pin the issuer key and run the separate verifier. The agent also checks the file digest before consuming its data.',detail:'Signed assertions, chain facts and limitations separated',icon:Fingerprint}
];
export function PurchaseLifecycle({checkoutHref}:{checkoutHref:string}){
 const [active,setActive]=useState(0);const stage=stages[active],Icon=stage.icon;
 return <div className="lifecycle-explorer"><div className="lifecycle-steps" role="group" aria-label="Explore the six purchase stages">{stages.map((s,i)=><button type="button" key={s.name} onClick={()=>setActive(i)} aria-pressed={active===i}><span>{i+1}</span>{s.name}</button>)}</div><div className="lifecycle-detail" aria-live="polite"><div><Icon size={24}/><h3>{stage.title}</h3><p>{stage.body}</p><strong>{stage.detail}</strong></div><Link className="text-link" href={checkoutHref}>Open the prepared checkout<ArrowRight size={16}/></Link></div></div>;
}
const challenges=[
 {title:'Change the recipient',approved:'Intended merchant wallet',attempted:'Different settlement wallet',condition:'The recipient must match the approved policy.'},
 {title:'Raise the source amount',approved:'11.000000 USDC maximum',attempted:'11.000001 USDC requested',condition:'The request must stay within the source spending cap.'},
 {title:'Reuse the approval',approved:'One purchase authorization',attempted:'A second purchase attempt',condition:'A consumed authorization cannot be used again.'},
 {title:'Replay the notification',approved:'One qualifying purchase',attempted:'20 repeated event deliveries',condition:'The database must issue one durable entitlement.'},
 {title:'Modify the Passport',approved:'Original signed record and file',attempted:'Altered recipient or file bytes',condition:'The signature, binding or artifact hash must fail.'}
];
export function ChallengePreview({labHref}:{labHref:string}){
 const [selected,setSelected]=useState(0);const a=challenges[selected];
 return <div className="challenge-preview"><div className="challenge-preview-list" role="group" aria-label="Choose an illustrative attack">{challenges.map((x,i)=><button type="button" key={x.title} aria-pressed={selected===i} onClick={()=>setSelected(i)}>{x.title}<ArrowRight size={15}/></button>)}</div><div className="challenge-preview-scene"><div className="comparison-labels"><div><span>Approved purchase</span><strong>{a.approved}</strong></div><div><span>Unauthorized change</span><strong>{a.attempted}</strong></div></div><p>{a.condition}</p><p className="preview-disclosure">Illustrative only. Run the real challenge in Break-It Lab.</p><Link href={labHref} className="button">Run the real judge challenge<ArrowRight size={17}/></Link></div></div>;
}
