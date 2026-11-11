export type Mode = 'demo' | 'live';
export type Policy = {
  version: 1; authorizationId: string; merchantId: string; merchantName: string;
  recipient: string; productId: string; productName: string; artifactSha256: string;
  sourceAsset: string; destinationAsset: string; sourceChain: number; destinationChain: number;
  destinationToken: string; destinationAmount: string; maxSourceAmount: string;
  refundAddress: string; expiresAt: string; mode: Mode;
};
export type State = 'PROPOSED'|'APPROVED'|'QUOTING'|'AWAITING_DEPOSIT'|'PROCESSING'|'PROVIDER_SUCCESS'|'VERIFIED'|'FULFILLED'|'INCOMPLETE'|'REFUNDED'|'FAILED'|'DISPUTED';
export type SettlementEvidence = {
  kind:'SYNTHETIC'|'CHAIN'; verified:boolean; reasons:string[];
  chainId:number; token:string; recipient:string; expectedAmount:string; actualAmount:string;
  txHash:string|null; logIndex:number|null; blockNumber:string|null; blockHash:string|null;
  confirmations:number; requiredConfirmations:number; finalized:boolean; checkedAt:string;
  receipt?:unknown; finalizedBlock?:unknown; providerAssociation?:string;
};
export type Product = {id:string;merchant_id:string;slug:string;title:string;description:string;amount:string;artifact:string;artifact_hash:string;created_at:string;merchant_name?:string;wallet?:string;wallet_verified?:boolean};
export type Order = {id:string;merchant_id:string;buyer_id:string;buyer_owner_id:string;product_id:string;policy:Policy;fingerprint:string;state:State;created_at:string;updated_at:string};
export type Attempt = {id:string;order_id:string;idempotency_key:string;state:State;quote:any;deposit_address:string|null;source_tx:string|null;provider:any;evidence:SettlementEvidence|null;poll_count:number;next_poll_at:string;last_error:string|null;created_at:string};
export type Actor = {merchantId:string;buyerId:string;mode:Mode;sessionHash:string;role:'merchant'|'judge'|'agent';authKind?:'cookie'|'bearer'};
export class DomainError extends Error {
  constructor(public code:string, message:string, public status=400) {super(message);}
}
export function requireThat(condition:unknown,code:string,message:string,status=400):asserts condition {if(!condition)throw new DomainError(code,message,status);}
