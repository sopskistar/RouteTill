# RouteTill — owner submission copy

**Draft for owner review.** The owner will publish the approved video/X post and personally submit the official form. No application payload, personal information or submission request is prepared here.

## Project name

RouteTill

## Tagline

Human-approved agent purchases, verified cross-chain payment, and the right digital file—with proof.

## Description — paste into the `idea` field

RouteTill helps people buy digital resources through an agent without handing over control of their wallet. The agent can find and propose a purchase; the human approves the exact product, merchant recipient, spending cap, refund wallet and deadline, then personally confirms any payment.

NEAR Intents is essential: it quotes and executes an exact-output cross-chain payment from the buyer’s native Arbitrum USDC to the merchant’s native Base USDC. RouteTill independently checks the merchant’s chain receipt, asset, recipient, amount and finality before creating one durable digital entitlement. A signed Purchase Passport links the approved terms, settlement evidence and delivered file hash for independent verification.

Our first funded purchase is complete and FULFILLED: 10.105156 Arbitrum USDC deposited, NEAR Intents SUCCESS, exactly 10 Base USDC received, and 0.095729 USDC refunded to the buyer. One attempt created one entitlement, the correct 1,613-byte dataset and one signed Passport. Twelve independent verifier checks passed.

Judges can complete a public no-funds buyer walkthrough without registration or an owner code, then run five backend security checks: changed recipient, over-limit payment, reused approval, 20 repeated notifications producing one entitlement, and tampered evidence.

The included agent is deterministic, not an LLM or autonomous wallet. General production payment preparation remains disabled behind the existing exact-order guard. The public demo uses isolated Neon data and simulated payment evidence; genuine mainnet proof is published separately.

## Recommended tracks

| Recommendation | Official ID | Why it fits |
| --- | --- | --- |
| **Primary: Real-World Money** | `realworld` | A genuine merchant payment across chains, exact stablecoin receipt and digital product delivery. This is the strongest demonstrated result. |
| Secondary: AI Security & Defense | `security` | Human authorization, immutable policy, spending limits, fail-closed execution and executable adversarial checks. This protects agent-assisted commerce without giving the agent wallet authority. |
| Secondary: Agent Economy | `agents` | The deterministic agent discovers/proposes a paid developer resource and retrieves/verifies it after human approval. Do not claim LLM reasoning, negotiation or autonomous signing. |

Autonomous Business is weaker because RouteTill does not autonomously operate a business. DeFi is broader than the product’s merchant-payment purpose. Choose the tracks above that you wish to enter; there is one project submission with an array of track IDs.

## What makes RouteTill different

The focus is the connected chain of evidence: a human-controlled purchase → independently qualified cross-chain merchant receipt → one digital entitlement → exact approved file → signed Purchase Passport. Routing, payment links and signed receipts are not claimed as inventions. The resource is consumed by a deterministic example client, while the separate Lab makes the safety boundaries observable.

## Verified achievement and links

- Production: https://routetill.vercel.app
- Public buyer demo: https://routetill-demo.vercel.app/checkout/purchase-vectors?mode=demo
- Break-It Lab: https://routetill-demo.vercel.app/lab
- Repository/README: https://github.com/sopskistar/RouteTill
- Real signed Passport: https://routetill.vercel.app/passport/655d4cc9-0eaf-41b7-a7bf-05fc73286eea?mode=live
- Arbitrum source: https://arbiscan.io/tx/0x1afadae771327b11deb4132df51953bd307e2d13c57a8e276ec95f420e5a4a81
- Base merchant receipt: https://basescan.org/tx/0x8cc1225a938538842a42db97b5e3592fb37ede94632872d626dd91d1acafe121
- Arbitrum refund: https://arbiscan.io/tx/0x040de1f0e88378fcabcaa141480c5fa5499c329a8d899e4b4426fa7c8a6965a6
- [Provider SUCCESS, receipts, entitlement, artifact and reproducible verification](evidence/mainnet-655d4cc9-0eaf-41b7-a7bf-05fc73286eea/)
- Private video review file: `video/output/routetill-guided-product-review.mp4`. Do not describe it as publicly available until the owner approves and uploads it.

## Judge walkthrough — DO → SEE

1. **DO** open the public buyer demo, review the dataset and prepare the proposal. **SEE** the seller’s 10 USDC price, source limit, test refund wallet and file hash.
2. **DO** authorize the no-funds purchase and simulate payment. **SEE** one entitled file; verify its SHA-256 and inspect its signed demo Passport.
3. **DO** run five Lab checks. **SEE** unsafe changes and approval reuse rejected, 20 notifications producing one stored entitlement, and tampering detected.
4. **DO** inspect the separate genuine mainnet Passport and explorer links. **SEE** actual Arbitrum funding, NEAR Intents SUCCESS, exactly 10 Base USDC, a buyer refund, one delivery and independent verification.

## X post draft — attach the owner-approved narrated MP4

Your agent finds the dataset. You approve one purchase.

Built RouteTill at NEAR HACKATHON: NEAR Intents moved Arbitrum USDC to Base; verified receipt unlocked one file + signed proof.

Try it: https://routetill.vercel.app

@NEARProtocol #NEARHackathon

Attach the approved video directly; the site links to the public demo, source and payment evidence. The form’s `demoUrl` expects your public X post URL, not the website or local MP4. No public video URL or X post is invented here.

## Non-personal form values

- Project name: **RouteTill**
- Project URL: **https://github.com/sopskistar/RouteTill**
- Description / idea: paste the description above (1,595 characters; limit 2,000).
- Tracks: recommended `realworld`, `security`, `agents`; choose your final selection.
- Demo post URL: enter your own public X post URL after approving and attaching the narrated video. The website and local MP4 are not substitutes for that field.
- Tagline: use the optional tagline wherever the form or post supports it; do not invent additional official API fields.

## Owner-entered fields and final checks

Use the [official form and current rules](https://nearhackathon.com/HACKATHON.md). The official `idea` limit is 20–2,000 characters; the description above is designed to fit. Enter your own lead name, email, team size, NEAR mainnet payout account and contact consent. The Arbitrum/Base EVM wallets are not substitutes for the requested NEAR prize account. If independently submitting another project, make the required reciprocal README disclosure; at most two independent projects per person are allowed.

Repository must remain public through judging. Publish the owner-approved X demo with @NEARProtocol and #NEARHackathon, then paste its URL into the form. Deadline: November 14, 2026, 23:59 UTC. This document neither submits the form nor authorizes anyone else to do so.

## Limitations to disclose

One restricted mainnet purchase is verified; general public live payment activation is not implemented. Both apps retain disabled live preparation. The no-funds public walkthrough and Lab use simulated payment evidence with real application/Neon operations. Human approval and database uniqueness remain application assertions; RPC trust and provider routing association have explicit boundaries. Live downloads are buyer-session protected; the public CC0 artifact and signed evidence support reproduction. See [LIMITATIONS.md](LIMITATIONS.md) and [SECURITY.md](SECURITY.md).
