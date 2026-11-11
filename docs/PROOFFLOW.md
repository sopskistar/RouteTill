# ProofFlow

## Approved purchase

The canonical policy contains merchant identity/name and recipient; product identity/name and expected artifact SHA-256; source and destination asset/chain; destination token/amount; maximum source amount; refund/source address; expiry; mode; and a random single-use authorization ID. SHA-256 over sorted-key canonical JSON is the fingerprint. Financial amounts are positive integer atomic-unit strings. The human approves this exact fingerprint through an authenticated browser session. An API token cannot approve it.

Execution rejects changed recipients, merchant/product, asset/route, price, cap, refund address, digest, fingerprint and expired approvals. The approval is locked and consumed in the same transaction as unique attempt creation. Fresh executable quotes must satisfy both provider signature validation and policy checks. The approval grants no wallet signing access.

## Settlement gate

Provider-reported success is insufficient. For the selected Arbitrum USDC → Base USDC route, the source transaction must contain the exact USDC transfer from the approved source/refund address to the original deposit address. Destination verification checks chain 8453, native USDC contract, successful receipt, canonical block hash, one unambiguous matching transfer to the intended merchant, sufficient amount, at least 12 confirmations, and a block no newer than the RPC’s finalized head.

The stored provider quote must match the original quote-specific attempt and supply exactly one destination transaction reference. The `(chain,transaction,log)` cannot be assigned to a second attempt. Missing or ambiguous evidence stays UNVERIFIED and blocks delivery. The provider status association is a provider assertion, not a cryptographic causal proof.

## Delivery gate

The approved artifact digest is checked against current stored bytes before entitlement issuance. One PostgreSQL transaction records the qualifying transfer, creates one entitlement, emits its fulfillment event, marks the order fulfilled and enqueues Passport issuance. An entitled buyer, their agent, or the merchant retrieves the actual UTF-8 file. The endpoint rechecks its SHA-256 before serving it.

## Purchase Passport v1

The JSON envelope contains `payload` and an Ed25519 `signature` with issuer public key and key fingerprint. Payload fields include schema, mode, public order ID, original approved terms/hash, quote evidence, source/destination references, original provider evidence, settlement observations/level, fulfillment/entitlement/event references, artifact digest, timestamps and limitations.

`SYNTHETIC_ONLY` means no chain payment is represented. `INDEPENDENT_RPC_OBSERVATION` means the application observed matching chain evidence; readers must re-query their own trusted RPC. A stored receipt cannot establish chain membership or finality by itself.

The offline verifier requires a separately trusted key and actual artifact bytes. A synthetic export can pass integrity while settlement remains UNVERIFIED. A live export without current independent chain facts exits 2 with settlement UNVERIFIED. Tampering, missing key pinning or missing artifact bytes exits 1. See [judge walkthrough](JUDGE_WALKTHROUGH.md).

## Break-It Lab

Each protected judge session creates its own merchant and prepared purchase in the demo database. The five challenges invoke the actual policy/approval functions, receipt validator, PostgreSQL fulfillment transaction and verifier. Replay sends five sequential and fifteen concurrent callbacks, with duplicate event identifiers. The UI reports a SQL entitlement count for the order. Reset creates a new isolated order and retains the audit trail.
