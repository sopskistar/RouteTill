# Judge walkthrough

RouteTill connects one human-approved purchase to NEAR Intents settlement, one digital entitlement and a signed Purchase Passport. John’s five scenes on the homepage explain the experience behind our first paying purchase. Agent discovery is visualized; the recorded financial and delivery evidence is genuine.

## Start without a wallet or access code

1. **DO** Open [Try the demo / buyer checkout](https://routetill-demo.vercel.app/checkout/purchase-vectors?mode=demo). **SEE** Agent Purchase Test Vectors, the merchant-set 10 Base USDC price, Arbitrum USDC source, prepared 11 USDC cap and test refund wallet. This is a no-funds walkthrough, with simulated payment evidence.
2. **DO** Select **Review purchase proposal**. **SEE** a PROPOSED purchase with exact terms, artifact SHA-256, immutable policy fingerprint and expiry. No registration, merchant workspace or owner code is required.
3. **DO** Review the terms, tick the approval box and select **Authorize this purchase**. **SEE** the single-use human approval recorded. This grants no wallet access.
4. **DO** Select **Simulate payment & deliver**. **SEE** the actual backend settlement validator and transactional delivery produce one entitlement from repeated demo notifications. No wallet signature or transfer is requested.
5. **DO** Get your digital product and select **Verify delivered file**. **SEE** the downloaded bytes match the approved SHA-256. Download the resource and optional deterministic test-plan JSON.
6. **DO** Open its Purchase Passport, check the original, then test a modified recipient. **SEE** original integrity PASS and changed evidence FAIL. This demo’s simulated chain evidence is not proof of mainnet settlement.

The guest session lasts 30 minutes and is limited to three prepared purchases and 15 challenge calls. A session can access its own purchases and files, never production resources or other buyers’ downloads. Starting in checkout creates the same bounded guest session as the Lab. If a network request fails, use the visible recovery control rather than assuming it succeeded.

## Break-It Lab: five controlled security checks

Open [Break-It Lab](https://routetill-demo.vercel.app/lab) and choose **Run 5 security checks**.

| Check | Approved / attempted change | Actual required outcome |
| --- | --- | --- |
| Changed merchant recipient | Approved merchant / different recipient | Rejected; a payment cannot be redirected after approval |
| Payment exceeding the approved limit | 11 USDC cap / one atomic unit over it | Rejected; even the smallest excess is blocked |
| Reused authorization | One purchase / second consumption | Rejected; exactly one attempt remains |
| Replayed payment notifications | One qualifying demo purchase / 20 notifications, 15 concurrent | Exactly one stored Neon entitlement |
| Tampered Purchase Passport | Original signed record and exact file / altered recipient or bytes | Original passes; altered record and file fail |

The approved purchase, attempted change, explanation and expandable backend evidence are visible for each check. Inspect the linked Passport and entitled file. These checks move no real funds. A completed demo order is FULFILLED for its isolated entitlement, while its mainnet settlement remains unverified by design.

## Inspect the genuine completed payment

Open [the real Purchase Passport](https://routetill.vercel.app/passport/655d4cc9-0eaf-41b7-a7bf-05fc73286eea?mode=live) or the homepage’s verified-payment section.

- [Arbitrum source transfer](https://arbiscan.io/tx/0x1afadae771327b11deb4132df51953bd307e2d13c57a8e276ec95f420e5a4a81): 10.105156 native USDC.
- Saved NEAR Intents provider status: **SUCCESS**.
- [Base merchant receipt](https://basescan.org/tx/0x8cc1225a938538842a42db97b5e3592fb37ede94632872d626dd91d1acafe121): exactly 10 native USDC to the verified merchant.
- [Separate Arbitrum refund](https://arbiscan.io/tx/0x040de1f0e88378fcabcaa141480c5fa5499c329a8d899e4b4426fa7c8a6965a6): 0.095729 USDC returned to the buyer. ETH gas was additional.
- One attempt, one entitlement, one signed Passport; normal reconciliation reached **FULFILLED**, without a manual database status change.
- Delivered artifact: 1,613 bytes; SHA-256 `f7ecb13c8d1b1576b17311ad3eb3a18848f44bdac3a742dbc66e0ba726f65643`.

[Public manifest, signed JSON, artifact, pinned public key and reproduction command](evidence/mainnet-655d4cc9-0eaf-41b7-a7bf-05fc73286eea/). The independent verifier passed 12 checks. Browser signature checks are useful but do not replace fresh independent chain observations. The buyer’s original download is session-protected; a public CC0 artifact copy supports reproducible verification.

## Roles and current payment availability

Merchant workspace is for seller product administration and recipient verification. Owner-code access is needed only for elevated demo merchant/agent tools. The public buyer walkthrough and Lab need neither.

Live checkout links still show merchant-created product terms, spending-cap and refund-wallet controls. A live account is used for authenticated human approval and private downloads; the account system is shared with merchant accounts, rather than a separate buyer identity system. General production payment activation has **not** been implemented: new live preparation is unavailable, and the exact-order fail-closed guard remains in place. The successful mainnet purchase proves the restricted integration, not an unrestricted public payment service.

Direct injected Rabby, MetaMask and OKX support remains available without WalletConnect. The real funded trial used Rabby. Judges do not need an extension for the no-funds walkthrough.

## Developer reproduction

Follow README installation with Node 22.13+ and isolated local PGlite. Do not run seed/migrations while a local app process owns its database. Public demo runs against separate Neon PostgreSQL. [Security boundaries](SECURITY.md), [payment evidence](NEAR_PROOF.md), [current limitations](LIMITATIONS.md).
