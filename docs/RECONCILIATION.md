> Current update: the first genuine purchase subsequently reached FULFILLED through normal reconciliation, including independently verified merchant receipt and source-chain refund references. See [NEAR_PROOF.md](NEAR_PROOF.md). The operational recovery and pre-payment readiness notes below are historical, not instructions to repeat the completed purchase.

# GitHub reconciliation recovery — 13 November 2026

**Resolved and verified by an actual GitHub Actions run.** No workflow-file change, schedule suspension, application deployment or signing-key change was required.

## Exact failure

[Failed scheduled run 43350271571](https://github.com/sopskistar/RouteTill/actions/runs/43350271571) failed in both matrix jobs at **Wake the authenticated database-backed worker**. Each log printed:

```text
Configure APP_ORIGIN and CRON_SECRET in this GitHub environment.
##[error]Process completed with exit code 1.
```

The failure occurred before curl called Vercel. Both GitHub Environments already existed, but each had zero environment variables and zero environment secrets. Both required settings were missing. The initial sandbox GitHub authentication failure was a networking artifact; authenticated access succeeded outside the sandbox.

## Correction and verification

Configured only the missing GitHub Environment settings:

| GitHub Environment | `APP_ORIGIN` variable | `CRON_SECRET` secret |
|---|---|---|
| `production` | `https://routetill.vercel.app` | Existing production credential, reused unchanged |
| `demo` | `https://routetill-demo.vercel.app` | Existing demo credential, reused unchanged |

Before setting secrets, authenticated calls to both live reconciliation endpoints returned 200 using the corresponding existing values from the ignored release files. Secret uploads used GitHub CLI stdin rather than shell arguments or terminal output. No secret values were displayed, and no credentials were generated or rotated. No Vercel variables were changed.

Dispatched exactly one manual workflow on `main` at commit `ebeb14b941e06840416fa23b7eeb8b6a331ad1ed`:

**[Successful run 43362659074](https://github.com/sopskistar/RouteTill/actions/runs/43362659074)**

| Job | Result |
|---|---|
| `reconcile (production)` | SUCCESS |
| `reconcile (demo)` | SUCCESS |

Both worker steps passed. The five-minute schedule remains enabled and unchanged. Its execution is best-effort; no guarantee is made about GitHub's scheduling delays. No owner action is needed to finish this correction.

Direct endpoint checks returned production `checked: 0`, no failed checks; demo `checked: 0`, `syntheticOnly: true`, no pending outbox jobs. These results verify authenticated worker reachability and database access. There was no paid purchase to reconcile, so this is not proof of recovery of a real cross-chain settlement.

## Production readiness observed independently

Read-only production database queries and public API checks found:

- Zero merchant accounts, verified wallets, matching recipient accounts/products, completed recipient ownership challenges, or live purchase orders.
- Production health 200 with live payments disabled.
- Production product catalog 200 with zero products.
- Unauthenticated merchant session lookup correctly returns 401.

The intended recipient remains `0x66A7694A7e88edd9C22847e422c00c1d4053d288` on Base. The buyer/refund address remains `0x8e45AE32aBA44B0fa90EBa821818ceEdE726026f` on Arbitrum. No addresses were replaced and no account, product, approval or wallet ownership record was fabricated.

**Smallest required owner step:** create the owner merchant account at https://routetill.vercel.app/merchant, keeping the password private. Recipient ownership verification then requires separate owner approval and action in the intended wallet; no signature was requested or produced here. Product publication is correctly gated on verified ownership, so actual production checkout remains unverified until that setup exists.

## Remaining payment gates

The deployed judge's 15-concurrent-notification replay is verified against real Neon. The separate full transaction suite (including 12 simultaneous approval consumers and rollback) remains UNVERIFIED after earlier WSL network failures. No migrations were repeated during this recovery.

Read-only observations were refreshed at **2026-11-13 04:04:52 UTC**, using the original buyer, recipient, refund address and 10 USDC destination amount. The authenticated quote signature verified; Arbitrum/Base chain IDs and both native USDC six-decimal checks passed.

| Observation | Result |
|---|---|
| Quoted Arbitrum USDC input | 10.105478 USDC |
| Base merchant output | 10 USDC |
| Read-only proposal cap | 11 USDC; not a spending authorization |
| Buyer source balance | 10.912413 USDC |
| Buyer Arbitrum ETH | 0.00008642303891 ETH |
| Indicative gas estimate | 63,334 units at 20,000,000 wei |
| Indicative gas cost / buffered reserve | 0.00000126668 / 0.000001900025 ETH |
| Observed sufficiency | USDC and indicative gas reserve sufficient at observation |
| Quote observation window | Quoted 04:04:50 UTC; 90-second freshness window ends 04:06:20 UTC |
| Executable deposit | None; `transactionReady: false` |

Gas was estimated for an explicitly indicative native USDC transfer because a dry quote has no deposit address. It is not an exact-deposit simulation or a fee guarantee. The source cap excludes ETH gas. Fresh observations are recorded in `artifacts/reconciliation/payment-preflight.json` and `payment-quote.json`; previous evidence was preserved unchanged. [Sanitized machine-readable recovery and preflight record](evidence/reconciliation-2026-11-13.json). A dry quote is neither an executable deposit instruction nor evidence of payment. Its freshness must be checked at observation time and refreshed before any future funded action. No expired quote is authorized for payment.

Before a first genuine payment: finish owner account and recipient verification, create the intended product, validate production checkout and human policy approval, address the full transaction-suite gate, obtain explicit approval for live enablement, then produce fresh executable quote/deposit and exact gas instructions for a separate explicit wallet authorization. Live payments remain disabled and mainnet settlement remains UNVERIFIED.

The existing Passport identities, hosted judge flow, database isolation, Vercel deployments and demonstration video were preserved. New documentation/evidence remains local; no Git push was performed for this configuration-only correction.
