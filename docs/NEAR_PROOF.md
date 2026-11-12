# NEAR evidence — quote verified, mainnet settlement UNVERIFIED

Latest generic authenticated probe: **2026-11-12T00:32:50.537Z**. Original sanitized [quote evidence](evidence/live-dry-quote-2026-11-12.json) is included; the earlier [11 November observation](evidence/live-dry-quote-2026-11-11.json) remains preserved.

| Check | Actual observation |
|---|---|
| Live catalog | 230 assets |
| Provider | Production `https://1click.chaindefuser.com`, server-side authenticated |
| Supported route | Arbitrum One (42161) native USDC → Base (8453) native USDC |
| Exact destination output | 10 USDC |
| Generic dry-quote input | 10.105374 USDC |
| Official SDK signature | PASS |
| Modified recipient / output amount | Both rejected |
| Deposit created / funds moved | No / no |
| Real destination transaction and entitlement | **UNVERIFIED; no transaction hashes exist** |

The earlier 216/229-asset observations and 10.104624/10.105320 input amounts are historical quotes, not current prices or settlement. External research was preserved.

## Owner-address read-only preflight

At **2026-11-12T00:42:28.274Z**, an additional fresh dry quote used the owner-supplied checksummed buyer/refund address and separate merchant address. The complete local report is `artifacts/live/owner-readonly-preflight.json`; original signed quote is `artifacts/live/owner-readonly-quote.json`. These private operational captures are ignored by Git.

The signed quote required **10.105371 Arbitrum USDC** for **10 Base USDC** to the intended merchant. The buyer had sufficient USDC and Arbitrum ETH at the checked time. Independent RPCs confirmed chain IDs and six-decimal native USDC contracts; both supplied account addresses had empty contract code. Address format and code do not establish ownership.

Indicative transfer gas was **63,253 units at 0.02 gwei**, or **0.00000126506 ETH**, with a **0.0000018976 ETH** buffered reserve. This simulated a native-USDC transfer to the supplied merchant address on Arbitrum **for gas estimation only**. A dry quote has no actual deposit address, so exact payment gas remains pending the executable quote. No transfer was signed or broadcast.

The quoted USDC input/output difference was **0.105371 USDC**, an aggregate route-cost/spread difference, not an independently itemized protocol fee. Provider fields listed withdrawal fee **0.0024 USDC**, conditional refund fee **0.0053 USDC**, and a provider-returned application fee of **1 basis point**. Do not add withdrawal fees a second time to the quoted source amount. In the pinned SDK, dry-quote time/fee fields and request `appFees` are outside signature coverage; executable quotes cover additional deposit/expiry/time/refund/withdraw fields. The exact amount and policy checks still apply.

Refund is fixed to the buyer on the origin chain. Public addresses do not prove wallet control; merchant ownership requires the application's nonce-bound signature flow. Receiving Base USDC does not require a recipient transaction. The source transfer requires Arbitrum ETH gas and an explicit wallet confirmation; it requires no unlimited USDC approval.

The price-freshness window ended at **00:43:55.940 UTC**. The requested provider deadline was **01:02:25.123 UTC**, but there was **no executable deposit expiry**, because this was a dry preview. It cannot be used as payment instructions. Obtain a new quote for any later review.

## Implemented execution path

Explicit EIP-6963 provider choice with Rabby priority; authenticated catalog/quotes; signature and immutable-policy checks; exact integer amounts/minimum/cap; expiry/address/refund validation; atomic approval consumption; a unique quote-specific deposit; independent balances/gas/exact-transfer preflight; explicit selected-wallet confirmation; canonical source transaction/receipt/calldata/log validation; bounded provider status reconciliation; Base token/recipient/amount/receipt/canonical-block/12-confirmation/finalized-head verification; transactional entitlement and mode-specific signed Passport outbox.

Local tests and public RPC observations do **not** establish real extension signing, Neon multi-instance behavior, deployed reconciliation or successful settlement. Missing/ambiguous evidence blocks delivery.

## Reproduce read-only checks

```sh
npm run evidence:live
# Owner-provided public addresses only; no signing or deposit creation:
node --env-file=.env.local --import tsx scripts/read-only-preflight.ts \
  --buyer YOUR_PUBLIC_ARBITRUM_ADDRESS \
  --merchant YOUR_PUBLIC_BASE_ADDRESS --amount 10
```

A first network attempt timed out; one retry succeeded and produced the reported evidence. Scripts save no API credential. Fixture dry quotes can be inspected offline; a fresh executable quote is required after an approved purchase for a funded trial.

## Real payment gate and evidence record

Pending: owner-approved code publication → Vercel/Neon setup and real persistence checks → verified merchant ownership → approved actual purchase → fresh executable quote and exact-deposit gas preflight → **separate explicit owner authorization and manual Rabby confirmation** → source receipt registration → provider success and independent finalized Base settlement → SQL entitlement count one → real Passport and independent verification.

Do not fill source/destination hashes, explorer links, settlement timestamps or a live Passport with synthetic values. They remain absent until obtained from the approved transaction.

Primary references: [1Click quote API](https://docs.near-intents.org/api-reference/oneclick/request-a-swap-quote), [official signature SDK](https://github.com/defuse-protocol/one-click-sdk-typescript), [Circle native USDC contracts](https://developers.circle.com/stablecoins/usdc-contract-addresses).
