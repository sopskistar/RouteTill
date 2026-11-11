import {describe,it,expect} from 'vitest';
import {verifyQuoteSignature} from '@defuse-protocol/one-click-sdk-typescript';
import fixture from './fixtures/near-dry-quote.json';
import {atomic,decimal} from '../src/core/amounts';
import {fingerprint} from '../src/core/crypto';
import {enforcePolicy,transition,ARB_USDC,BASE_USDC,BASE_TOKEN,DEMO_WALLET} from '../src/core/policy';
import {checkQuote,checkQuoteTerms} from '../src/integrations/near';
import {inspectTransfer,syntheticFacts} from '../src/integrations/settlement';
import {Policy} from '../src/core/types';
export function policy():Policy{return {version:1,authorizationId:crypto.randomUUID(),merchantId:'m',merchantName:'Studio',recipient:DEMO_WALLET,productId:'p',productName:'Notes',artifactSha256:'a'.repeat(64),sourceAsset:ARB_USDC,destinationAsset:BASE_USDC,sourceChain:42161,destinationChain:8453,destinationToken:BASE_TOKEN,destinationAmount:'10000000',maxSourceAmount:'11000000',refundAddress:DEMO_WALLET,expiresAt:new Date(Date.now()+600000).toISOString(),mode:'demo'};}
describe('exact financial amounts',()=>{
 it('preserves six-decimal precision',()=>expect(atomic('10.104624')).toBe('10104624'));
 it('round-trips a large integer without float conversion',()=>expect(decimal(atomic('999999999999999999.123456'))).toBe('999999999999999999.123456'));
 it.each(['0','-1','1e6','01','1.0000001','NaN','Infinity'])('rejects invalid or imprecise amount %s',v=>expect(()=>atomic(v)).toThrow());
 it('supports the smallest positive unit',()=>expect(atomic('0.000001')).toBe('1'));
});
describe('immutable single-purchase policy',()=>{
 it('accepts a purchase within its fixed terms',()=>{const p=policy();expect(()=>enforcePolicy(p,p,fingerprint(p))).not.toThrow();});
 it.each([['merchant substitution',{recipient:'0x9999999999999999999999999999999999999999'}],['price increase',{maxSourceAmount:'11000001'}],['destination price change',{destinationAmount:'10000001'}],['unauthorized product',{productId:'other'}],['unsupported asset',{sourceAsset:'other'}],['wrong source chain',{sourceChain:1}],['artifact replacement',{artifactSha256:'b'.repeat(64)}],['refund substitution',{refundAddress:'0x9999999999999999999999999999999999999999'}]])('rejects %s',(_name,changes)=>{const p=policy();expect(()=>enforcePolicy(p,{...p,...changes},fingerprint(p))).toThrow();});
 it('rejects expired approval',()=>{const p=policy();expect(()=>enforcePolicy(p,p,fingerprint(p),Date.parse(p.expiresAt)+1)).toThrow('expired');});
 it('rejects policy fingerprint mismatch',()=>{const p=policy();expect(()=>enforcePolicy(p,p,'wrong')).toThrow('fingerprint');});
 it('accepts valid lifecycle transition',()=>expect(transition('AWAITING_DEPOSIT','PROVIDER_SUCCESS')).toBe('PROVIDER_SUCCESS'));
 it('rejects skipping directly to fulfillment',()=>expect(()=>transition('PROPOSED','FULFILLED')).toThrow());
 it('does not roll fulfilled state backward',()=>expect(()=>transition('FULFILLED','PROCESSING')).toThrow());
});
describe('original authenticated production quote evidence',()=>{
 const now=Date.parse(fixture.response.timestamp);const p={...policy(),mode:'live' as const};
 it('verifies the real provider signature',()=>expect(verifyQuoteSignature(fixture.response as any)).toBe(true));
 it('binds a genuine signed quote to approved terms',()=>expect(checkQuote(fixture.response,p,true,now).signatureVerified).toBe(true));
 it.each(['recipient','amount'])('rejects tampered signed %s',field=>{const q=structuredClone(fixture.response);(q.quoteRequest as any)[field]='tampered';expect(()=>checkQuote(q,p,true,now)).toThrow('signature');});
 it('rejects a stale quote',()=>expect(()=>checkQuote(fixture.response,p,true,now+100000)).toThrow('stale'));
 it('rejects source amount over approved maximum',()=>expect(()=>checkQuote(fixture.response,{...p,maxSourceAmount:'10000000'},true,now)).toThrow('maximum'));
 it('rejects wrong recipient despite a valid signature',()=>expect(()=>checkQuote(fixture.response,{...p,recipient:'0x9999999999999999999999999999999999999999'},true,now)).toThrow('recipient'));
 it('does not treat unsigned dry quote fees as signature-covered',()=>{const q=structuredClone(fixture.response);q.quote.refundFee='99999999';expect(verifyQuoteSignature(q as any)).toBe(true);});
 it('checks minimum deposit independently of signature validation',()=>{const q=structuredClone(fixture.response);q.quote.minAmountIn='999999999';expect(()=>checkQuoteTerms(q,p,true,now)).toThrow('minimum deposit');});
 it('checks formatted precision independently of signature validation',()=>{const q=structuredClone(fixture.response);q.quote.amountInFormatted='10.00';expect(()=>checkQuoteTerms(q,p,true,now)).toThrow('formatting');});
 it('rejects expired executable quote terms',()=>{const q:any=structuredClone(fixture.response);q.quoteRequest.dry=false;q.quote.depositAddress=DEMO_WALLET;q.quote.deadline=new Date(now-1).toISOString();q.quote.timeWhenInactive=q.quote.deadline;expect(()=>checkQuoteTerms(q,p,false,now)).toThrow('expired');});
});
describe('destination chain receipt validation',()=>{
 it('qualifies a fully matching synthetic receipt through the real validator',()=>{const p=policy(),f=syntheticFacts(p,'valid');expect(inspectTransfer(p,f.receipt.transactionHash,f).verified).toBe(true);});
 const mutations:Record<string,(f:any)=>void>={
  'wrong chain':f=>{f.chainId='0x1';},'wrong token':f=>{f.receipt.logs[0].address='0x9999999999999999999999999999999999999999';},'wrong recipient':f=>{f.receipt.logs[0].topics[2]='0x'+'9'.repeat(64);},'insufficient amount':f=>{f.receipt.logs[0].data='0x'+'1'.padStart(64,'0');},'failed receipt':f=>{f.receipt.status='0x0';},'missing receipt':f=>{f.receipt=null;},'insufficient confirmations':f=>{f.head='0x10001';},'missing finality':f=>{f.finalized=null;},'unfinalized block':f=>{f.finalized.number='0xffff';},'reorged block':f=>{f.canonicalBlock.hash='0x'+'0'.repeat(64);},'ambiguous matching transfers':f=>{f.receipt.logs.push(f.receipt.logs[0]);},'removed log':f=>{f.receipt.logs[0].removed=true;},'incorrect transaction reference':f=>{f.receipt.transactionHash='0x'+'0'.repeat(64);}
 };
 it.each(Object.keys(mutations))('fails closed for %s',name=>{const p=policy(),f=syntheticFacts(p,name),hash=f.receipt.transactionHash;mutations[name](f);expect(inspectTransfer(p,hash,f).verified).toBe(false);});
});
