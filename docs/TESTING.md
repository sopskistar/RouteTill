# Actual verification

Executed locally on 11 November 2026 with Node 22.23.1, Next.js 16.4.6, Vitest 5.1.0 and Playwright Chromium 158. All counts below are actual completed runs, not planned coverage.

| Command | Actual result |
|---|---|
| `npm test` | **85 passed**, 3 files |
| `npm run test:browser` | **6 passed**, production server, 23.7 seconds |
| `npm run lint` | Passed, no warnings in the final app pass |
| `npm run typecheck` | Passed |
| `npm run build` | Passed; all application/metadata routes generated |
| `npm audit --json` | **0 vulnerabilities** after patching test dependencies |
| `npm run scan:secrets` | **0 findings**; source count is printed by the command |
| `git diff --check` | Passed |
| Independent Passport CLI | Original signature/policy/bytes PASS; mainnet UNVERIFIED |
| CLI tampered recipient | FAIL, nonzero exit |
| Live dry-quote probe | Signature valid; recipient/amount tampering rejected |

## Persistence and adversarial tests

`tests/policy-payment.test.ts`: integer precision/ranges; exact policy binding; merchant/product/route/refund/artifact substitution; expiry; state transitions; original production quote signature and tampering; quote cap/minimum/precision/expiry; wrong destination chain/token/recipient/amount, failed/missing receipt, insufficient confirmations, missing finality, reorg, removed/ambiguous logs and wrong transaction reference.

`tests/lifecycle.test.ts`: locked single-use approval under concurrent execution, reused approval, idempotency-key conflict rollback, merchant isolation, bearer approval denial, human approval of an agent proposal, product digest mutation, successful fulfillment, sequential replay, 20 concurrent deliveries, duplicate notification keys, missing evidence, synthetic/live rejection, rollback after artifact corruption, duplicate chain-transfer association, retried outbox, persistence after closing and reopening PostgreSQL, signed Passport binding/tampering/missing key/artifact behavior, and all five real lab challenges.

`tests/auth.test.ts`: genuine locally generated EIP-191 ownership signatures, signature substitution, nonce replay, expired challenge, merchant binding, hashed sessions, concurrent durable rate limiting and the single-process local database lock.

These tests run actual PostgreSQL statements/constraints through PGlite in temporary on-disk stores. **They are not Neon concurrency tests.** The external production adapter requires configured database credentials and a separate deployed run.

## Browser and design tests

The six journeys cover responsive landing navigation/theme/reduced motion; judge merchant onboarding and actual product/link creation; checkout/proposal/approval; synthetic settlement and entitled download; local SHA-256 and WebCrypto signature checks; all five backend attacks; signed JSON export; privacy/docs/custom 404; cross-origin and unauthenticated denial; the actual deterministic agent CLI, human-only approval, agent admin denial, and agent entitlement retrieval; and real local merchant registration/sign-in with a generated test-only EIP-191 wallet ownership signature.

The suite captures 1440/1280-class desktop, 768px tablet, 390px phone and 360px small-phone landing views, plus checkout/lab/Passport/delivery routes. Axe scans of checkout and the populated lab returned zero WCAG A/AA violations. Separate design review inspected real screenshots and requested two fixes: stack mobile page headings before actions, and show synthetic settlement as amber/unverified. Recaptures were reviewed and both fixes scored resolved. [Design audit details](DESIGN_QA.md).

## Reproduce

```sh
npm ci
cp .env.example .env.local # fresh clone only; preserve an existing configured file
npm test
npm run lint
npm run typecheck
npm run seed # server stopped
npm run build
npm run start -- --port 3001
# In another terminal:
npm run test:browser
```

`PLAYWRIGHT_BASE_URL` overrides the target URL. Browser tests assume the local judge access configuration; hosted judge-code setup must be supplied before a deployed run. Captures, traces, original evidence and local exports are under ignored `artifacts/`, `test-results/` and `playwright-report/`.

The first development browser runs exposed cold compilation delays, an origin mismatch and low button contrast. Those were fixed; the reported five-test run uses the optimized production build. A seeder was inadvertently started while a local database owner was running; prior synthetic data was preserved, a fresh store was seeded, and a process lock plus a regression test now prevents simultaneous local owners. These local issues do not represent a mainnet transaction or Neon test.

No real wallet transaction, funded settlement, physical-device session, external production deployment or paid scheduler was verified by these commands. See [limitations](LIMITATIONS.md).
