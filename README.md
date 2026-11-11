# RouteTill

**From approved purchase to proven delivery.**

AI agents can initiate payments. That alone does not establish that the approved product was purchased from the intended merchant—or that the promised bytes were delivered. RouteTill binds a human-approved purchase policy to NEAR Intents payment evidence, independently checked merchant settlement, and one durable digital entitlement.

**ProofFlow** is the complete, inspectable lifecycle: a shareable Purchase Passport, an independent verifier, and a Break-It Lab that lets judges attack the real backend.

**Evidence status:** authenticated production dry quote verified; synthetic PostgreSQL fulfillment demonstrated; real mainnet settlement **UNVERIFIED**. No public deployment or hackathon submission has been made. [Evidence and limitations](docs/NEAR_PROOF.md).

## Try the judge challenge

Requires Node 22.13+ and npm. On a fresh clone:

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

The local database is PostgreSQL through persistent PGlite, not an in-memory demo. **Stop the app before running seed/migration scripts**; a process lock enforces one local owner. Hosted evaluation requires separate Neon databases and a protected judge code. [Full walkthrough](docs/JUDGE_WALKTHROUGH.md).

## One complete flow

Merchant workspace → create digital product/link → agent or customer proposal → human authorization → genuine NEAR Intents quote → owner-approved deposit when enabled → independent settlement qualification → transactional entitlement → Purchase Passport.

Use `/merchant` for products, orders, retry history, wallet ownership and scoped agent tokens. `/checkout/field-notes` opens the prepared synthetic product. `/docs` contains the API and verification model. No-funds checkout clearly labels synthetic settlement; it never creates a live deposit.

NEAR Intents’ authenticated **1Click** API supplies live assets, exact-output quotes, a quote-specific deposit workflow, cross-chain routing and provider status. RouteTill adds purchase-policy enforcement and independently inspects the destination transfer before delivery. The supported execution/verifier route is **native USDC on Arbitrum → native USDC on Base**. A catalog entry does not imply every route is verified.

## Verify without the frontend

A sanitized [fresh authenticated quote](docs/evidence/live-dry-quote-2026-11-11.json) and [signed synthetic Passport](docs/evidence/demo-passport.json) are included for offline inspection. The bundled development public key is a test fixture, not a production trust anchor.

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

Unit/integration tests use real PostgreSQL transactions in isolated temporary PGlite stores. Browser tests drive the actual application, run axe checks and capture desktop/tablet/mobile screenshots. [Actual results and coverage](docs/TESTING.md). Local passing tests do not establish a successful Neon deployment or paid settlement.

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

Tokens cannot approve purchases. The buyer’s wallet separately requests an explicit transaction signature. [Agent API and security](docs/SECURITY.md).

## Architecture and deployment

Next.js 16 / React / TypeScript / Tailwind, parameterized typed PostgreSQL queries, official 1Click signature SDK, viem EVM wallet/chain helpers, Vitest and Playwright. Unique constraints and row locks bind approvals, attempts, transfers and entitlements. A transactional outbox and authenticated scheduled reconciliation survive retries. All financial arithmetic uses integer atomic units.

Production: Vercel Node runtime + **two genuinely distinct Neon stores** + server-only API/issuer keys. Migrate with `npm run db:migrate` and `npm run db:migrate -- --demo`. The five-minute schedule requires an appropriate Vercel plan or an authenticated external scheduler. [Environment and deployment guide](docs/DEPLOYMENT.md), [architecture](docs/ARCHITECTURE.md), [.env.example](.env.example).

Live deposits are disabled by default. Deployment, Git push/publication, owner wallet signing, X posting and submission require human approval. No actual transaction hash is presented as live evidence unless obtained from an approved payment.

## What is—and isn’t—the differentiator

Coldtill, Weave, Aurora’s Intents Widget, Penstock and other projects already cover checkout, cross-chain routing, signed notifications and agent-readable payment services. RouteTill does not claim those features are unique. Its focus is the **connected authorization → independently qualified settlement → exact digital artifact**, with an executable adversarial challenge and evidence that exposes its limits. [Brief primary-source comparison and attribution](docs/REFERENCES.md).

Application signatures protect assertions; they do not independently prove blockchain settlement, delivery quality or database-wide uniqueness. RPC observations depend on the selected RPC. Provider execution status associates deposits with destination transactions; this association is not a cryptographic causal proof. [Threat model](docs/SECURITY.md), [known limitations](docs/LIMITATIONS.md).

## Documentation and demo assets

- [Judge walkthrough](docs/JUDGE_WALKTHROUGH.md) and [demo/video script](docs/DEMO_SCRIPT.md)
- [NEAR proof](docs/NEAR_PROOF.md), [ProofFlow format](docs/PROOFFLOW.md), [test results](docs/TESTING.md)
- [Security](docs/SECURITY.md), [deployment](docs/DEPLOYMENT.md), [limitations](docs/LIMITATIONS.md), [brand](docs/BRAND.md)

Original implementation built during the November 2026 hackathon from starter commit `67f064e` ([branch comparison after owner-approved push](https://github.com/sopskistar/RouteTill/compare/67f064e...feat/proofflow-mvp)); earlier external research is baseline context, not paid-settlement proof. The owner must disclose SilentSourcing reciprocally if it is independently submitted under the event’s Q-015 rule; its submission status is not asserted here.

MIT software license. Original synthetic product content: CC0. Manrope: SIL OFL; icons: Lucide ISC. External tools and reference links are attributed in [REFERENCES](docs/REFERENCES.md). No testimonials, customer metrics, paid transactions or deployment results are invented.
