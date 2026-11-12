# Release recovery — 12 November 2026

Release status: **NO-GO for final submission or funded settlement**. Safe diagnostic deployment is ready for owner review, with payments disabled. This session reconstructed the handoff from repository files; it did not access the previous conversation.

## Preserved work

Starting branch: `main`; HEAD: `cf7ca2e`. The starting tree contained 25 modified tracked files and five untracked additions. No files were discarded, keys regenerated, environment files overwritten, commits pushed, or deployments triggered.

The existing changes cover the homepage and purchase explanations, responsive styling, bounded no-code synthetic guest sessions, privileged merchant/agent access, guest migration 003, production/development CSP separation, Passport PEM parsing, sanitized API diagnostics, and tests. The six-viewport capture report and both independent reviewers' final assessments support preserving the design. Final reviews closed the initial readability, spacing and mobile axe concerns. These screenshots show local synthetic execution only.

## Current observations

| Check | Recovery-session result |
|---|---|
| Production `/api/health` | 200; live payments false |
| Demo `/api/health` | 200; live payments false |
| Production `/api/products/purchase-vectors?mode=live` | 404; expected demo-only product absence |
| Demo `/api/products/purchase-vectors?mode=demo` | 200; previously reported 503 is no longer reproduced |
| Production `/api/keys?mode=live` | 503 |
| Demo `/api/keys?mode=demo` | 503 |
| Local database configuration | Two present, distinct pooled Neon PostgreSQL identities; TLS required |
| Actual migrations | Both databases accepted repository migrations 001–003 through TCP |
| Actual concurrency suite | FAILED to complete: intermittent connection timeouts; no passing report generated |
| Local signing material | Both present, valid Ed25519, distinct public identities |
| Vercel key metadata | Expected production/demo key names present in production scope; values sensitive and redacted |
| Local release preflights | Both passed; live payments disabled |
| Mainnet settlement | UNVERIFIED; no payment initiated |

The public key handler selects the deployment mode and signing key without a PostgreSQL query. Successful migrations cannot repair that endpoint. Deployed sensitive key values cannot be validated through environment readback. Missing key names are ruled out by Vercel metadata; malformed serialization or invalid deployed key material remains a possibility, not an established diagnosis. The preserved local parser supports real newlines, escaped newlines and quoted values, and returns `PASSPORT_KEY_CONFIGURATION` without exposing material.

Sandbox DNS returned `EAI_AGAIN`. Outside-sandbox connections sometimes succeeded and sometimes returned `ENETUNREACH`, `ETIMEDOUT`, or `ENOTFOUND`, across pooled/direct TCP, HTTPS and WebSocket. Successful queries and migrations rule out a continuous outage or universally invalid local credentials. They do not establish reliable connectivity, table-level application permissions, or concurrency correctness. No claim is made about the owner's regular terminal until the owner runs the command below.

## Fresh local validation

- Unit/persistence: 145 tests, five files, passed.
- Browser: seven journeys passed against the local production server; 30.2 seconds.
- Lint, typecheck and production build: passed. Build used Node 22.23.1 outside the sandbox.
- Secret scan including history and public bundles: 165 inputs, zero findings after documentation updates.
- Full and production-only dependency audits: zero vulnerabilities.
- The two ignored release files remain ignored and untracked. Their values were never printed.

## Next gates

1. Owner approval for the reviewed source push to GitHub `main` and redeployment of **both existing Vercel projects**, retaining current signing identities and `ENABLE_LIVE_PAYMENTS=false`. No environment bulk pull or key rotation. The diagnostic code is safe to deploy before concurrency passes.
2. Retest public keys first. On failure, use the safe configuration code to repair serialization while preserving the original signing identity. Compare returned public fingerprints against the existing local public fingerprints privately before accepting the issuer identity. Any replacement of unknown deployed signing material needs owner review.
3. Complete the actual Neon suite. The smallest owner-terminal check is:

   ```sh
   cd /home/sopski/projects/RouteTill
   npm run db:verify:neon
   ```

   It loads the existing ignored release files, applies idempotent migrations, and uses generated test schemas. Do not paste raw errors or credentials into chat. A successful run writes sanitized `docs/evidence/neon-verification.json`. Migrations already succeeded; SQL Editor schema application is unnecessary unless later schema inspection contradicts this result. A successful PGlite run cannot satisfy this gate.
4. Verify both deployed workflows and capture hosted evidence: merchant auth/ownership, product, approval, dry quote and payment gates; guest restrictions, all five attacks, 20 notifications to one persisted entitlement, signed Passport, tamper checks, expiry/rate limits and database isolation. A product 404 alone does not prove complete isolation.
5. Prepare a fresh read-only payment preflight using the existing owner-selected addresses and assets from `artifacts/live/owner-readonly-preflight.json`. The earlier quote is expired. Live enablement, payment authorization and wallet confirmation remain separate explicit owner decisions.
6. Update submission and X drafts with verified outcomes; owner approval is required to publish or submit. Existing video remains preserved.

Deadline: 14 November 2026, 23:59 UTC. The existing submission materials are drafts and contain historical readiness statements; revise them after hosted verification rather than presenting them as current evidence.
