# RouteTill — owner submission copy

**Draft for owner review.** The owner-approved video is publicly hosted unchanged. The owner has provided the [public X demo post](https://x.com/sopskistar/status/2121630057839968439) and will personally manage the official form. Organizer submission status remains unknown without a receipt. No application payload, personal information or submission request is prepared here.

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

## Owner-selected tracks — confirmed November 14, 2026

The owner selected all five tracks for **one RouteTill project submission**: `security`, `agents`, `realworld`, `business`, `open`.

| Selected track | Official ID | Implemented basis and boundaries |
| --- | --- | --- |
| AI Security & Defense | `security` | Human authorization, immutable purchase terms, spending limits, fail-closed execution and controlled backend security checks. |
| Agent Economy | `agents` | A deterministic client proposes a paid resource and retrieves/verifies it after fulfillment; no LLM reasoning or autonomous wallet signing is claimed. |
| Real-World Money | `realworld` | One recorded cross-chain merchant payment, exact stablecoin receipt and matching digital-product delivery. |
| Autonomous Business | `business` | Merchant listing, hosted checkout and verified digital fulfillment demonstrate a bounded commerce workflow, not a fully autonomous business. |
| Open Innovation | `open` | Purchase-policy enforcement, independent receipt checks, durable entitlement and an inspectable signed Passport form one connected prototype. |

RouteTill is the owner's **only project submission**. This owner confirmation establishes project scope and selected tracks; it is not an organizer submission receipt.

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

## Public X post — supplied by the owner November 14, 2026

https://x.com/sopskistar/status/2121630057839968439

Use this public post for the form’s Demo post link. Its publication does not establish that the hackathon application was submitted.

### Earlier X draft — retained for reference

Your agent can find a dataset without controlling your wallet.

Built RouteTill at NEAR HACKATHON. NEAR Intents: Arbitrum USDC → Base USDC; verified receipt unlocks the file.

https://routetill.vercel.app/demo
https://github.com/sopskistar/RouteTill

@NEARProtocol #NEARHackathon

The form’s `demoUrl` expects the public X post above, not the application, video-hosting URL or local MP4. The earlier draft is historical guidance, not a request to publish a second post. The approved MP4 remains unchanged.

## Non-personal form values

- Project name: **RouteTill**
- Project URL: **https://github.com/sopskistar/RouteTill**
- Description / idea: paste the description above (1,728 characters including paragraph breaks; limit 2,000).
- Tracks: owner-selected `security`, `agents`, `realworld`, `business`, `open`.
- Demo post URL: **https://x.com/sopskistar/status/2121630057839968439**.
- Tagline: use the optional tagline wherever the form or post supports it; do not invent additional official API fields.

## Owner-entered fields and final checks

Use the [official form and current rules](https://nearhackathon.com/HACKATHON.md). The official `idea` limit is 20–2,000 characters; the description above is designed to fit. Enter your own lead name, email, team size, NEAR mainnet payout account and contact consent. The Arbitrum/Base EVM wallets are not substitutes for the requested NEAR prize account. The owner confirms RouteTill is the only project submission; no second-project disclosure is applicable.

Repository must remain public through judging. The owner confirms that the hosted application and no-funds demo will remain available through November 25, 2026. Check your submission history before sending anything. Local records do not establish whether the project has already been submitted. If not submitted, use the supplied public X demo URL in the form. If already submitted and a correction is needed, use [Request changes](https://nearhackathon.com/request-changes), not another application. Deadline: November 14, 2026, 23:59 UTC. This document neither submits the form nor authorizes anyone else to do so.

## Recorded purchase amount clarification — November 14, 2026

The 11 USDC source cap was not the deposit. Deposit **10.105156 USDC** minus the **0.095729 USDC** refund gives **10.009427 USDC net spend**. The merchant received **10 USDC on Base**. Network gas was additional. Do not attribute the remaining difference to a specific fee without supporting evidence.

## Limitations to disclose

One restricted mainnet purchase is verified; general public live payment activation is not implemented. Both apps retain disabled live preparation. The no-funds public walkthrough and Lab use simulated payment evidence with real application/Neon operations. Human approval and database uniqueness remain application assertions; RPC trust and provider routing association have explicit boundaries. Live downloads are buyer-session protected; the public CC0 artifact and signed evidence support reproduction. See [LIMITATIONS.md](LIMITATIONS.md) and [SECURITY.md](SECURITY.md).
