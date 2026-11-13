import {describe,it,expect} from 'vitest';
import {fundingDeadline,preflightBudget} from '../src/core/payment-window';
import {walletRequestRejected} from '../src/wallet/evm';
describe('payment freshness and immutable funding window',()=>{
 const policy={expiresAt:'2026-11-13T14:45:23.169Z'};
 const response={quoteRequest:{deadline:'2026-11-13T14:42:00.336Z'},quote:{deadline:'2026-11-16T14:42:00.336Z',timeWhenInactive:'2026-11-16T14:42:00.336Z'}};
 it('uses the requested deadline even when the provider adds three days',()=>expect(fundingDeadline(policy,response)).toBe(Date.parse(response.quoteRequest.deadline)));
 it('never extends the human policy expiry',()=>expect(fundingDeadline({expiresAt:'2026-11-13T14:30:00.000Z'},response)).toBe(Date.parse('2026-11-13T14:30:00.000Z')));
 it('fails closed for incomplete or invalid executable deadlines',()=>{expect(fundingDeadline(policy,{...response,quote:{}})).toBe(0);expect(fundingDeadline({...policy,expiresAt:'invalid'},response)).toBe(0);});
 it('can show the policy deadline before any quote exists',()=>expect(fundingDeadline(policy)).toBe(Date.parse(policy.expiresAt)));
 const packet={checkedAt:'2026-11-13T14:00:00.000Z',serverNow:'2026-11-13T14:00:10.000Z',validUntil:'2026-11-13T14:01:00.000Z'};
 it('subtracts server work and network latency without relying on the buyer clock',()=>expect(preflightBudget(packet,12000)).toBe(38000));
 it('does not double-count server work on a slow connection',()=>expect(preflightBudget({...packet,serverRequestAt:packet.checkedAt},12000)).toBe(48000));
 it('rejects a response whose whole freshness window was spent in transit',()=>expect(preflightBudget(packet,60000)).toBe(0));
 it('fails closed for invalid preflight times',()=>expect(preflightBudget({...packet,validUntil:'invalid'},1)).toBe(0));
});
describe('wallet result recovery',()=>{
 it('allows a new explicit request after a definite nested user rejection',()=>expect(walletRequestRejected({cause:{cause:{code:4001}}})).toBe(true));
 it('does not mistake a disconnect, timeout or pending wallet request for a safe rejection',()=>{for(const code of [4900,-32002,'ETIMEDOUT'])expect(walletRequestRejected({cause:{code}})).toBe(false);});
 it('handles cyclic wallet causes without hanging',()=>{const error:any={};error.cause=error;expect(walletRequestRejected(error)).toBe(false);});
});
