# Final judge and security review

This is a focused engineering review and automated verification, **not an independent professional penetration test**. No funded transaction, new live purchase, destructive production test, migration or signing-key change was performed.

## Buyer discovery and roles

The prior homepage directed its main demo action to the Lab and no longer exposed a clear checkout link. The existing checkout was intact. Navigation, the hero and product section now link directly to the no-funds buyer checkout. Merchant workspace remains seller administration. A fresh guest can review the prepared product, approve, simulate payment, verify the downloaded file and inspect its Passport without registration or owner code.

The demonstration fixes the source cap and test refund wallet to its bounded safe policy. Actual production checkout preserves editable cap/refund controls and merchant terms, but discloses that new live payment preparation is unavailable. No general production activation architecture is claimed. The existing exact-order guard and financial services were not changed by the frontend release.

## Security review matrix

| Area | Reviewed enforcement / evidence |
| --- | --- |
| Authentication | Opaque random sessions, hashed stored tokens, expiration, HttpOnly/Secure/SameSite cookies in hosting; scrypt passwords. Login/session limits remain server-side. |
| Permissions | Guest scope excludes merchant administration, agent-token creation and provider operations. Agents cannot approve. Order/download reads require buyer/owner authorization. Public Passports intentionally expose public purchase evidence, not session credentials or private downloads. |
| Isolation | Each hosted project accepts exactly one database environment; guest is demo-only. Distinct Neon resources and issuer keys; synthetic evidence cannot fulfill live orders. |
| Human authorization | Immutable fingerprint, recipient/product/route/digest/cap/expiry validation; approval row locks and unique attempts. Server-only exact-order binding checked before consumption/provider calls. |
| Payment | Official signed quote verification, native token/chain binding, exact source transaction/calldata/log checks, separate ETH gas, bounded freshness and effective funding deadline. Existing continuous preflight and duplicate-transfer recovery were preserved. |
| Settlement/refunds | Provider SUCCESS plus independently observed canonical Base merchant receipt, token, recipient, amount, >=12 confirmations and finalized head. Multiple references accepted only when additional references are independently verified origin-chain refunds. |
| Replay and delivery | Row locking, unique transfer/event/entitlement constraints and transactions. Replay 20 → 1; failed unique insertion rolls back approval consumption. Outbox retries signed Passport issuance idempotently. |
| File/Passport integrity | SHA-256 checked at issuance/download; Ed25519 signature and approved fingerprint; independent chain verifier. Original passes; altered recipient/file fails. |
| Rate limiting | Durable per-session, login, catalog, quotes, execution, preflight, guest and reconciliation budgets. No unlimited provider spend from guests. |
| XSS/input | React text escaping, strict size-bounded Zod schemas, parameterized SQL. No raw user HTML rendering was introduced. Production CSP retains no unsafe-eval; frame/object/form restrictions remain. |
| Secrets | Ignored release files, no bulk environment pull, secret scan of source/history/public bundles; no secrets or private trial binding in the commit. |
| Failure states | Pending/failed/incomplete/refunded/disputed do not imply entitlement. Consumed or expired approvals are not reused. Reconciliation of existing attempts remains independent of preparation flag. |

## Confirmed issue fixed

Video tooling inherited a shared symlink dependency tree with a moderate minimatch advisory (GHSA-g3hv-75wg-m249). The video project now has its own reproducible pinned lockfile and minimatch >=11.0.1 override. App, app-production and final video audits report zero vulnerabilities. No application runtime library was added for narration or motion.

## Executed local checks

- 224 unit/integration tests passed, including approval concurrency, expiry, fail-closed trial configuration, source validation, multiple-reference/refund reconciliation, idempotency and new homepage/video story consistency.
- Nine Playwright journeys passed together, including a new fresh no-code guest checkout → authorization → simulated delivery → download → original/tampered Passport journey.
- Typecheck, lint and production build passed.
- Secret scan with Git history and public bundles: 210 inputs, zero findings before final documentation commit; the release scan is repeated after staging.
- Browser visual review: 360/390/768/1440px, no horizontal overflow; desktop/mobile, reduced motion and existing light/dark support. Final production captures follow deployment.
- Real Rabby mainnet use is the previously completed trial. Current wallet selection/ownership tests use mocks or ephemeral test accounts; no additional real signing or spending was performed.

## Evidence and operational limits

Dated real Neon concurrency/rollback/reconnect evidence is preserved in [neon-verification.json](evidence/neon-verification.json); it is distinct from local PGlite. Genuine funded proof is in the [mainnet evidence directory](evidence/mainnet-655d4cc9-0eaf-41b7-a7bf-05fc73286eea/). Public RPC/WSL DNS failures are reported as unavailable checks, not successful settlement. The health API’s obsolete blanket UNVERIFIED label was corrected as read-only presentation metadata: production identifies a verified recorded purchase, demo identifies DEMO_ONLY, and both explicitly link the separate genuine production order. This does not alter any purchase state or verification gate.

Buyer-only production download remains protected by the original purchasing session. No owner credentials were requested or authentication bypassed. The durable entitled bytes and public Passport were rechecked; hosted demo file access is tested end-to-end. No physical-device, Safari/Firefox or professional penetration-testing claim is made.

Final hosted checks, clean-clone results, screenshot paths and MP4 validation are appended after execution. Video publication, X posting and submission remain owner actions.

## Final executed results

- A credential-free clean clone at commit 129cbce installed from the root lockfile and passed all 224 tests without ignored environment files or runtime data.
- Fresh incognito hosted flow followed production’s primary CTA into the public buyer checkout, approved one no-funds demo purchase, simulated delivery, downloaded/hashed the file and verified original/tampered Passport evidence. No owner code or wallet was used.
- All five hosted Lab checks returned HTTP 200 and passed; 20 notifications, including 15 concurrent, left one Neon entitlement. Read-only queries found the tested demo order absent from production and database identities distinct.
- Production screenshots span 360, 390, 430, 768, 1280, 1440 and 1920px. Home desktop/mobile in light/dark, real Passport and completed Lab had zero axe violations; no horizontal overflow in the 11 recorded viewport/page states. No uncaught browser errors were recorded.
- Actual production order remains FULFILLED with one attempt, one entitlement, the correct 1,613 bytes and one Passport. Fresh read-only chain/Neon verification still passes; no additional source payment occurred.
- Both Vercel apps were READY on the frontend commit with livePayments false, trial binding absent and unchanged distinct public signing-key fingerprints. The final documentation commit is checked separately after Git deployment.
- Narrated review MP4: 91 seconds, 1920×1080, H.264 video/AAC speech at 30 fps. Sentence-aligned captions; mean audio volume -22.4 dB, peak -2.9 dB in the first render, without clipping. Frame review caught initial loading footage in the Lab segment; final cut uses the completed genuine captured result.
- MP4 publication is blocked pending the owner’s watch-through approval, not by a claimed payment failure. No video/X/application submission was published.

Scheduled reconciliation remained operational: the latest observed runs [43547692304](https://github.com/sopskistar/RouteTill/actions/runs/43547692304) and [43521454863](https://github.com/sopskistar/RouteTill/actions/runs/43521454863) completed successfully. No new scheduler or secret changes were needed.

The supplied RealtyOS recording was recovered under its suffixed filename, copied to the requested ignored reference path and visually reviewed. RouteTill uses its own generated developer workspace, navy/coral palette, original John SVG and actual Purchase Passport overlay; none of the reference’s real-estate artwork is shipped.
