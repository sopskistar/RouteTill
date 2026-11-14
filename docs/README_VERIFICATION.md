# README reproducibility review — November 14, 2026

This review checks the current README against the live [official hackathon instructions](https://nearhackathon.com/HACKATHON.md), including Q-001–005, Q-012, Q-014–015 and Procedure 1. It is an engineering reproduction check, not a professional penetration test or a hackathon submission.

## Owner-confirmed status update — November 14, 2026

This dated update supersedes the earlier owner-action statuses below; it does **not** rerun or redate their technical checks.

- Public X demo post: https://x.com/sopskistar/status/2121630057839968439.
- Owner-selected tracks: **security, agents, realworld, business, open**. RouteTill is the owner's **only project submission**; no second-project disclosure is applicable.
- The owner confirms: **The hosted application and no-funds demo will remain available through November 25, 2026.** This records the hosting commitment, not a new uptime measurement.
- Organizer submission status remains **unknown** without an organizer receipt. Check the owner's organizer records; corrections to an existing entry use Request changes, not a duplicate application.
- README commits through `d7628216dc68808483f9dc839d19262c7693e957` are preserved. The shortened README retains all five selected tracks and dated test attribution.
- The approved MP4 is unchanged. Website story wording now distinguishes the 11 USDC ceiling from the 10.105156 USDC deposit and 0.095729 USDC refund: net USDC spent **10.009427**, with network gas additional. No particular fee is inferred from the remaining difference.

## Clean-clone boundary

The executable application at `bdcf0a33accc0f3b25cf922542287863d5f4be80` was cloned with `git clone --no-hardlinks` into a new `/tmp/routetill-readme-compliance` directory. No ignored environment files, data stores, private captures, credentials or production signing keys were copied. Dependencies were installed using the committed lockfile. The only local configuration was a copy of `.env.example`. The public repository and its screenshot URLs were separately fetched without a buyer session.

Node **22.23.1**, npm **10.9.8**, Linux/Chromium. No migrations were run against hosted databases. All generated local data and tamper examples remain outside the repository's tracked files.

## Executed README commands

| Command / operation | Actual result |
| --- | --- |
| `npm ci` | Installed 549 packages; audit reported zero vulnerabilities. Upstream ESLint 9 emitted a deprecation notice; no installation failure. |
| `cp .env.example .env.local` | Fresh clone only; blank provider/database/key settings, demo enabled and live payments disabled. |
| `npm run seed` | PASS; local persistent PGlite initialized, one demo entitlement and exported artifact/Passport. Its mainnet settlement correctly remains UNVERIFIED. |
| `npm test` | 224 tests passed in nine files, 42.83 seconds. |
| `npm run lint` | PASS. |
| `npm run typecheck` | PASS. |
| `npm run build` | PASS; optimized Webpack build, TypeScript checks and all application routes generated from the credential-free clone. |
| `PLAYWRIGHT_BASE_URL=http://localhost:3017 npm run test:browser` | Nine journeys passed together in 4.1 minutes against the new clone, including the public no-code buyer flow. |
| `npm run dev -- --port 3017` with `APP_ORIGIN=http://localhost:3017` | Ready. Ports 3001 and 3005 were already occupied; the documented origin/port override was used rather than testing an older server. |
| Offline committed demo Passport CLI | Integrity PASS, eight checks, synthetic true, settlement UNVERIFIED, exit 0. |
| Seed-exported Passport CLI | Integrity PASS, eight checks, synthetic true, settlement UNVERIFIED, exit 0. |
| README changed-recipient command | Integrity FAIL, exit 1; changed recipient invalidates the signature/fingerprint and binding. |
| README changed-file command | Artifact SHA-256 FAIL, exit 1. Committed evidence unchanged. |
| Exact README mainnet CLI with public Base and Arbitrum RPCs | Integrity PASS, settlement INDEPENDENTLY_OBSERVED, all 12 checks passed, exit 0. No private credential or frontend required. |
| Source/history/public-bundle secret scan | 211 inputs, zero findings; includes Git history and built public bundles. |

The first restricted-sandbox seed invocation could not open tsx's IPC socket (`EPERM`). The unchanged documented command succeeded outside that sandbox. That is an execution restriction, not a guest authentication defect. RPC verification succeeded during this review; public RPC availability is still an external dependency, and a later outage must be reported as UNVERIFIED rather than a pass.

## Fresh-session public DO → SEE verification

A new Chromium context used no owner code, buyer session, account password or wallet.

- **A — purchase:** public demo checkout returned HTTP 200, displayed the prepared dataset, 10 USDC price, 11 USDC source cap and test refund wallet. Review → explicit human approval → Simulate payment & deliver → product access worked. Downloaded bytes matched the approved digest and the demo Passport passed its original-record check.
- **B — five checks:** hosted Lab returned HTTP 200. Recipient substitution, over-limit spending and approval reuse were rejected. Replay reported 20 notifications, including 15 concurrent, and exactly one stored entitlement. Tamper detection passed. All five backend challenge results reported success.
- **C — real proof:** public production Passport returned HTTP 200. Original integrity passed, the public CC0 artifact matched, and modified-recipient verification failed. The separate standalone CLI made fresh independent chain observations and passed all 12 checks.
- Relative Markdown links in the README and five linked judge/status documents: 86 checked, no missing files.
- Public GitHub repository, both referenced application screenshot files, the Arbitrum source/refund links, Base receipt link and linked NEAR signature/status documentation returned HTTP 200.

The actual live order and entitled download remain buyer-session protected. Their lack of anonymous access is intentional; the README links the public FULFILLED manifest, signed Passport and CC0 artifact copy as the judge alternative.

## Existing mainnet purchase rechecked read-only

Neon and chain observations confirmed order `655d4cc9-0eaf-41b7-a7bf-05fc73286eea` still FULFILLED: one payment attempt, one entitlement, one Passport, correct 1,613-byte artifact and approved SHA-256. Source funding was within the original authorization/request deadlines. The Base merchant receipt remains finalized and exceeds the 12-confirmation minimum; the separate Arbitrum reference is the recorded 0.095729 USDC refund. Altered record and file were rejected. No second purchase, approval consumption, transaction or manual fulfillment update was performed.

## Screenshot provenance and history

The README image is the actual deployed application capture at `docs/screenshots/home-hero-desktop.png` (1440 × 900), showing buyer actions and the real recorded Purchase Passport. It is not the separate developer-workspace artwork file. `passport-desktop.png` shows the actual Passport and original verification result; `buyer-checkout-mobile.png` shows the no-funds mobile checkout. All are tracked files and publicly retrievable from GitHub.

Baseline `67f064e81d004f66462c75e9034b23eb832fce87`, dated November 7, contains only `.gitignore`, `LICENSE` and the initial two-line README. The linked baseline-to-main diff contains the application and NEAR integration built during the permitted event window. Upstream libraries and reusable creative/video tooling are attributed separately. The MIT LICENSE remains intact.

## Remaining limitations and owner actions

One genuine restricted mainnet purchase is proven; unrestricted customer payment preparation is disabled. Demo settlement is simulated, with actual isolated application/Neon validation. Application signatures do not prove database-wide uniqueness or the provider's causal routing association. RPC trust and independently obtained issuer keys remain necessary.

At the time of this historical review, the narrated MP4 awaited owner selection/publication, the X post was not yet supplied, hosting beyond the requested judging period was unconfirmed, and no second-project submission was established. These owner-action observations are superseded by the dated update above and [final video record](FINAL_VIDEO.md). No personal fields or application payload were invented. Physical-device/Safari/Firefox and real WalletConnect pairing remain untested.
