import {Fingerprint} from 'lucide-react';
import {Policy} from '@/core/types';
import {decimal} from '@/core/amounts';
import {Badge,Hash} from './ui';
export function ProductCover(){return <div className="artifact-cover" aria-hidden="true"><span>RouteTill<br/>Field notes</span><Fingerprint size={44}/><span className="cover-bottom">A guide to verifiable purchases</span></div>;}
export function PurchaseTerms({policy,hash,compact=false}:{policy:Policy;hash:string;compact?:boolean}){return <>
 <div className="terms-header"><div><p className="muted">{policy.merchantName}</p><h2>{policy.productName}</h2></div><Badge tone={policy.mode==='demo'?'warn':'neutral'}>{policy.mode==='demo'?'Synthetic purchase':'Live purchase'}</Badge></div>
 <p className="terms-price">{decimal(policy.destinationAmount)} <span>USDC on Base</span></p>
 <dl className="data-list"><div><dt>Source limit</dt><dd>{decimal(policy.maxSourceAmount)} USDC on Arbitrum</dd></div><div><dt>Merchant recipient</dt><dd><Hash value={policy.recipient} short={compact}/></dd></div><div><dt>Refund address</dt><dd><Hash value={policy.refundAddress} short={compact}/></dd></div><div><dt>Authorization expires</dt><dd>{new Date(policy.expiresAt).toLocaleString()}</dd></div><div><dt>Approval use</dt><dd>One purchase only</dd></div><div><dt>Artifact SHA-256</dt><dd><Hash value={policy.artifactSha256} short={compact}/></dd></div><div><dt>Policy fingerprint</dt><dd><Hash value={hash} short={compact}/></dd></div></dl>
 </>;}
