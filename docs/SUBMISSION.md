# RouteTill — owner submission copy

**Draft for owner review.** The owner-approved video is publicly hosted unchanged. The owner will publish the X post and personally submit the official form. No application payload, personal information or submission request is prepared here.

## Project name

RouteTill

## Tagline

Agent-assisted cross-chain checkout with human approval and verified digital delivery.

## Description — paste into the `idea` field

NEAR Intents 1Click is the cross-chain payment engine behind RouteTill: a buyer pays in native USDC on Arbitrum while the merchant receives native USDC on Base.

An AI agent can suggest a paid developer dataset, but should not receive unrestricted access to the user's money. RouteTill lets the human authorize one precise purchase: the product, merchant recipient, source-spending ceiling, refund wallet, expected file hash and deadline. The buyer separately confirms any wallet payment.

NEAR Intents provides authenticated exact-output quotes and executes the cross-chain route. RouteTill then checks the provider outcome and independently observes the Base merchant receipt, token, recipient, amount and finality. Only qualifying evidence can unlock one durable digital entitlement. The signed Purchase Passport links the approved terms, settlement evidence and matching file digest for independent inspection.

On November 13, RouteTill completed a genuine mainnet purchase: 10.105156 Arbitrum USDC funded; NEAR Intents SUCCESS; exactly 10 USDC received on Base; 0.095729 USDC refunded; one entitlement, the correct 1,613-byte dataset and one signed Passport. Twelve independent verification checks passed.

Judges can try a no-funds checkout without registration or an owner code, run five actual backend security checks—including recipient substitution, over-limit payment, approval reuse, 20 replayed notifications producing one entitlement and Passport tampering—and inspect separate public mainnet proof.

The demonstration uses simulated payment evidence in an isolated environment. The example agent is deterministic, not an LLM or unrestricted wallet signer; general public live-payment activation remains disabled.

## Recommended tracks

| Recommendation | Official ID | Why it fits |
| --- | --- | --- |
| **Primary: Real-World Money** | `realworld` | A genuine merchant payment across chains, exact stablecoin receipt and digital product delivery. This is the strongest demonstrated result. |
| Secondary: AI Security & Defense | `security` | Human authorization, immutable policy, spending limits, fail-closed execution and executable adversarial checks. This protects agent-assisted commerce without giving the agent wallet authority. |
| Secondary: Agent Economy | `agents` | The deterministic agent discovers/proposes a paid developer resource and retrieves/verifies it after human approval. Do not claim LLM reasoning, negotiation or autonomous signing. |

Autonomous Business is weaker because RouteTill does not autonomously operate a business. DeFi is broader than the product’s merchant-payment purpose. Choose the tracks above that you wish to enter; there is one project submission with an array of track IDs.

[Canonical positioning and evidence boundaries](POSITIONING.md). The agent proposes. You authorize. RouteTill verifies payment and delivery. John is illustrative; the merchant and buyer are two sides of one purchase.

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
- Approved final video (original MP4): https://github.com/sopskistar/RouteTill/releases/download/judge-demo-final-2026-11-14/RouteTill_Judge_Demo_Final_Updated_Frontend.mp4
- [Video preservation and hosted-original verification](FINAL_VIDEO.md). Local file: `video/output/RouteTill_Judge_Demo_Final_Updated_Frontend.mp4`. Older cuts are historical, not the selected final film.

## Judge walkthrough — DO → SEE

1. **DO** open the public buyer demo, review the dataset and prepare the proposal. **SEE** the seller’s 10 USDC price, source limit, test refund wallet and file hash.
2. **DO** authorize the no-funds purchase and simulate payment. **SEE** one entitled file; verify its SHA-256 and inspect its signed demo Passport.
3. **DO** run five Lab checks. **SEE** unsafe changes and approval reuse rejected, 20 notifications producing one stored entitlement, and tampering detected.
4. **DO** inspect the separate genuine mainnet Passport and explorer links. **SEE** actual Arbitrum funding, NEAR Intents SUCCESS, exactly 10 Base USDC, a buyer refund, one delivery and independent verification.

## X post draft — attach the owner-approved narrated MP4

Your agent can find a dataset without controlling your wallet.

Built RouteTill at NEAR HACKATHON. NEAR Intents: Arbitrum USDC → Base USDC; verified receipt unlocks the file.

https://routetill.vercel.app/demo
https://github.com/sopskistar/RouteTill

@NEARProtocol #NEARHackathon

Attach the approved video directly; the site links to the public demo, source and payment evidence. The form’s `demoUrl` expects your public X post URL, not the website or local MP4. The original approved MP4 is available above; no public X post URL has been provided or invented.

## Non-personal form values

- Project name: **RouteTill**
- Project URL: **https://github.com/sopskistar/RouteTill**
- Description / idea: paste the description above (1,728 characters including paragraph breaks; limit 2,000).
- Tracks: recommended `realworld`, `security`, `agents`; choose your final selection.
- Demo post URL: enter your own public X post URL after approving and attaching the narrated video. The website and local MP4 are not substitutes for that field.
- Tagline: use the optional tagline wherever the form or post supports it; do not invent additional official API fields.

## Owner-entered fields and final checks

Use the [official form and current rules](https://nearhackathon.com/HACKATHON.md). The official `idea` limit is 20–2,000 characters; the description above is designed to fit. Enter your own lead name, email, team size, NEAR mainnet payout account and contact consent. The Arbitrum/Base EVM wallets are not substitutes for the requested NEAR prize account. If independently submitting another project, make the required reciprocal README disclosure; at most two independent projects per person are allowed.

Repository must remain public through judging. Check your submission history before sending anything. Local records do not establish whether the project has already been submitted. If not submitted, publish your X demo with @NEARProtocol and #NEARHackathon and use its URL in the form. If already submitted and a correction is needed, use [Request changes](https://nearhackathon.com/request-changes), not another application. Deadline: November 14, 2026, 23:59 UTC. This document neither submits the form nor authorizes anyone else to do so.

## Limitations to disclose

One restricted mainnet purchase is verified; general public live payment activation is not implemented. Both apps retain disabled live preparation. The no-funds public walkthrough and Lab use simulated payment evidence with real application/Neon operations. Human approval and database uniqueness remain application assertions; RPC trust and provider routing association have explicit boundaries. Live downloads are buyer-session protected; the public CC0 artifact and signed evidence support reproduction. See [LIMITATIONS.md](LIMITATIONS.md) and [SECURITY.md](SECURITY.md).
