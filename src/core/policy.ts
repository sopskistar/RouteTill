import {fingerprint} from './crypto';
import {assertAtomic} from './amounts';
import {DomainError,Policy,requireThat,State} from './types';
export const ARB_USDC='nep141:arb-0xaf88d065e77c8cc2239327c5edb3a432268e5831.omft.near';
export const BASE_USDC='nep141:base-0x833589fcd6edb6e08f4c7c32d4f71b54bda02913.omft.near';
export const BASE_TOKEN='0x833589fcd6edb6e08f4c7c32d4f71b54bda02913';
export const ARB_TOKEN='0xaf88d065e77c8cc2239327c5edb3a432268e5831';
export const DEMO_WALLET='0x1111111111111111111111111111111111111111';
export function enforcePolicy(approved:Policy,requested:Policy,expectedFingerprint:string,now=Date.now()) {
  requireThat(Date.parse(approved.expiresAt)>now,'APPROVAL_EXPIRED','This approval has expired. Prepare a new purchase.');
  requireThat(approved.recipient.toLowerCase()===requested.recipient.toLowerCase(),'MERCHANT_SUBSTITUTION','Recipient changed after approval. The approved merchant must receive this purchase.');
  requireThat(approved.merchantId===requested.merchantId,'MERCHANT_SUBSTITUTION','Merchant identity does not match the approval.');
  requireThat(approved.productId===requested.productId,'UNAUTHORIZED_PRODUCT','This product was not approved.');
  requireThat(assertAtomic(requested.maxSourceAmount)<=assertAtomic(approved.maxSourceAmount),'PRICE_LIMIT','Requested source amount exceeds the approved maximum.');
  requireThat(requested.destinationAmount===approved.destinationAmount,'PRICE_CHANGE','Destination price changed after approval.');
  requireThat(requested.sourceAsset===approved.sourceAsset&&requested.destinationAsset===approved.destinationAsset&&requested.sourceChain===approved.sourceChain&&requested.destinationChain===approved.destinationChain,'UNSUPPORTED_ROUTE','The requested payment route was not approved.');
  requireThat(fingerprint(approved)===expectedFingerprint&&fingerprint(requested)===expectedFingerprint,'POLICY_MISMATCH','Purchase terms no longer match the immutable approved fingerprint.');
}
const transitions:Record<State,State[]>={PROPOSED:['APPROVED'],APPROVED:['QUOTING'],QUOTING:['AWAITING_DEPOSIT','FAILED'],AWAITING_DEPOSIT:['PROCESSING','PROVIDER_SUCCESS','INCOMPLETE','REFUNDED','FAILED','DISPUTED'],PROCESSING:['PROVIDER_SUCCESS','INCOMPLETE','REFUNDED','FAILED','DISPUTED'],PROVIDER_SUCCESS:['VERIFIED','DISPUTED'],VERIFIED:['FULFILLED','DISPUTED'],FULFILLED:[],INCOMPLETE:['PROCESSING','PROVIDER_SUCCESS','REFUNDED','FAILED','DISPUTED'],REFUNDED:[],FAILED:[],DISPUTED:[]};
export function transition(from:State,to:State){if(from!==to&&!transitions[from].includes(to))throw new DomainError('INVALID_TRANSITION',`Cannot change ${from} to ${to}.`,409);return to;}
