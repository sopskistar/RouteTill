# RouteTill positioning and claim guide

**RouteTill — Agent-assisted cross-chain checkout with human approval and verified digital delivery.**

**The agent proposes. You authorize. RouteTill verifies payment and delivery.**

## One purchase, two sides

John is an illustrative developer who needs a dataset. An agent proposes the merchant’s 10 USDC product. John holds USDC on Arbitrum; the merchant wants USDC on Base. John reviews the exact seller, product, recipient, source-spending cap, refund wallet, expected file digest and deadline. His application authorization is separate from his personal wallet transaction confirmation.

The merchant lists the file, sets the price, chooses a supported receiving wallet and shares hosted checkout. This is the other side of the same agent-assisted purchase, not a separate merchant-only product.

NEAR Intents 1Click provides authenticated exact-output quotes and cross-chain execution. RouteTill checks the quote signature and terms, qualifies settlement with independent merchant receipt observations, grants one durable entitlement to matching bytes and issues a Purchase Passport.

**Purchase Passport:** A signed record linking what you approved, the merchant payment evidence and the file you received. Introduce RouteTill first, Passport second. ProofFlow is the underlying verification engine, useful in developer explanations rather than the opening pitch.

## Roles and trust boundaries

- The example agent is deterministic. It does not use an LLM to browse the internet or autonomously shop. Its credentials cannot approve a purchase or sign wallet transfers.
- The human authorizes one application policy, then separately confirms the actual wallet transfer. An application approval is not a blockchain signature.
- NEAR Intents routes the payment; RouteTill is not a proprietary bridge or custodial escrow. The evidenced RouteTill route is native Arbitrum USDC → native Base USDC.
- RouteTill checks provider outcome **and** independently observes the intended merchant’s token, recipient, exact amount and finality. Provider SUCCESS alone is insufficient. RPC observations depend on trusted RPCs; routing association partly relies on the provider’s unsigned status response.
- Exactly-once means one durable entitlement, not one HTTP download. Authorized repeat downloads are allowed. SHA-256 checks approved bytes, not usefulness or quality.
- A Passport signature authenticates the issuer’s record. It does not itself establish blockchain settlement, consensus or database-wide uniqueness. Pin the issuer key independently.

## Claim → evidence

| Type | Claim and consequence | Authoritative source | Boundary |
| --- | --- | --- | --- |
| Implemented functionality | Exact single-use application policy, distinct wallet confirmation, constrained preparation | [orders](../src/services/orders.ts), [trial guard](../src/core/live-trial.ts), [wallet preflight](../src/services/payment-preflight.ts), [agent client](../scripts/agent.ts) | Agent cannot authorize or sign; general live preparation disabled |
| Implemented functionality | Provider SUCCESS plus independent receipt qualification gates digital access | [reconciliation](../src/services/reconcile.ts), [settlement checks](../src/integrations/settlement.ts), [fulfillment](../src/services/fulfillment.ts) | Provider association and RPC trust remain distinct |
| Recorded mainnet result | One November 13, 2026 FULFILLED purchase: 10 Base USDC; one entitlement; matching 1,613-byte file; signed Passport | [manifest](evidence/mainnet-655d4cc9-0eaf-41b7-a7bf-05fc73286eea/verification-manifest.json), [idempotency](evidence/mainnet-655d4cc9-0eaf-41b7-a7bf-05fc73286eea/idempotency-check.json), [artifact](evidence/mainnet-655d4cc9-0eaf-41b7-a7bf-05fc73286eea/agent-purchase-test-vectors.md) | This purchase’s result, not platform adoption or performance |
| Recorded mainnet result | Twelve standalone checks passed, including quote signature, artifact and independent chain observations | [CLI result](evidence/mainnet-655d4cc9-0eaf-41b7-a7bf-05fc73286eea/cli-verification.json), [reproduce](evidence/mainnet-655d4cc9-0eaf-41b7-a7bf-05fc73286eea/REPRODUCE.txt) | Current reproduction needs available trusted RPCs; packaged key alone is not identity |
| No-funds demonstration | Public guest checkout, SQL delivery, five controlled backend security checks; 20 notifications constrained to one entitlement | [Lab handlers](../src/services/lab.ts), [judge instructions](JUDGE_WALKTHROUGH.md) | Payment evidence is simulated; no real transfer occurs. Guided `/demo` is a UI reenactment, separate from backend checkout |
| Intended use / future capability | Ordinary customers use agent-assisted cross-chain checkout without per-order operator deployment | [limitations](LIMITATIONS.md) | General live activation architecture is not implemented or enabled; not an installed commerce-platform plugin |

## Editorial rules

Keep John illustrative and the recorded purchase historical. Label each public simulation and UI reenactment persistently. Link the genuine mainnet Passport separately. Never imply the demo creates another mainnet payment.

Do not claim AP2 compatibility, Chain Signatures, NEAR AI inference, an LLM shopping agent, new chains or invention of authorization mandates, checkout, routing or signed receipts. Show precise mechanisms and consequences instead of “everything verified.” The 11 USDC source cap excludes separately reviewed ETH gas.

Use this guide for the website, README, judge instructions, submission copy and future video. Older dated evidence and private video versions remain historical records; do not retrofit them into new test results.
