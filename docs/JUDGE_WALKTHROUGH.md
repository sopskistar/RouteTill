# Judge walkthrough

## The 30-second challenge

Start the app using the README and open `/lab`. The updated local judge demo automatically creates a bounded isolated guest session; it needs no wallet, funds, or code. Merchant administration and agent setup still require the owner’s judge access code. The deployed demo product API now returns 200 and both Neon schemas accepted migrations. The public signing-key endpoint still returns 503; the updated guest flow awaits deployment and hosted verification. Do not treat local screenshots or PGlite output as hosted persistence evidence. [Release recovery](RELEASE_RECOVERY.md).

**DO** Read the prepared purchase → **SEE** the named merchant, Agent Purchase Test Vectors, Base recipient, 10 USDC destination price, 11 USDC Arbitrum cap, expiry, digest and immutable fingerprint.

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
7. Open the entitled download, verify delivered bytes, inspect the deterministic seven-case test plan, download the actual file and generated JSON, then open its Purchase Passport. A generic download still supports byte verification without dataset processing.
8. Check original record integrity and test a modified recipient. Export JSON and run the separate CLI using a pinned public key and the downloaded file.

## Independent offline evidence

Before starting the server, `npm run seed` exports a synthetic Passport, public key and file into `artifacts/demo/`. Verify using the exact command in the README. The independent CLI uses neither the current frontend nor its verification endpoint. Retain its JSON output. For live evidence supply a separately trusted Base RPC; unavailable evidence never passes silently.

## Real-payment path

See [deployment preparation](DEPLOYMENT.md). An owner must first configure Neon, a live merchant account, verified Base recipient, source wallet/refund address, issuer key and live enablement. The owner explicitly approves the exact quote and wallet transaction. Inspect actual source transfer, provider state, destination receipt/log and finalized block. No synthetic record can substitute for that evidence. Until completed, real mainnet settlement is UNVERIFIED.

## Deterministic agent completion

Create an agent token in the workspace and run the README example. **DO** let the client discover the resource and propose → **SEE** an approval URL; it cannot approve itself. **DO** approve in the browser and run the synthetic settlement step → **SEE** one entitlement. **DO** run `npm run agent -- ORDER_ID` → **SEE** `artifacts/agent/product.md`, Passport JSON, and a digest-checked `test-plan.json` containing seven fixture cases (one expected acceptance, six rejections). The client consumes a real downloaded file; there is no LLM or autonomous signing. The plan summarizes supplied fixture labels and is separate from the executable Break-It Lab checks.
