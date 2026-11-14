# One-purchase mainnet trial

Implementation status: deployed and used for the genuine, independently verified FULFILLED purchase on November 13, 2026. The one-purchase trial has ended; its configuration is absent and payment preparation is disabled. The guard remains in the authoritative execution path. The production and judge-demo feature flags remain false. No release environment file, signing identity, database schema or existing purchase is changed by this correction.

## Runtime restriction

Production executable quoting requires both `ENABLE_LIVE_PAYMENTS=true` and one server-only `LIVE_PAYMENT_TRIAL` JSON object. This is a temporary binding to one exact purchase, not a reusable allowlist. Missing/malformed configuration, extra fields, lists, wildcards, mismatches and expiry fail closed. Keep the judge deployment's flag false and leave its trial configuration absent.

The object has these required fields; obtain them from the actual new order and its saved approval, never from a historical quote or an expired order:

| Field | Binding |
|---|---|
| `orderId` | One exact production order UUID |
| `policyFingerprint` | Full 64-character immutable policy SHA-256 |
| `authorizationId` | Policy authorization UUID, equal to the saved approval ID |
| `merchantId` | Product's merchant UUID |
| `buyerId` | Order's purchasing session buyer UUID, also required on execution |
| `approverBuyerId` | Saved approval's human buyer UUID; may differ from an agent purchaser |
| `productId` | Exact existing digital product UUID |
| `recipient` | Existing ownership-verified Base merchant wallet |
| `buyerAddress` | Existing buyer's Arbitrum wallet |
| `refundAddress` | Must equal that buyer wallet and the immutable policy refund address |
| `artifactSha256` | Full digest of the intended product bytes |
| `expiresAt` | Exact approved expiry in UTC ISO format, including milliseconds |

There are no default wallet, merchant, product or order values. The code separately requires native Arbitrum USDC (42161) → native Base USDC (8453), destination amount `10000000` atomic units and source ceiling `11000000` atomic units. The configuration cannot widen those constraints. Destination token and both NEAR Intents asset IDs must match the existing supported native contracts. Signing keys and provider credentials remain separate and unchanged.

`consumeApproval` locks the order and approval, checks the immutable requested policy, expiry and single use, enforces this configuration, and checks current merchant ownership and artifact bytes before any update. Existing transaction rollback and unique order/idempotency constraints are preserved. Agent/API execution reaches the same guard. A trial or authorization rejection inside the transaction neither consumes approval nor creates an attempt, provider request or deposit instructions. Expiry is checked after the product read and again after commit. If commit crosses the deadline, its already consumed approval remains spent and its attempt is marked failed before provider quoting, without a deposit address; a fresh approval is required.

The guard does not participate in reconciliation or finalization. An already deposited valid payment can still be checked, qualified and fulfilled after new preparation is disabled. This does not relax receipt, canonical-chain, destination finality, provider-association, entitlement or Passport protections.

## Owner-controlled release sequence

1. Review the security diff and local tests. Obtain explicit approval for its exact push/deployment; preserve all other uncommitted work. Deploy with both payment flags false and trial configuration absent.
2. Independently verify the deployed commit, disabled hosted gate and human-authorization checks. Missing-configuration behavior is covered locally; with the hosted flag false, the flag check rejects first. Do not claim a runtime enabled-path check until its separately approved configuration stage. Do not consume a real approval for a negative check. Keep production and demo stores and signing identities isolated.
3. Create one fresh proposal for the existing product and intended wallets, 10 Base USDC output and 11 Arbitrum USDC ceiling. Human-review and authorize it. Read its actual order/approval records and server expiry. Never extend an old policy or copy an old fingerprint.
4. Obtain separate approval to configure that one binding and enable production preparation. Any associated configuration redeployment requires owner approval. Leave demo disabled. If the order expires during deployment, stop; leave it unchanged and bind a newly reviewed proposal instead.
5. Obtain explicit permission before requesting **one** executable instruction set. This consumes the approval even if provider quoting subsequently fails; there is no automatic retry or second purchase. A retry requires a fresh proposal, human authorization and configuration review.
6. Inspect the signed executable quote, exact source USDC amount, Base output, token contract, deposit address, calldata, transaction-specific gas, balances, all deadlines, fixed refund address, fees and risks. No representative transfer estimate substitutes for that exact transaction. Re-read balances/gas after their short validity window.
7. Stop for separate authorization of the specific funded transaction. The owner's selected Rabby account retains signing control. No token allowance is needed for the supported direct ERC-20 `transfer` deposit. Wrong tokens/networks, late deposits, provider fees, refund delays and spent gas can cause nonrecoverable loss.
8. After an explicitly approved transfer, check confirmed source calldata/log, associated provider success, canonical Base native-USDC receipt, 12 confirmations and finalized-block coverage, one durable entitlement, exact artifact, signed Passport and independent verification with public explorer evidence. Until then mainnet settlement stays unverified.

Removing/expiring the trial binding or disabling the feature flag blocks new preparation. It cannot revoke or reverse a blockchain transfer. Existing instructions must not be funded after quote or approval expiry; reconciliation remains available to investigate any existing deposit.

## Local verification

`tests/live-trial.test.ts` exercises the real services and temporary PostgreSQL/PGlite SQL with mocked provider quotes and chain observations. It makes no external provider calls and moves no funds. Coverage includes correct preparation, every binding/route mismatch, missing/invalid/expired configuration, human approval expiry/reuse, demo/disabled gates, direct service and agent access, concurrent consumption, idempotency rollback, provider failure and reconciliation through entitlement/Passport issuance after preparation is disabled. These local concurrency tests are not a new real-Neon row-lock run.

The production release checker rejects an enabled flag with missing/malformed/expired trial configuration. It does not replace read-only comparison against the actual hosted order/approval or the separately required exact transaction preflight.

Completed local checks on 13 November 2026: **201 unit/persistence tests passed**, including **51 focused trial cases**; **8 Playwright journeys passed** against an isolated production build with payments disabled; typecheck, lint and the Node 22 production build passed. The sandbox build initially failed to obtain TypeScript subprocess configuration; the outside-sandbox retry completed. Both private release configuration checks passed with live deposits disabled. Secret scanning of source, Git history and public bundles found **0 findings across 175 inputs**. Existing frontend/wallet improvements are included in those working-tree regression counts and remain uncommitted. No hosted deployment or funded transaction is implied.
