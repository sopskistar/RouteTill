# Final verification scope

**Earlier recorded snapshot — committed November 14, 2026 UTC (`bdcf0a33accc0f3b25cf922542287863d5f4be80`):** 224 unit/integration tests and nine browser journeys passed, including the added story-consistency test. Typecheck, lint and production build passed; full app and production dependency audits reported zero vulnerabilities. See the [original verification scope](FINAL_AUDIT.md#executed-local-checks).

**Later verification — November 14, 2026 (`1db3a4200ebbda56470ea6186cf3af6571b8b66a`):** 224 unit/integration tests and 12 browser journeys passed, with lint, typecheck and production build. The [dated UI, policy, persistence and verifier report](COMMUNICATION_REVIEW.md#checks-actually-performed) records that run and its separate hosted checks. These results are distinct from the earlier nine-journey snapshot and are not new fresh-clone results. Hosted buyer/Lab and deployment evidence are recorded separately, rather than inferred from local PGlite.

**Fresh-clone README quick start — November 14, 2026, commit `de467df8712e394c3f6318a097bb5ff2cee62bf7`:** cloned the public repository into a new temporary directory with Node 22.23.1/npm 10.9.8. The documented `npm ci`, `.env.example` → `.env.local`, `npm run seed`, and `npm run dev -- --port 3001` succeeded without private configuration. `/lab` returned HTTP 200; one existing filtered Playwright journey passed all five backend checks, including 20 notifications producing one entitlement, original Passport/file checks and tamper rejection. The temporary server was stopped. This was local PGlite verification, not a new Neon/mainnet result or a rerun of the full test suites. A stale local server was stopped to free port 3001; an initial test-name filter selected no tests and was corrected. Neither required an application change.

Real Neon suite: the dated [report](evidence/neon-verification.json) passed on both distinct resources using isolated generated schemas: 12 simultaneous approval consumptions accepted one, rollback preserved approval on failed insert, all five challenges passed, replay persisted one entitlement after reconnect, and ownership isolation passed. Public migrations were not rerun. No need to rerun this financial-infrastructure suite for copy/layout changes.

Genuine mainnet result: [12 independent verifier checks](evidence/mainnet-655d4cc9-0eaf-41b7-a7bf-05fc73286eea/cli-verification.json) and exactly one entitlement for the FULFILLED purchase. The older entries below preserve what was known on their dates, including simulated records whose mainnet settlement correctly remains UNVERIFIED.

Fresh-clone README reproduction, public incognito walkthrough and standalone original/tampered Passport results are recorded in [README_VERIFICATION.md](README_VERIFICATION.md), dated November 14.

---

# Historical release verification — November 11–12, 2026

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

The preceding PENDING observations are historical. The full Neon suite subsequently passed on November 13 ([report](evidence/neon-verification.json)), and the funded purchase subsequently reached FULFILLED ([proof](NEAR_PROOF.md)).

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

## Hosted Passport repair verification — 13 November 2026

No application source changed in this repair. Both existing projects redeployed the approved `ebeb14b` commit after only their corresponding existing Passport key values were restored. Both key APIs return 200 and match the unchanged, distinct local identities; both payment gates remain false.

The hosted API and independent browser journeys passed all five real backend challenges against Neon. Replay reported 20 deliveries (15 concurrent) and one entitlement before the tamper challenge. Direct read-only Neon queries subsequently found one order/attempt/entitlement/Passport and delivered outbox job in demo, zero matching records in production. The independent CLI verified all eight original integrity checks; modified recipient and artifact checks failed as expected. All settlement evidence remains synthetic and mainnet UNVERIFIED. Desktop/mobile Lab axe scans and overflow checks passed. No public migrations were repeated. At this earlier hosted-check observation, the separate full transaction suite was still unverified following WSL network failures. The later November 13 [full-suite report](evidence/neon-verification.json) supersedes that limitation. [Detailed evidence](HOSTED_VERIFICATION.md).
