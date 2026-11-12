# Actual release verification

Executed 11–12 November 2026 with Node 22.23.1, Next.js 16.4.6, Vitest 5.1.0 and Playwright Chromium 158. Counts are completed local runs. None constitutes a funded transaction or real Neon verification.

| Command | Actual result |
|---|---|
| `npm test` | **125 passed**, 4 files; latest recorded run 9.43 seconds |
| `npm run test:browser` | **7 passed**, local production server, 17.9 seconds; targeted wallet recapture also passed |
| `npm run lint` | Passed, no warnings |
| `npm run typecheck` | Passed |
| `npm run build` | Passed with declared `next build --webpack`; all application/metadata routes generated |
| `npm audit --json` | **0 vulnerabilities** after selecting the minimal official WalletConnect provider |
| `npm run scan:secrets -- --history --bundle` | **0 findings** across reviewable source, all local Git-history refs and generated public assets; private configured secret values are checked without printing them |
| `git diff --check` | Passed |
| `npm run seed` + actual independent CLI | Original exported signature/policy/bytes **PASS**, synthetic mainnet settlement **UNVERIFIED** |
| CLI modified recipient | **FAIL**, exit 1; application signature and settlement binding failed |
| CLI modified artifact | **FAIL**, exit 1; artifact SHA-256 failed |
| Authenticated live dry quote | Signature valid; recipient and amount tampering rejected |
| Owner-address read-only RPC preflight | Both address checksums, chain IDs and native USDC precision passed; source USDC/ETH sufficient at observation time; indicative gas estimated |
| Real Neon / deployed Vercel / funded settlement | **PENDING / UNVERIFIED**, not counted as passing tests |

## Recovery-session rerun — 12 November 2026

Fresh checks against the preserved working tree: **145 tests in five files passed**, **seven browser journeys passed** in 30.2 seconds, lint and typecheck passed, and the production build passed on Node 22.23.1 outside the execution sandbox. The sandbox caused empty TypeScript subprocess output during builds and terminated Chromium before journeys started; the outside-sandbox runs passed. Secret scan with history and public bundles: **165 inputs, zero findings**. Full and production-only dependency audits: **zero vulnerabilities**. Both private release preflight commands passed with live deposits disabled.

Both real Neon databases accepted migrations 001–003. This is distinct from transaction verification: the full real-Neon suite still failed on connection timeouts over pooled/direct TCP and on a WebSocket connection attempt. Individual production TCP and demo HTTPS/WebSocket queries succeeded; connectivity is intermittent. No successful Neon concurrency report or funded settlement is claimed. [Recovery details](RELEASE_RECOVERY.md).

## Persistence and adversarial coverage

The original 85 tests remain and pass: integer precision/ranges; exact policy binding; merchant/product/route/refund/artifact substitution; expiry; state transitions; production quote signatures/tampering; quote cap/minimum/precision/expiry; wrong destination chain/token/recipient/amount; failed/missing receipt; confirmations/finality/reorg/removed/ambiguous logs and transaction reference errors.

Actual PostgreSQL statements in isolated temporary on-disk PGlite stores exercise row-locked approval consumption under concurrency, reused approval, idempotency-key rollback, merchant isolation, bearer approval denial, human approval of an agent proposal, product digest mutation, successful fulfillment, sequential and 20 concurrent notifications, duplicate event keys, missing evidence, synthetic/live rejection, rollback after corruption, duplicate transfer association, retried outbox, persistence after reopening and Passport signature/fingerprint/artifact checks. The five lab challenges call the real handlers and SQL constraints; 20 deliveries (15 concurrent) yield one durable entitlement.

Ownership tests use genuine locally generated EIP-191 signatures for test-only accounts, nonce replay/expiry/merchant checks, hashed sessions, durable rate limits and the single-process PGlite lock. These are **not real Rabby extension or Neon tests**.

`tests/release.test.ts` adds 40 cases for hosted single-store isolation, distinct signing keys, Rabby/MetaMask flag coexistence, EIP-6963 announcements and nonreplacement, Coinbase discovery, exact ERC20 transaction constraints, wallet rejection/network errors, mock-RPC chain/token/balance/gas/expiry checks, canonical source transaction sender/calldata/log association and deterministic resource processing. No source test sends a blockchain transaction.

## Browser and design coverage

Seven journeys drive merchant onboarding, generic product creation, hosted checkout/proposal/human approval, synthetic fulfillment and entitled file retrieval, browser SHA-256/WebCrypto verification, all five lab attacks, Passport export/tampering, privacy/docs/404/error/CSRF states, real deterministic agent CLI and generated seven-case test plan, scoped-token restrictions, sign-in and test-only ownership signatures.

The new wallet journey presents mock Rabby, MetaMask and Coinbase providers together. It proves requests target the explicitly selected provider, Rabby sorts first even with MetaMask compatibility flags, rejected connection/switch requests are handled, network/account changes update displayed state and disconnect clears it. Transaction requests are forbidden by that mock. This is automated provider-contract coverage, **not a real extension/device/relay test**. WalletConnect requires a deployment project ID and manual pairing.

Axe WCAG A/AA scans returned zero violations for checkout, populated lab and wallet settings. Desktop, 768px tablet, 390px and 360px phone layouts, light/dark themes, reduced motion, navigation, forms and hash wrapping were exercised. Screenshots are inspected rather than assumed correct. [Design review](DESIGN_QA.md).

## Reproduce

```sh
npm ci
cp .env.example .env.local # fresh clone only; preserve existing configuration
npm test
npm run lint
npm run typecheck
npm run seed              # app stopped
npm run build
npm run scan:secrets -- --history --bundle
npm audit
npm run start -- --port 3001
# Another terminal:
npm run test:browser
```

The local judge works without external credentials. Add `NEAR_INTENTS_JWT` only for authenticated dry quotes. Generated release files are named `.env.release-*.local` to avoid silently overriding Next.js local judge configuration. `PLAYWRIGHT_BASE_URL` overrides the browser origin; hosted judge-code authentication and single-mode deployment need the explicit owner-configured setup, so the dual-mode local suite is not a claim of hosted success.

The first release browser run found a stale exact-label locator after the description textarea gained initial content. The query was corrected to its accessible textbox role/name, and the full seven-journey run passed. Turbopack could not bind its compiler port in the execution sandbox, including an escalated retry; the supported Webpack build passed and is the declared release build command. Dependency audit initially found an advisory through an unused WalletConnect UI tree; replacing it with official Universal Provider removed that tree and the final audit reported zero known vulnerabilities.

Captures and CLI evidence live in ignored `artifacts/`; browser traces/reports are under `test-results/` and `playwright-report/`. For real Neon migrations, concurrent row-lock testing and deployment checks after the Vercel integration exists, follow [DEPLOYMENT](DEPLOYMENT.md). The verification command refuses PGlite fallback and has not run against missing credentials.
