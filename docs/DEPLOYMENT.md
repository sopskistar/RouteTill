# Vercel + Neon preparation

No infrastructure has been created or deployed by this build. Owner approval is required before publication or paid infrastructure. No mainnet payment has been signed or sent.

1. Create or select two distinct Neon PostgreSQL databases/branches: live and judge-demo. Configure `DATABASE_URL` and `DEMO_DATABASE_URL` server-side. Different URL strings pointing to the same database are not sufficient isolation; the owner must choose genuinely distinct stores.
2. Generate an Ed25519 issuer PKCS8 private key outside the repository and store it as `PASSPORT_PRIVATE_KEY`. Publish the corresponding public key through a separate trusted channel. The local key under `data/` is for development only.
3. Configure `APP_ORIGIN` to the exact HTTPS deployment origin; `NEAR_INTENTS_JWT`, `JUDGE_ACCESS_CODE`, and a random `CRON_SECRET`. Optionally configure a stable Base/Arbitrum RPC and `RECONCILE_WEBHOOK_SECRET`. Keep `ENABLE_LIVE_PAYMENTS=false` until the owner approves a live trial.
4. Migrate both databases from a trusted environment:

   ```sh
   npm run db:migrate
   npm run db:migrate -- --demo
   ```

5. Run `node --import tsx --env-file=.env.local scripts/production-preflight.ts`. Missing configuration is a failing result. This checks presence, never prints secrets.
6. Build with `npm run build`. Vercel uses the Node runtime. `vercel.json` schedules `/api/cron/reconcile` every five minutes and caps the handler at 60 seconds. Confirm the chosen Vercel plan supports that cadence; otherwise use an owner-approved external scheduler calling the route with `Authorization: Bearer CRON_SECRET`. Do not silently accept a once-daily cadence for payment reconciliation.
7. After owner approval, deploy, open the actual HTTPS URL, and rerun browser tests with `PLAYWRIGHT_BASE_URL=https://your-deployment`. Supply the owner’s judge code in browser setup. The local browser suite assumes the local no-code demonstration, so hosted authentication requires that explicit setup adjustment.
8. Verify live merchant registration/sign-in, wallet message ownership, a dry quote, all five synthetic challenges on Neon, persistence across separate instances, cron invocation, outbox retry and cross-tenant denial. Record actual results. Do not call hosted/Neon verification complete merely because local tests pass.

## Live trial approval

The owner chooses and confirms the source wallet, Base merchant recipient, product/amount, acceptable quote costs and gas. Register a live merchant, verify its settlement wallet, create a product, and prepare a live checkout. Enable deposit creation only when ready. Review a fresh exact-output quote and approve the wallet transaction explicitly. Record actual source/destination hashes only after they exist. Independently query receipt logs/finality and run the CLI with a trusted RPC. Until this succeeds, real settlement is UNVERIFIED.

## Failure recovery

Missing RPC/provider evidence blocks fulfillment and leaves the attempt retryable within its polling budget. A consumed approval is never reopened after an interrupted quote; prepare a new purchase. Passport worker retries do not duplicate entitlement issuance. Demo reset creates a fresh purchase; it does not erase audit records or touch the live database.
