# Current verification and historical hosted recovery

Current financial result: the actual order `655d4cc9-0eaf-41b7-a7bf-05fc73286eea` is FULFILLED. See [NEAR_PROOF.md](NEAR_PROOF.md), the [public manifest](evidence/mainnet-655d4cc9-0eaf-41b7-a7bf-05fc73286eea/verification-manifest.json) and the [real Neon concurrency/rollback/isolation report](evidence/neon-verification.json). Public checkout and Lab are no-funds demonstrations; elevated administration remains protected. Both deployments retain disabled live preparation and distinct unchanged Passport identities.

The dated key-repair report below is historical. Its “remaining gates” and NO-GO conclusions predate successful concurrency verification and the completed mainnet purchase; they are not the current financial status. Final presentation checks are recorded in FINAL_AUDIT.md.

---

# Hosted verification — Passport repair completed 13 November 2026

**Passport repair and hosted judge verification: PASS.** Final funded-release readiness remains **NO-GO**: the full Neon transaction suite and genuine mainnet settlement remain UNVERIFIED. No wallet transaction was signed and no funds moved.

## Approved deployment and configuration

Both existing projects are READY on `ebeb14b941e06840416fa23b7eeb8b6a331ad1ed`:

| Project | Deployment | Public application |
|---|---|---|
| Production `routetill` | `dpl_AJ95gDHWAkmTQ6ZNRr4gMYnKFysf` | https://routetill.vercel.app |
| Judge demo `routetill-demo` | `dpl_8UobZMGHFkjuT7Sg4wiS5uDHSsMS` | https://routetill-demo.vercel.app |

Only the approved Production-scoped variables were restored: `PASSPORT_PRIVATE_KEY` in production and `DEMO_PASSPORT_PRIVATE_KEY` in demo. Each source was the existing value in its corresponding ignored release file, validated as an Ed25519 PKCS8 key. Uploads used canonical PEM with actual newlines through authenticated HTTPS request bodies; private values were never printed or passed as shell arguments. Both release-file checksums still match the pre-push baseline. No key was generated, rotated or modified locally.

No Neon connection, schema, migration, JWT, wallet, cron credential or unrelated environment setting was changed. No public migrations were rerun. Both hosted health endpoints report `livePayments: false`. Production and demo continue using their respective database configurations. Source code was not changed or pushed during this repair; these documentation/evidence updates remain local pending publication approval.

## Public signing identity

Both public-key APIs now return HTTP 200 and parse as Ed25519 SPKI public keys. Each returned fingerprint exactly matches the fingerprint derived from its corresponding unchanged local private key. The keys are distinct.

Fingerprint format below is **SHA-256 of the UTF-8 SPKI PEM response**, also used by the Passport's `keyFingerprint`; it is not a DER fingerprint.

| Environment | Endpoint | Public fingerprint |
|---|---|---|
| Production | `/api/keys?mode=live` | `84a160fb109bbd108883adb71f30669d82ede4d945c97bfe22172c5d1e30e354` |
| Demo | `/api/keys?mode=demo` | `a9ee137c3054beeaf42b280c8e3d5125a3946324924fca1c2ea0c9ca15239554` |

Previously, both variables existed in the correct Production scope, but runtime parsing returned `PASSPORT_KEY_CONFIGURATION`. Restoring the existing identities as canonical PKCS8 PEM resolved both failures. The exact previous malformed serialization cannot be established because Vercel redacts sensitive values. No claim is made that it was specifically a literal-newline, quoting or assignment-prefix error. The key handler performs no PostgreSQL query.

## Actual hosted judge results

The API journey and a separate browser journey both ran against the deployed demo and its actual PostgreSQL backend.

| Check | Verified result |
|---|---|
| Product retrieval, guest creation and prepared purchase | 200; cookie-scoped guest and PostgreSQL backend |
| Merchant substitution | Rejected, `MERCHANT_SUBSTITUTION` |
| Price manipulation | Rejected, `PRICE_LIMIT` |
| Approval reuse | Rejected, `APPROVAL_REUSED` |
| Replay | 20 deliveries, including 15 concurrent calls; exactly one stored entitlement |
| Passport tampering | Original integrity PASS; modified recipient FAIL; modified artifact FAIL |
| Durable state after the first replay | FULFILLED with one entitlement, checked before the subsequent tamper challenge |
| Public signed Passport and entitled file | Both retrieved successfully |
| Independent local verifier using hosted public key and downloaded bytes | Integrity PASS; synthetic true; mainnet settlement UNVERIFIED |
| Guest scope | Merchant administration, agent-token creation and provider quotes denied with `GUEST_SCOPE` |
| Session reuse/logout | Existing guest session reused; authenticated access denied after logout |
| Production boundaries | Demo mode and guest creation denied; demo-only product and tested demo Passport absent |
| Payment gates | Production and demo both report live payments disabled |

The tamper challenge also runs a replay before checking the signature. Therefore the API session's two replay-related invocations deliver 40 calls in total, with 20 distinct notification event keys. The first replay independently reported **20 → one entitlement** before tamper ran. The final entitlement count remains one.

The API test order is `9f085e4a-5439-411d-97d1-ef4525e41dac`. A separate browser test order is `b4f5cc56-741a-4f32-a350-d614a54e1530`. Both are explicitly synthetic purchases; their transfer hashes and settlement/finality fields are fixtures, not public-chain evidence.

## Independent Neon persistence and isolation

A separate process made read-only HTTPS queries directly against the configured Neon databases after the hosted API session completed:

| Stored record for the API test order | Demo | Production |
|---|---:|---:|
| Orders | 1 | 0 |
| Attempts | 1 | 0 |
| Entitlements | 1 | 0 |
| Signed Passports | 1 | 0 |
| Distinct settlement-notification events | 20 | 0 |
| Delivered outbox jobs | 1 | 0 |

This verifies persistence and isolation for this tested purchase. It does not assert that every historical production row has been audited. No database administrative changes were needed.

## Browser and verifier evidence

The actual hosted browser flow completed all five attacks, original Passport verification, recipient tamper detection and delivered-file SHA-256 verification. Desktop and 390px Lab captures had no horizontal overflow and zero axe WCAG A/AA violations. Screenshots were inspected. Earlier six homepage viewport/project captures also passed overflow, navigation and axe checks; those are separate from the current Lab/Passport checks.

An initial temporary browser harness passed the five attacks but stopped because axe required an explicit browser context. Correcting that test harness and rerunning the browser journey passed. No deployed application code was changed.

Local captures and exported evidence are in ignored `artifacts/release-hosted/`, including `post-repair-lab-{desktop,phone}.png`, `post-repair-passport-phone.png`, `post-repair-passport.json`, `post-repair-artifact.md` and `post-repair-cli-verification.json`. The CLI result has eight passing integrity checks, `synthetic: true`, and settlement UNVERIFIED.

[Sanitized repair and verification evidence](evidence/passport-repair-2026-11-13.json). [Pre-repair observations](evidence/hosted-verification-2026-11-12.json) remain historical evidence; their key-failure status is superseded by this report.

## Remaining release gates

1. **Full Neon transaction suite:** still UNVERIFIED. Hosted notification concurrency now passes, but the separate 12-approval contention, rollback and broader reconnect suite previously failed over WSL DNS/TCP/TLS-read errors. No public migrations should be repeated to diagnose this. A process-only IPv4 workaround previously connected but later timed out, so DNS ordering alone did not establish reliable transport. A full-suite runner outside this WSL path remains an option requiring separate approval if publication or credential configuration is needed.
2. **Production merchant and buyer workflow:** validate the real merchant account, Base recipient ownership, product/checkout, human authorization and a fresh authenticated dry quote on production. Earlier local merchant tests do not prove this hosted owner workflow. Wallet ownership signing requires the owner's explicit authorization; none was performed here.
3. **Real-payment preflight:** retain the existing buyer/merchant addresses and native USDC route in `artifacts/live/owner-readonly-preflight.json`. Its old quote/balances are historical. Refresh read-only quote, source balances and gas estimates after the production account/product checks. An executable deposit quote is still gated by disabled live payments; do not bypass that gate.
4. **Funded evidence:** only after separate owner approval for enablement and the exact wallet action, verify source transfer, provider success, finalized Base receipt, one durable entitlement, artifact, signed live Passport and independent explorer/RPC evidence. Mainnet settlement remains UNVERIFIED until then.
5. **Publication/submission:** the approved source is deployed, but these new documentation/evidence changes have not been pushed. Final submission and X publication still require explicit approval. The existing video is preserved.

The WSL resolver/IPv6 findings and migration markers from the earlier report remain valid historical observations. They are distinct from the now-resolved runtime signing configuration. No global WSL networking, DNS or firewall settings were changed.

## Scheduled reconciliation follow-up

Both GitHub Environments lacked `APP_ORIGIN` and `CRON_SECRET`; their guards failed before any HTTP request. Configuring the existing corresponding values resolved the failure. [Actual manual run 43362659074](https://github.com/sopskistar/RouteTill/actions/runs/43362659074) passed both jobs without changing the workflow or schedule. Read-only production inspection found no merchant account or product yet. [Exact findings and next owner step](RECONCILIATION.md).
