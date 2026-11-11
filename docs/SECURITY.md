# Security boundaries and threat model

This is a hackathon MVP, not an externally audited payment service.

| Threat | Enforcement | Remaining trust |
|---|---|---|
| Merchant/recipient substitution | Immutable policy fingerprint and server-side equality checks | Human must inspect the intended merchant before approving |
| Price/route/product changes | Integer caps, fixed destination amount, route/product/digest checks | Source network gas is outside the cap |
| Expired/reused authority | Expiry plus locked single-use approval and unique attempt | Browser account identifies the approver; no buyer blockchain signature |
| Fake payment notifications | Live callbacks only wake reconciliation; status and RPCs are re-read | Provider associates its deposit with the destination transaction |
| Replay/concurrent fulfillment | Row lock, unique entitlement and transfer/event constraints, transaction | Database operator and PostgreSQL integrity |
| Wrong token/recipient/amount/finality | Canonical successful receipt and exact ERC-20 log inspection | Configured RPC’s chain/finality honesty and availability |
| Duplicate transfer association | Unique chain/transaction/log key | A transfer batched into multiple ambiguous candidate logs is conservatively rejected |
| Artifact replacement | SHA-256 pinned at approval, checked at issuance and download | Hash proves byte identity, not product quality |
| Receipt tampering | Ed25519 and canonical policy hash, separately pinned verifier key | App signature proves an issuer assertion, not an independent blockchain fact |
| Merchant data exposure | Server session checks on orders and downloads; merchant-scoped queries | Passport links intentionally reveal their public purchase terms |
| Judge fixture escape | Distinct databases; immutable mode; synthetic/live gate in fulfillment | Production must configure both distinct URLs and a protected judge code |

Passwords use salted scrypt; opaque 256-bit session tokens are stored only as hashes, expire in 12 hours, and use HttpOnly/SameSite Strict cookies. Hosted cookies are Secure. EIP-191 ownership challenges bind merchant, wallet, origin, random nonce and five-minute expiry, and are consumed transactionally. No seed phrase or wallet private key is requested or held.

POST cookie requests require the configured origin. Bearer credentials are limited agent tokens; approval, wallet configuration and admin functions reject them. Origin checks prevent cross-site form/fetch mutations, while strict cookie policy adds a second boundary. PostgreSQL-backed limits cap sessions, login, quote traffic, lab work and reconciliation. Inputs use strict Zod schemas and size limits. Financial math uses BigInt, never JavaScript floating-point arithmetic.

The CSP restricts scripts, connections, fonts and assets to self, with inline scripts/styles needed by Next.js; `unsafe-eval` is absent in production. Frame embedding, object content and cross-origin form actions are blocked. No external analytics script runs. Errors return sanitized recovery text and a trace identifier; application logs omit credentials and raw provider request headers.

API credentials, issuer private keys, database URLs and cron/webhook secrets belong in environment variables. Runtime keys and demo database files are ignored and excluded from server tracing. The source secret scan checks known locally configured values plus credential patterns without printing matches.

Public Passport sharing reveals merchant recipient, product, terms and public evidence. It does not reveal buyer email, session credentials or artifact contents. Product content is excluded from public discovery. A shared Passport does not grant download access.

## Operational limits

Use managed PostgreSQL for hosting, with database backups and least-privilege runtime credentials. Local PGlite supports one process only; a process lock protects it. Do not run seed/migration concurrently with the local server. No webhook delivery to arbitrary merchant URLs is implemented, avoiding an unbounded outbound/SSRF surface. The supported webhook is an authenticated inbound reconciliation wakeup.

The current verifier does not perform an Ethereum light-client/receipt-inclusion proof. It re-reads chain facts from a caller-selected RPC. There is no external audit, guaranteed uptime, automatic dispute resolution, password reset, email verification, or arbitrary contract-wallet signature support. See [limitations](LIMITATIONS.md) before exposing a production deployment.
