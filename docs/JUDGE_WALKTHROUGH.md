# Judge walkthrough

## The 30-second challenge

Start the app using the README. Open `/lab` and choose **Open isolated judge workspace**. Hosted deployments require the owner’s judge code; local mode needs no funds or code.

**DO** Read the prepared purchase → **SEE** RouteTill Studio, exact product, Base recipient, 10 USDC destination price, 11 USDC Arbitrum cap, expiry, digest and immutable fingerprint.

**DO** Run all five challenges → **SEE** backend codes `MERCHANT_SUBSTITUTION`, `PRICE_LIMIT` and `APPROVAL_REUSED`; 20 deliveries against the SQL transaction produce one entitlement; original Passport integrity passes while modified recipient and artifact fail.

**DO** Inspect the Passport → **SEE** a signed JSON export, underlying synthetic receipt/log evidence, durable entitlement/event, expected/actual amounts and explicit mainnet UNVERIFIED status.

**DO** Prepare a fresh challenge order → **SEE** new isolated terms and zero entitlement count for the new order. Prior evidence remains in the audit history; live orders are untouched.

## Complete no-funds purchase

1. Open `/merchant`, enter a judge workspace, and choose **Products & links**.
2. Create a digital product with title, description, exact decimal USDC price and file contents. **SEE** its SHA-256 and working hosted link.
3. Open checkout, select the supported source, set a source limit and review the fixture refund address. Check the agent-proposal option if desired.
4. Prepare the proposal. Read every term and check the explicit authorization box. **SEE** the approval recorded as a single-use purchase permission, with no wallet access.
5. With `NEAR_INTENTS_JWT` configured, request **Get live dry quote**. **SEE** the real signed provider response and fee details. A dry quote is not payment success.
6. Choose **Run synthetic settlement & deliver**. **SEE** qualified synthetic evidence and one actual persistent entitlement after replay.
7. Open the entitled download, verify delivered bytes, download the file and open its Purchase Passport.
8. Check original record integrity and test a modified recipient. Export JSON and run the separate CLI using a pinned public key and the downloaded file.

## Independent offline evidence

Before starting the server, `npm run seed` exports a synthetic Passport, public key and file into `artifacts/demo/`. Verify using the exact command in the README. The independent CLI uses neither the current frontend nor its verification endpoint. Retain its JSON output. For live evidence supply a separately trusted Base RPC; unavailable evidence never passes silently.

## Real-payment path

See [deployment preparation](DEPLOYMENT.md). An owner must first configure Neon, a live merchant account, verified Base recipient, source wallet/refund address, issuer key and live enablement. The owner explicitly approves the exact quote and wallet transaction. Inspect actual source transfer, provider state, destination receipt/log and finalized block. No synthetic record can substitute for that evidence. Until completed, real mainnet settlement is UNVERIFIED.
