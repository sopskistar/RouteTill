# RouteTill

**From approved purchase to proven delivery.**

An AI agent buying a paid developer resource needs to receive the exact approved file from the intended merchant. RouteTill connects a human-approved purchase to NEAR Intents cross-chain settlement, one durable entitlement, and independently checkable payment and file evidence.

![RouteTill buyer experience with the verified mainnet Purchase Passport](docs/screenshots/home-hero-desktop.png)

**NEAR Intents** supplies authenticated exact-output quotes, quote-specific deposits and cross-chain execution; this is essential to paying from Arbitrum while the merchant receives Base USDC. **ProofFlow** joins that execution to approval and digital delivery: a shareable Purchase Passport, an independent verifier, and a Break-It Lab that lets judges attack the real backend.

**Live:** [Production](https://routetill.vercel.app) · [No-funds buyer demo](https://routetill-demo.vercel.app/checkout/purchase-vectors?mode=demo) · [Source](https://github.com/sopskistar/RouteTill) · [Verified Purchase Passport](https://routetill.vercel.app/passport/655d4cc9-0eaf-41b7-a7bf-05fc73286eea?mode=live).

**Mainnet proof — VERIFIED, November 13, 2026:** RouteTill completed a funded native Arbitrum USDC → native Base USDC purchase. NEAR Intents returned SUCCESS; an independent Base receipt confirmed exactly 10 USDC to the verified merchant; ordinary reconciliation created **one entitlement and one signed Purchase Passport**. [Public verification manifest](docs/evidence/mainnet-655d4cc9-0eaf-41b7-a7bf-05fc73286eea/verification-manifest.json) · [Standalone verifier result](docs/evidence/mainnet-655d4cc9-0eaf-41b7-a7bf-05fc73286eea/cli-verification.json). This is real chain evidence, separate from the Lab's no-funds challenges.

**Deployment and scope:** The verified reconciliation fix was deployed to both isolated Vercel projects; the release reported healthy APIs and working production/demo Passport public keys. Live payment preparation is **disabled by default** on both; the single-purchase mainnet trial has ended. The demo uses separate Neon resources and signing identity. No general-purpose production payment service or escrow service is claimed. A new narrated review video follows the same Meet John story and real payment evidence; publication awaits the owner’s review. The old silent video is preserved as a historical fallback, not current mainnet footage.

## Try RouteTill in 30 seconds

The public judge challenge requires **no wallet, funds or owner access code**. Merchant/agent administration is a separate protected area, not required for these checks.

1. **DO** Open the [public buyer checkout](https://routetill-demo.vercel.app/checkout/purchase-vectors?mode=demo), review the prepared product and select **Review purchase proposal**. **SEE** the merchant’s 10 USDC price, 11 USDC source cap, test refund wallet and exact file digest.
2. **DO** Review and authorize this no-funds purchase, then select **Simulate payment & deliver**. **SEE** one entitlement and a working, hash-checked digital download. No registration, wallet or owner code is required.
3. **DO** Open [Break-It Lab](https://routetill-demo.vercel.app/lab) and select **Run 5 security checks**. **SEE** merchant substitution, excessive price and approval reuse rejected; 20 notifications (15 concurrent) produce one persisted Neon entitlement; altered Passport/file evidence fails.
4. **DO** Inspect the [real verified Passport](https://routetill.vercel.app/passport/655d4cc9-0eaf-41b7-a7bf-05fc73286eea?mode=live) and its [public proof](docs/evidence/mainnet-655d4cc9-0eaf-41b7-a7bf-05fc73286eea/REPRODUCE.txt). **SEE** the genuine source transfer, merchant receipt, matching artifact and 12 independent checks.

**Evidence distinction:** Break-It Lab runs real policy/database checks against **simulated payment evidence** and sends no money. Its payment simulation is not mainnet settlement proof; the separate completed purchase below is real mainnet evidence.

<details>
<summary>Meet John — the experience behind our first paying purchase</summary>

### Agent finds it — John needs a dataset.

His AI agent finds a useful developer dataset for $10. John wants the file, but he doesn't want to hand over control of his wallet.

### No blank check — His money. His decision.

An agent shouldn't have unrestricted spending power. John wants to buy this one file, not give an agent permission to spend whenever it wants.

### John says yes — One file. One approval.

John sees the seller, the $10 price and the file he's getting. He sets a maximum source spend of 11 USDC and approves this one purchase.

### Payment verified — Paid on Arbitrum. Received on Base.

John sends about $10.11 from his Arbitrum wallet. NEAR Intents handles the cross-chain payment, and RouteTill verifies that the merchant received exactly $10 on Base.

### File + proof — Delivered. With proof.

RouteTill verifies the merchant payment, delivers the correct dataset exactly once, and issues a signed Purchase Passport anyone can check.

Agent discovery is visualized. The financial and delivery claims above refer to the genuine completed purchase. Arbitrum ETH gas is additional to the 11 USDC source ceiling.

</details>

## One real completed purchase

| Verified fact | Evidence |
| --- | --- |
| Human-approved digital product | Agent Purchase Test Vectors; one exact-order approval |
| Buyer funded on Arbitrum One | [10.105156 native USDC transfer](https://arbiscan.io/tx/0x1afadae771327b11deb4132df51953bd307e2d13c57a8e276ec95f420e5a4a81) |
| NEAR Intents settlement | `SUCCESS` in the saved provider response |
| Merchant paid on Base | [Exactly 10 native USDC received](https://basescan.org/tx/0x8cc1225a938538842a42db97b5e3592fb37ede94632872d626dd91d1acafe121) |
| Other provider reference | [0.095729 USDC refunded to the buyer on Arbitrum](https://arbiscan.io/tx/0x040de1f0e88378fcabcaa141480c5fa5499c329a8d899e4b4426fa7c8a6965a6) |
| Delivery | One payment attempt, one entitled 1,613-byte file, one signed Passport |
| Delivered SHA-256 | `f7ecb13c8d1b1576b17311ad3eb3a18848f44bdac3a742dbc66e0ba726f65643` |
| Independent verification | [12 standalone checks passed](docs/evidence/mainnet-655d4cc9-0eaf-41b7-a7bf-05fc73286eea/cli-verification.json), including tamper rejection |

[Complete verification manifest](docs/evidence/mainnet-655d4cc9-0eaf-41b7-a7bf-05fc73286eea/verification-manifest.json) · [Passport JSON](docs/evidence/mainnet-655d4cc9-0eaf-41b7-a7bf-05fc73286eea/purchase-passport.json) · [Reproduction instructions](docs/evidence/mainnet-655d4cc9-0eaf-41b7-a7bf-05fc73286eea/REPRODUCE.txt)

The provider's association between source deposit and destination transaction is not itself a cryptographic causal proof. RouteTill independently checks the applicable chain receipt, asset, recipient, amount and finality before granting access. The actual download requires the purchasing session; public evidence and a CC0 artifact copy are provided for independent verification.

## Run the judge challenge locally

Requires Node 22.13+ (22.x) and npm. On a fresh clone:

```sh
npm ci
cp .env.example .env.local
# Add NEAR_INTENTS_JWT only for live dry quotes; the no-funds lab works without it.
npm run seed
npm run dev -- --port 3001
```

Open **http://localhost:3001/lab**.

1. **DO** Open isolated judge workspace → **SEE** the exact product, recipient, 11 USDC source cap, route, expiry and digest.
2. **DO** Run all five security checks → **SEE** merchant substitution, over-cap pricing and reused approval rejected by the backend.
3. **DO** Inspect replay → **SEE** 20 notifications, including 15 concurrent deliveries, produce **one stored entitlement**.
4. **DO** Inspect tampering → **SEE** the original Passport pass and modified recipient/artifact fail.
5. **DO** Open the Passport and entitled download → **SEE** the actual file, SHA-256 check, original signed JSON and explicit synthetic settlement label.

The local database is PostgreSQL through persistent PGlite, not an in-memory demo. **Stop the app before running seed/migration scripts**; a process lock enforces one local owner. The updated local judge challenge creates a bounded, isolated guest session with no code, wallet or funds; merchant administration and agent setup remain behind the owner's access code. Production and demo use separate Neon projects. [Full walkthrough](docs/JUDGE_WALKTHROUGH.md).

## One complete flow

Merchant workspace → create digital product/link → agent or customer proposal → human authorization → genuine NEAR Intents quote → owner-approved deposit when enabled → independent settlement qualification → transactional entitlement → Purchase Passport.

Use `/merchant` for products, orders, retry history, wallet ownership and scoped agent tokens. `/checkout/purchase-vectors` opens the prepared CC0 developer resource, **Agent Purchase Test Vectors**. After verifying the purchased bytes, the deterministic agent writes a seven-case developer test-plan JSON from the supplied synthetic records. The legacy Field Notes link and generic digital products remain supported. `/docs` contains the API and verification model. No-funds checkout clearly labels synthetic settlement; it never creates a live deposit.

NEAR Intents’ authenticated **1Click** API supplies live assets, exact-output quotes, a quote-specific deposit workflow, cross-chain routing and provider status. RouteTill adds purchase-policy enforcement and independently inspects the destination transfer before delivery. The supported execution/verifier route is **native USDC on Arbitrum → native USDC on Base**. A catalog entry does not imply every route is verified.

## Verify without the frontend

The actual 2026-11-13 mainnet payment can be checked from a clean clone with public, committed evidence:

```sh
node --import tsx scripts/verify-passport.ts \
  docs/evidence/mainnet-655d4cc9-0eaf-41b7-a7bf-05fc73286eea/purchase-passport.json \
  --key docs/evidence/mainnet-655d4cc9-0eaf-41b7-a7bf-05fc73286eea/production-public-key.txt \
  --artifact docs/evidence/mainnet-655d4cc9-0eaf-41b7-a7bf-05fc73286eea/agent-purchase-test-vectors.md \
  --rpc https://mainnet.base.org \
  --source-rpc https://arb1.arbitrum.io/rpc
```

Use independently trusted RPC endpoints. The public key must be pinned through a separate trusted source. The saved successful result is [here](docs/evidence/mainnet-655d4cc9-0eaf-41b7-a7bf-05fc73286eea/cli-verification.json). This is the **real** purchase, not the demo fixture.

For a separate **synthetic/offline** exercise, a sanitized [authenticated quote recorded on 12 November](docs/evidence/live-dry-quote-2026-11-12.json) and [signed synthetic Passport](docs/evidence/demo-passport.json) are included for offline inspection. The bundled development public key is a test fixture, not a production trust anchor.

```sh
npm run verify -- docs/evidence/demo-passport.json \
  --key docs/evidence/demo-public-key.txt \
  --artifact docs/evidence/field-notes.md
```

The seed writes an actual artifact and signed synthetic Passport:

```sh
npm run verify -- artifacts/demo/passport.json \
  --key artifacts/demo/public-key.pem \
  --artifact artifacts/demo/field-notes.md
```

Expected: `integrity: PASS`, `settlement: UNVERIFIED`, `synthetic: true`. Change the JSON or file and the corresponding checks fail. For a live Passport, add `--rpc https://your-trusted-base-rpc`; missing independent evidence stays UNVERIFIED and exits 2. Obtain and pin the issuer key independently: a key packaged with a receipt does not establish issuer identity. [Format and trust boundaries](docs/PROOFFLOW.md).

## Test and build

```sh
npm test
npm run lint
npm run typecheck
npm run build
npm run scan:secrets
npm audit
# With the local server running on 3001:
npm run test:browser
```

**Reported verification after the payment/reconciliation fixes:** 138 focused reconciliation tests passed, and 12 standalone checks verified the mainnet Passport. A later local frontend work session reported **223 passing unit/integration tests**, typecheck and lint; its browser suite was interrupted by local guest-auth configuration and must **not** be represented as a fully passing browser run. Earlier complete browser journeys and hosted no-funds checks are documented separately. Unit/integration tests use isolated PostgreSQL-compatible PGlite stores. [Test documentation](docs/TESTING.md). The verified mainnet settlement is documented independently above; do not conflate it with synthetic tests.

## Agent integration

[OpenAPI 3.1](public/openapi.json) and [example client](scripts/agent.ts). The example uses deterministic budget rules, not an LLM or unrestricted autonomous spending.

```sh
# Create a limited token in Merchant workspace → Settlement & API.
export ROUTETILL_AGENT_TOKEN='your-scoped-token'
export ROUTETILL_URL=http://localhost:3001
npm run agent
# Open the printed URL and approve as the human owner.
npm run agent -- ORDER_ID
npm run agent -- --quote ORDER_ID
# Live only, after human approval and owner enablement; creates instructions, sends no funds:
npm run agent -- --execute ORDER_ID
```

Tokens cannot approve purchases. A fulfilled run downloads the actual resource, rejects a digest mismatch and saves `artifacts/agent/test-plan.json` when the file is the supported developer dataset. It summarizes fixture labels; it does not execute those test cases or use an LLM. The buyer’s explicitly selected Rabby, MetaMask, Coinbase-compatible injected or other EIP-6963 provider separately requests a transaction signature. WalletConnect needs a public Reown project ID and has not been paired with a real wallet yet. [Agent API and security](docs/SECURITY.md).

## Architecture and deployment

Next.js 16 / React / TypeScript / Tailwind, parameterized typed PostgreSQL queries, official 1Click signature SDK, viem EVM wallet/chain helpers, Vitest and Playwright. Unique constraints and row locks bind approvals, attempts, transfers and entitlements. A transactional outbox and authenticated scheduled reconciliation survive retries. All financial arithmetic uses integer atomic units.

Production and demo use two existing Vercel projects, separate Neon resources and distinct unchanged Passport signing identities. The [real Neon transaction report](docs/evidence/neon-verification.json) records 12 concurrent approval attempts accepting one, rollback, isolation and reconnect persistence using generated test schemas; public migrations were not repeated. Hosted replay also verified 20 notifications to one durable entitlement. WSL networking can be intermittent, so unavailable RPC/database evidence is reported honestly. Both GitHub reconciliation jobs were repaired; [dated workflow evidence](docs/RECONCILIATION.md). [Deployment guide](docs/DEPLOYMENT.md), [architecture](docs/ARCHITECTURE.md), [.env.example](.env.example).

Live deposits are disabled by default after the owner-controlled, completed single-purchase trial. The funded source transaction, merchant settlement, buyer refund and Passport linked above are real evidence from the approved purchase. Do not initiate another transfer without explicit wallet approval.

## What is—and isn’t—the differentiator

Coldtill, Weave, Aurora’s Intents Widget, Penstock and other projects already cover checkout, cross-chain routing, signed notifications and agent-readable payment services. AP2 also defines authorization mandates and linked receipts; RouteTill does not claim to have invented them or to implement AP2 compatibility. RouteTill does not claim those features are unique. Its focus is the **connected authorization → independently qualified settlement → exact digital artifact**, with an executable adversarial challenge and evidence that exposes its limits. [Brief primary-source comparison and attribution](docs/REFERENCES.md).

Application signatures protect assertions; they do not independently prove blockchain settlement, delivery quality or database-wide uniqueness. RPC observations depend on the selected RPC. Provider execution status associates deposits with destination transactions; this association is not a cryptographic causal proof. [Threat model](docs/SECURITY.md), [known limitations](docs/LIMITATIONS.md).

## Documentation and demo assets

- [Judge walkthrough](docs/JUDGE_WALKTHROUGH.md), [demo/video script](docs/DEMO_SCRIPT.md), [submission and X drafts](docs/SUBMISSION.md)
- [NEAR proof](docs/NEAR_PROOF.md), [ProofFlow format](docs/PROOFFLOW.md), [test results](docs/TESTING.md)
- [Security](docs/SECURITY.md), [deployment](docs/DEPLOYMENT.md), [limitations](docs/LIMITATIONS.md), [brand](docs/BRAND.md)

Original implementation built during the November 2026 hackathon from starter commit `67f064e` ([branch comparison after owner-approved push](https://github.com/sopskistar/RouteTill/compare/67f064e...main)); earlier external research is baseline context, not paid-settlement proof. The owner must disclose SilentSourcing reciprocally if it is independently submitted under the event’s Q-015 rule; its submission status is not asserted here.

MIT software license. Original synthetic product content: CC0. Manrope: SIL OFL; icons: Lucide ISC. External tools and reference links are attributed in [REFERENCES](docs/REFERENCES.md). No testimonials, customer metrics, paid transactions or deployment results are invented.
