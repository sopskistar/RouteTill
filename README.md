# RouteTill

**From approved purchase to proven delivery.**

An AI agent buying a paid developer resource needs to receive the exact approved file from the intended merchant. RouteTill connects a human-approved purchase to NEAR Intents cross-chain settlement, one durable entitlement, and independently checkable payment and file evidence.

**NEAR Intents** supplies authenticated exact-output quotes, quote-specific deposits and cross-chain execution; this is essential to paying from Arbitrum while the merchant receives Base USDC. **ProofFlow** joins that execution to approval and digital delivery: a shareable Purchase Passport, an independent verifier, and a Break-It Lab that lets judges attack the real backend.

**Live URLs:** [Production](https://routetill.vercel.app) · [Judge demo](https://routetill-demo.vercel.app) · [GitHub](https://github.com/sopskistar/RouteTill). Both health APIs respond and live payments are disabled. The production lookup for the demo-only sample returns 404. The demo product API now returns 200; both public Passport-key endpoints still return 503. Both real Neon databases accepted migrations 001–003, but the full transaction/concurrency suite remains blocked by intermittent network failures. Deployed key-format verification remains unresolved. [Current release recovery](docs/RELEASE_RECOVERY.md). Local changes below are not yet pushed or redeployed.

**Evidence status:** authenticated production dry quote verified; local synthetic PostgreSQL fulfillment demonstrated; real Neon concurrency and mainnet settlement **UNVERIFIED**. No funded mainnet transaction or hackathon submission is claimed. [Evidence and limitations](docs/NEAR_PROOF.md). Existing 80-second demonstration: `video/output/routetill-demo.mp4` (local rendered asset; explicitly synthetic settlement).

## Try the judge challenge

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
2. **DO** Run all five challenges → **SEE** merchant substitution, over-cap pricing and reused approval rejected by the backend.
3. **DO** Inspect replay → **SEE** 20 notifications, including 15 concurrent deliveries, produce **one stored entitlement**.
4. **DO** Inspect tampering → **SEE** the original Passport pass and modified recipient/artifact fail.
5. **DO** Open the Passport and entitled download → **SEE** the actual file, SHA-256 check, original signed JSON and explicit synthetic settlement label.

The local database is PostgreSQL through persistent PGlite, not an in-memory demo. **Stop the app before running seed/migration scripts**; a process lock enforces one local owner. The updated local judge challenge creates a bounded, isolated synthetic guest session with no code, wallet, or funds; merchant administration and agent setup remain behind the owner’s judge access code. Production and demo use separate Neon projects. [Full walkthrough](docs/JUDGE_WALKTHROUGH.md).

## One complete flow

Merchant workspace → create digital product/link → agent or customer proposal → human authorization → genuine NEAR Intents quote → owner-approved deposit when enabled → independent settlement qualification → transactional entitlement → Purchase Passport.

Use `/merchant` for products, orders, retry history, wallet ownership and scoped agent tokens. `/checkout/purchase-vectors` opens the prepared CC0 developer resource, **Agent Purchase Test Vectors**. After verifying the purchased bytes, the deterministic agent writes a seven-case developer test-plan JSON from the supplied synthetic records. The legacy Field Notes link and generic digital products remain supported. `/docs` contains the API and verification model. No-funds checkout clearly labels synthetic settlement; it never creates a live deposit.

NEAR Intents’ authenticated **1Click** API supplies live assets, exact-output quotes, a quote-specific deposit workflow, cross-chain routing and provider status. RouteTill adds purchase-policy enforcement and independently inspects the destination transfer before delivery. The supported execution/verifier route is **native USDC on Arbitrum → native USDC on Base**. A catalog entry does not imply every route is verified.

## Verify without the frontend

A sanitized [authenticated quote recorded on 12 November](docs/evidence/live-dry-quote-2026-11-12.json) and [signed synthetic Passport](docs/evidence/demo-passport.json) are included for offline inspection. The bundled development public key is a test fixture, not a production trust anchor.

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

**Latest local checks: 145 unit/persistence tests and 7 browser journeys passed.** Unit/integration tests use real PostgreSQL transactions in isolated temporary PGlite stores. Browser tests drive the actual application, run axe checks and capture desktop/tablet/mobile screenshots. [Actual results and coverage](docs/TESTING.md). Local passing tests do not establish a successful Neon deployment or paid settlement.

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

Production: two Vercel projects connect to separate Neon resources. Production uses `DATABASE_URL`; the demo uses `DEMO_DATABASE_URL`; each signs Passports with its own key. Both hosted projects have their database variables configured, and their URLs are present in ignored local release files. The local verifier rejects accidental URL reuse and refuses a PGlite fallback. Both databases accepted migrations over real Neon TCP connections. Connectivity is intermittent across TCP, HTTPS and WebSocket; the full PostgreSQL locking and replay-persistence suite remains unverified. Do not infer those results from local PGlite tests. `npm run release:init` prepares private configuration without printing secrets. Vercel Hobby recovery and the best-effort scheduled wake-up are documented in the deployment guide. [Environment and deployment guide](docs/DEPLOYMENT.md), [architecture](docs/ARCHITECTURE.md), [.env.example](.env.example).

Live deposits are disabled by default. Deployment, Git push/publication, owner wallet signing, X posting and submission require human approval. No actual transaction hash is presented as live evidence unless obtained from an approved payment.

## What is—and isn’t—the differentiator

Coldtill, Weave, Aurora’s Intents Widget, Penstock and other projects already cover checkout, cross-chain routing, signed notifications and agent-readable payment services. AP2 also defines authorization mandates and linked receipts; RouteTill does not claim to have invented them or to implement AP2 compatibility. RouteTill does not claim those features are unique. Its focus is the **connected authorization → independently qualified settlement → exact digital artifact**, with an executable adversarial challenge and evidence that exposes its limits. [Brief primary-source comparison and attribution](docs/REFERENCES.md).

Application signatures protect assertions; they do not independently prove blockchain settlement, delivery quality or database-wide uniqueness. RPC observations depend on the selected RPC. Provider execution status associates deposits with destination transactions; this association is not a cryptographic causal proof. [Threat model](docs/SECURITY.md), [known limitations](docs/LIMITATIONS.md).

## Documentation and demo assets

- [Judge walkthrough](docs/JUDGE_WALKTHROUGH.md), [demo/video script](docs/DEMO_SCRIPT.md), [submission and X drafts](docs/SUBMISSION.md)
- [NEAR proof](docs/NEAR_PROOF.md), [ProofFlow format](docs/PROOFFLOW.md), [test results](docs/TESTING.md)
- [Security](docs/SECURITY.md), [deployment](docs/DEPLOYMENT.md), [limitations](docs/LIMITATIONS.md), [brand](docs/BRAND.md)

Original implementation built during the November 2026 hackathon from starter commit `67f064e` ([branch comparison after owner-approved push](https://github.com/sopskistar/RouteTill/compare/67f064e...main)); earlier external research is baseline context, not paid-settlement proof. The owner must disclose SilentSourcing reciprocally if it is independently submitted under the event’s Q-015 rule; its submission status is not asserted here.

MIT software license. Original synthetic product content: CC0. Manrope: SIL OFL; icons: Lucide ISC. External tools and reference links are attributed in [REFERENCES](docs/REFERENCES.md). No testimonials, customer metrics, paid transactions or deployment results are invented.
