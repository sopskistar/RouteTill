# NEAR integration evidence

Fresh read-only authenticated probe: **2026-11-11T12:11:28.447Z**. Saved locally as `artifacts/live/dry-quote.json` and `catalog.json`; regenerate using `npm run evidence:live` with `NEAR_INTENTS_JWT` configured.

| Check | Actual observation |
|---|---|
| Live token catalog | 229 assets returned |
| Provider | Production `https://1click.chaindefuser.com`, server-side `X-API-Key` |
| Route | Arbitrum native USDC → Base native USDC |
| Exact output | 10,000,000 atomic units = 10 USDC |
| Quoted input | 10,105,320 atomic units = 10.105320 USDC |
| Official SDK signature | Verified with pinned production manager key |
| Changed recipient | Signature verification rejected |
| Changed amount | Signature verification rejected |
| Deposit / funds movement | None; `dry: true` |
| Real source transaction | None obtained |
| Independent merchant receipt | None obtained |
| Mainnet settlement | **UNVERIFIED** |

The quote includes a slippage buffer and provider fee fields; source wallet gas is additional and unmeasured. Current catalog and quotes are temporal observations, not a guarantee of availability or cheapest execution. Fixture addresses were used for this read-only probe and are not verified merchant wallets.

The earlier 7 November research reported 216 assets and a 10.104624 input quote. Those are historical dry observations, not current prices or successful settlement. A sanitized original response is retained as a signature-verification test fixture; research outside this repository was preserved.

## Implemented live path

Authenticated discovery/quotes; official SDK signature checks; exact atomic amounts, min deposit/cap, address and executable expiry checks; one-time approval; unique quote-specific deposit; injected EVM wallet transfer requiring explicit user confirmation; independent source receipt registration; bounded provider polling; Base native-USDC receipt/log/recipient/amount/canonical-block/12-confirmation/finalized-head checks; transactional entitlement and signed Passport outbox.

That path is implemented and tested at its local boundaries. A real funded run, owner-controlled wallet UX, Neon multi-instance concurrency and deployment reconciliation have **not** been established by mock or synthetic tests. Missing or ambiguous chain facts block entitlement issuance.

## Reproduce

```sh
npm run evidence:live
```

This makes catalog and authenticated dry-quote requests only. The script saves original response, request, verification results and timestamp without the credential. It never creates a deposit, signs a transaction or spends funds.

Read current [1Click documentation](https://docs.near-intents.org/integration/distribution-channels/1click-api/about-1click-api), [signature verification](https://docs.near-intents.org/integration/distribution-channels/1click-api/verify-quote-signature), [status schema](https://docs.near-intents.org/api-reference/oneclick/check-swap-execution-status) and [API authentication](https://docs.near-intents.org/integration/distribution-channels/1click-api/authentication). Dry and executable signature coverage differ; unsigned fee/time fields must not be represented as cryptographic facts.
