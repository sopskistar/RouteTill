import {z} from 'zod';
import {isAddress} from 'viem';
import {fingerprint} from './crypto';
import {assertDeploymentMode} from './deployment';
import {ARB_USDC,BASE_USDC,BASE_TOKEN} from './policy';
import {Actor,Order,requireThat} from './types';

type Environment=Record<string,string|undefined>;
const address=z.string().refine(value=>isAddress(value),'Expected an EVM address');
const digest=z.string().regex(/^[a-f0-9]{64}$/);
const trialSchema=z.object({
  orderId:z.uuid(),policyFingerprint:digest,authorizationId:z.uuid(),
  merchantId:z.uuid(),buyerId:z.uuid(),approverBuyerId:z.uuid(),productId:z.uuid(),
  recipient:address,buyerAddress:address,refundAddress:address,artifactSha256:digest,
  expiresAt:z.iso.datetime(),
}).strict();
export type LiveTrial=z.infer<typeof trialSchema>;
export type TrialApproval={id:string;buyer_id:string;fingerprint:string;expires_at:string|Date;consumed_at:string|Date|null};

/** One runtime binding, never a list, wildcard, default order or client-controlled setting. */
export function liveTrialConfiguration(env:Environment=process.env):LiveTrial {
  let parsed:unknown;
  try{parsed=JSON.parse(env.LIVE_PAYMENT_TRIAL||'');}catch{ /* Reject without echoing configuration. */ }
  const result=trialSchema.safeParse(parsed);
  requireThat(result.success,'TRIAL_CONFIGURATION','Configure one exact production trial order before enabling payment preparation.',503);
  const trial=result.data;
  requireThat(trial.buyerAddress.toLowerCase()===trial.refundAddress.toLowerCase(),'TRIAL_CONFIGURATION','The trial buyer and refund wallet must match.',503);
  return trial;
}

/** Must run under the order and approval locks, before any consumption or provider call. */
export function enforceLiveTrial(order:Order,actor:Actor,approval:TrialApproval,env:Environment=process.env,now=Date.now()) {
  requireThat(actor.mode==='live'&&order.policy.mode==='live','DEMO_PAYMENT_BLOCKED','Synthetic orders cannot create live payment instructions.',403);
  assertDeploymentMode('live',env);
  requireThat(env.ENABLE_LIVE_PAYMENTS==='true','LIVE_DISABLED','Live deposit creation is disabled until the owner enables it.',403);
  const trial=liveTrialConfiguration(env),p=order.policy;
  requireThat(Date.parse(trial.expiresAt)>now,'TRIAL_EXPIRED','The configured trial expired. Prepare and approve a fresh purchase.',403);
  requireThat(order.id===trial.orderId&&order.fingerprint===trial.policyFingerprint&&fingerprint(p)===trial.policyFingerprint,
    'TRIAL_SCOPE','This order or immutable policy is outside the configured trial.',403);
  requireThat(p.authorizationId===trial.authorizationId&&p.merchantId===trial.merchantId&&order.merchant_id===trial.merchantId&&
    actor.merchantId===order.buyer_owner_id&&order.buyer_id===trial.buyerId&&actor.buyerId===trial.buyerId&&
    p.productId===trial.productId&&order.product_id===trial.productId&&p.artifactSha256===trial.artifactSha256&&
    p.recipient.toLowerCase()===trial.recipient.toLowerCase()&&p.refundAddress.toLowerCase()===trial.refundAddress.toLowerCase()&&
    p.refundAddress.toLowerCase()===trial.buyerAddress.toLowerCase()&&Date.parse(p.expiresAt)===Date.parse(trial.expiresAt),
    'TRIAL_TERMS','Saved purchase terms do not match the configured trial.',403);
  requireThat(p.sourceChain===42161&&p.destinationChain===8453&&p.sourceAsset===ARB_USDC&&p.destinationAsset===BASE_USDC&&
    p.destinationToken.toLowerCase()===BASE_TOKEN&&p.destinationAmount==='10000000'&&p.maxSourceAmount==='11000000',
    'TRIAL_ROUTE','The trial requires native Arbitrum USDC to 10 native Base USDC with an 11 USDC source ceiling.',403);
  requireThat(order.state==='APPROVED'&&approval.id===trial.authorizationId&&approval.fingerprint===trial.policyFingerprint&&
    approval.buyer_id===trial.approverBuyerId&&approval.consumed_at===null&&
    new Date(approval.expires_at).getTime()===Date.parse(trial.expiresAt)&&new Date(approval.expires_at).getTime()>now,
    'TRIAL_AUTHORIZATION','A matching unexpired, unconsumed human authorization is required.',403);
}
