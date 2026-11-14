# RouteTill communication and video handoff

This is an editorial handoff, not a new render or review of existing MP4s. Preserve all existing video files. [Locked positioning and claims](POSITIONING.md) is authoritative for future editing.

## Locked opening

RouteTill — Agent-assisted cross-chain checkout with human approval and verified digital delivery.

**The agent proposes. You authorize. RouteTill verifies payment and delivery.**

## 30-second spoken explanation

“John needs a dataset. His agent proposes one, but John keeps control of his wallet. RouteTill binds his approval to the exact purchase. John separately confirms the payment: Arbitrum USDC goes through NEAR Intents to a merchant receiving Base USDC. RouteTill independently checks the merchant’s receipt before granting access to the matching file. A signed Purchase Passport links the approval, payment evidence and delivered bytes. Try the no-funds demo, then inspect our separate completed mainnet purchase.”

76 words; actual duration depends on the narrator. John is an illustrative buyer, not a named external customer. The example agent is deterministic, not an LLM browsing or signing.

## Same five scenes, essential screen moments

| Scene | Essential screen / action | Concise narration direction | Required label |
| --- | --- | --- | --- |
| Agent finds it — John needs a dataset. | Existing resource card: merchant, Agent Purchase Test Vectors, 10 USDC | An agent proposes the merchant’s dataset; John has Arbitrum USDC and the seller wants Base USDC | Illustrative buyer; agent discovery is explanatory |
| No blank check — His money. His decision. | Existing agent / human permission split | Agent credentials cannot approve purchases or sign transfers | No autonomous wallet control |
| John says yes — One file. One approval. | Existing `/demo` typed 11 USDC cap + fixture refund; then isolated guest terms and human approval | Exact seller, product, cap, refund, file digest and deadline; wallet confirmation is a separate human action | No-funds UI reenactment; ETH gas additional; merchant price unchanged |
| Payment verified — Paid on Arbitrum. Received on Base. | Route map, then separate real source and merchant receipt evidence panels | NEAR Intents provides quote and cross-chain execution; RouteTill independently checks merchant token, recipient, amount and finality | Simulated progression first; historical mainnet evidence dated November 13, 2026 on the cutaway |
| File + proof — Delivered. With proof. | Real public Passport; original record check, digest and entitlement evidence | One durable entitlement, matching file, signed linked record | Signature integrity, chain observations and artifact matching are distinct checks |

Close briefly on the actual five controlled Lab outcomes, including 20 notifications → one entitlement. Label “Controlled no-funds security checks.” Direct judges to guided `/demo`, hands-on demo checkout, `/lab` and the real Passport as four different experiences.

## Exact verified claims and sources

All financial claims refer to order `655d4cc9-0eaf-41b7-a7bf-05fc73286eea`, not an action in the demonstration. Evidence root: `docs/evidence/mainnet-655d4cc9-0eaf-41b7-a7bf-05fc73286eea/`.

- `verification-manifest.json`: FULFILLED, one attempt, one entitlement, one Passport, 1,613 bytes.
- `source-transfer.json`: 10.105156 native Arbitrum USDC. [Source explorer](https://arbiscan.io/tx/0x1afadae771327b11deb4132df51953bd307e2d13c57a8e276ec95f420e5a4a81).
- `provider-status.json`: genuine NEAR Intents SUCCESS; unsigned provider routing association is not itself a cryptographic causal proof.
- `base-chain-facts.json`: exactly 10 native Base USDC to the approved merchant. [Merchant explorer](https://basescan.org/tx/0x8cc1225a938538842a42db97b5e3592fb37ede94632872d626dd91d1acafe121).
- `arbitrum-refund-facts.json`: 0.095729 USDC source-chain refund. [Refund explorer](https://arbiscan.io/tx/0x040de1f0e88378fcabcaa141480c5fa5499c329a8d899e4b4426fa7c8a6965a6).
- `purchase-passport.json`, `production-public-key.txt`, `agent-purchase-test-vectors.md`, `cli-verification.json`: signed record, matching bytes and twelve passing standalone checks. Digest `f7ecb13c8d1b1576b17311ad3eb3a18848f44bdac3a742dbc66e0ba726f65643`.
- [Public Passport](https://routetill.vercel.app/passport/655d4cc9-0eaf-41b7-a7bf-05fc73286eea?mode=live), [reproduction](evidence/mainnet-655d4cc9-0eaf-41b7-a7bf-05fc73286eea/REPRODUCE.txt).

## Missing footage / boundaries

No new original recording of the historical funded wallet confirmation is available from this pass. Do not fabricate a Rabby signature or present a reenactment as the original transaction recording. Capture no-funds interactions only; use saved financial evidence for historical claims. No new purchase, funds movement or public video upload is authorized. Publication and the chosen final cut remain the owner’s decision. Existing video files, narration, captions and source were not changed by this communication pass.
