# Two isolated Vercel + Neon deployments

Status: local release preparation only. Git push/publication and deployment await owner approval. Real Neon, hosted reconciliation and wallet-extension sessions remain UNVERIFIED. The owner will create Neon through Vercel's Neon Postgres integration after the reviewed source is published.

## Exact configuration

`routetill` uses Neon **routetill-production**. `routetill-demo` uses **routetill-demo**. Each Vercel project must configure **exactly one** database URL. Both URLs on one hosted project cause a fail-closed configuration error. Separate stores, Passport signing identities, cookies/origins, cron credentials and payment authorization prevent synthetic/live contamination.

| Variable | Production `routetill` | Judge `routetill-demo` | Exposure |
|---|---|---|---|
| `DATABASE_URL` | Required: production pooled Neon URL | **Absent** | Server secret |
| `DEMO_DATABASE_URL` | **Absent** | Required: demo pooled Neon URL | Server secret |
| `PASSPORT_PRIVATE_KEY` | Required: production Ed25519 PKCS8 PEM | **Absent** | Server secret |
| `DEMO_PASSPORT_PRIVATE_KEY` | **Absent** | Required: distinct demo Ed25519 PKCS8 PEM | Server secret |
| `NEAR_INTENTS_JWT` | Required for authenticated quotes/status | Required for genuine dry-quote demonstration | Server secret |
| `APP_ORIGIN` | Actual production HTTPS origin | Actual demo HTTPS origin | Nonsecret server configuration |
| `ENABLE_JUDGE_DEMO` | `false` | `true` | Server configuration |
| `ENABLE_LIVE_PAYMENTS` | `false` until owner enables the funded trial | Always `false` | Server configuration |
| `JUDGE_ACCESS_CODE` | Absent | Required, at least 32 characters | Server secret; share privately with judges |
| `CRON_SECRET` | Required, at least 32 characters | Required, distinct from production | Server secret |
| `BASE_RPC_URL` | Optional; public Base mainnet default | Optional | Server-only; URL can contain a secret |
| `ARBITRUM_RPC_URL` | Optional; public Arbitrum default | Optional | Server-only; URL can contain a secret |
| `RECONCILE_WEBHOOK_SECRET` | Optional signed wake-up trigger | Leave absent | Server secret |
| `DEMO_APP_URL` | Optional actual HTTPS demo origin | Optional | Public nonsecret cross-link |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | Optional public Reown project ID | Optional | **Public**, required to enable WalletConnect |

No NEAR, database, Passport, cron, judge-code or agent credential may use a `NEXT_PUBLIC_` name. The public Passport key is intentionally available through `/api/keys?mode=live` or `mode=demo`; pin its fingerprint through an independent owner-controlled channel. An embedded receipt key alone is not an identity proof.

Local agent-only variables: `ROUTETILL_URL`, `ROUTETILL_AGENT_TOKEN` (secret scoped token), and `REFUND_ADDRESS` (public source wallet). The optional standalone dry-quote probe also accepts `DEMO_MERCHANT_ADDRESS` and `DEMO_REFUND_ADDRESS`; they are public addresses, never settlement proof. `PLAYWRIGHT_BASE_URL` is a test-only origin override. Vercel provides its `VERCEL` system variable; do not invent a deployment-mode setting.

## Secret retrieval without chat or Git

Run `npm run release:init` once. It creates **ignored, mode-0600** `.env.release-production.local` and `.env.release-demo.local`, with distinct new Ed25519 keys, cron credentials and judge access code. It preserves existing files and prints no values. If the existing `.env.local` has a NEAR credential, it copies that credential privately into both release files. These filenames deliberately avoid Next.js's automatic `.env.production.local` loading.

Edit these files locally. Copy values directly into each Vercel project's **Settings → Environment Variables**, never into chat, screenshots, a shell argument or Git. In Vercel, preserve PEM lines or use literal `\n` between lines; the server supports both. Reuse stable keys across redeploys so issued Passports retain their trust identity.

- **Neon URL:** Vercel project → Storage → Neon Postgres → create/connect the appropriate project. In its connection settings, enable pooling and select the correct database/role. Copy the TLS connection string into the corresponding local private file and Vercel variable. The pooled host normally contains `-pooler`. Different usernames or pooler parameters on the same physical database do not create isolation.
- **Demo variable naming:** the integration may automatically inject `DATABASE_URL`. For the demo project, configure its custom prefix so the resulting name is exactly `DEMO_DATABASE_URL`, or copy the injected pooled value to `DEMO_DATABASE_URL` and remove unprefixed `DATABASE_URL` from that project's environments. Check the final names after integration updates. Never leave both active.
- **NEAR key:** retrieve/create an authorized 1Click API key in the NEAR Intents developer dashboard. Keep the existing working key if appropriate; do not expose it in browser code.
- **WalletConnect:** create a free project in the Reown dashboard, allowlist the actual application origins and copy its public project ID. Without it, WalletConnect is visibly unavailable; discovered injected wallets still work. Real relay pairing requires a separate device/wallet check.
- **RPC providers:** optional free authenticated endpoints can replace public RPCs. Keep API-bearing URLs server-side. RouteTill treats RPC failures as UNVERIFIED, with no delivery.

## Owner-approved publication → Vercel import → Neon

1. Review the release commit, final test evidence and secret scan. Obtain explicit approval for the exact GitHub branch push and any visibility change. Do not import an empty remote branch.
2. After that push, import the same GitHub repository twice into Vercel, with names `routetill` and `routetill-demo`, root directory `.`, framework Next.js, Node **22.x**, install `npm ci`, build `npm run build`. The build uses supported Webpack because the local sandbox prevented Turbopack's compiler port. No custom output directory is required.
3. Create the two Neon resources through each project's Storage integration. Use the free plan only where offered; stop for owner approval if billing or paid infrastructure is required. An initial deployment without database configuration may fail intentionally. Configure storage and required variables before redeploying; do not put dummy database strings in production.
4. Record the actual assigned HTTPS domains. Set each `APP_ORIGIN` to its own origin with no trailing path, and set production `DEMO_APP_URL` to the actual demo origin. No proposed slug is treated as a deployed URL. Set environment scope deliberately; do not expose production credentials to untrusted preview builds.
5. Copy the two real pooled URLs into the ignored local release files. Run the actual Neon verification below. Complete configuration checks, then redeploy the reviewed commit after owner approval.
6. Validate both actual URLs: authentication/CSRF, merchant ownership, dry quote, all five demo attacks, database persistence, outbox and authenticated reconciliation. Negative check: production rejects `mode=demo`/judge sessions; demo rejects `mode=live`/live execution. Record results before claiming hosted readiness.

## Migrations and real Neon verification

Missing credentials do **not** block code publication preparation. Once configured:

```sh
# The release checker intentionally fails until real origins/credentials are configured.
npm run release:check:production
npm run release:check:demo
# These load the exact private release files, not the local PGlite configuration:
node --env-file=.env.release-production.local --import tsx scripts/migrate.ts
node --env-file=.env.release-demo.local --import tsx scripts/migrate.ts --demo
npm run db:verify:neon
```

The test command requires two distinct actual Neon TLS endpoints. It applies the idempotent migrations, creates a unique generated `rt_release_test_*` schema in each database, and exercises real PostgreSQL row locks, 12 concurrent approval attempts, all five challenges, 20 notifications → one entitlement, rollback, merchant isolation and persistence after reconnect. Test purchase records never enter production's application tables. Only its own generated schemas are removed. Sanitized results are written to `docs/evidence/neon-verification.json` **only after success**. PGlite never satisfies this command.

This application uses `pg` with explicit transactions and no session-persistent state; its SQL migrations support the pooled connection. There is no ORM requiring a separate direct-URL variable. If the integration requires direct DDL access, temporarily use its direct TLS connection in the same local `DATABASE_URL`/`DEMO_DATABASE_URL` field for the migration, then restore the pooled URL. Never print either URL. The owner must confirm the two separate Neon projects in the dashboard; URL checks alone cannot prove administrative project independence.

## Durable reconciliation on Hobby

`vercel.json` contains **one daily** cron (`0 3 * * *`), within Hobby's daily scheduling limitation. It is a recovery fallback, not timely payment processing. A five-minute Vercel Hobby cron would be rejected.

`.github/workflows/reconcile.yml` prepares a separate **best-effort five-minute GitHub Actions wake-up**, plus manual dispatch. After publication, create GitHub Environments `production` and `demo`, each with variable `APP_ORIGIN` and secret `CRON_SECRET` matching that deployment. Enable Actions and test manual dispatch. No checkout, signer or transaction sender is involved. Actions schedules can be delayed or disabled; inspect failures and limits. This workflow has not run remotely yet.

An active buyer also triggers bounded 15-second checks (60 foreground ticks). An optional timestamped HMAC wake-up can trigger reconciliation; it never supplies authoritative settlement evidence. Every path uses durable attempts, due times, poll budget (120), leases, database uniqueness and the transactional outbox. Provider polling backs off to five minutes. After the poll budget is exhausted, investigation is explicit; there is no hidden infinite service spend. Outbox retries remain durable when the browser closes. Do not claim exactly-once external message delivery.

## Funded trial gate

Buyer Rabby Account 1 on Arbitrum; a separate owner-controlled Account 2 receives Base USDC; refund equals buyer. Validate the public addresses and selected providers again in the deployed app. Verify merchant ownership with a nonce-bound message, create the actual product and human-approved policy, then enable live quote execution deliberately. Preparing instructions sends no funds.

The final packet must show signed executable quote, exact deposit/token/calldata, source amount, merchant amount and wallet, refund, expiry, independent source balances/gas, route costs, and nonrecoverable risks. **Stop for explicit human payment authorization.** The owner confirms in Rabby. Only then register the confirmed source transaction, monitor provider status, independently observe finalized Base receipt/log evidence, count one entitlement, export the Passport and run the independent verifier with a trusted RPC. Mainnet settlement remains UNVERIFIED until this succeeds.

References: [Neon Vercel-managed integration](https://neon.com/docs/guides/vercel-managed-integration), [Neon connections](https://neon.com/docs/connect/connect-from-any-app), [Vercel Hobby cron limits](https://vercel.com/docs/cron-jobs/usage-and-pricing), [Reown CSP](https://docs.reown.com/advanced/security/content-security-policy).
