# RouteTill

<!-- impeccable:product-schema 1 -->

## Platform
web

## Stack
User-selected Next.js, TypeScript, Tailwind, PostgreSQL/Neon, Vitest, Playwright, Vercel.

## Users
Merchants selling digital products; customers approving precise purchases; deterministic agent clients proposing purchases; hackathon judges testing security without funds.

## Product Purpose
Agent-assisted cross-chain checkout with human approval and verified digital delivery. The agent proposes. You authorize. RouteTill verifies payment and delivery. See [canonical positioning](docs/POSITIONING.md).

## Positioning
The differentiator is the evidence-backed lifecycle and executable adversarial challenge. Hosted checkout, quote integration, webhooks, and agent-readable APIs are established capabilities, not uniqueness claims.

## Operating Context
Agent proposal → human approval → quote-specific deposit → provider reconciliation → destination-chain checks → transactional entitlement → exported evidence. A separate synthetic judge environment must never authorize a live payment.

## Capabilities and Constraints
Enforce immutable merchant, recipient, product, artifact digest, route, amount cap, expiration, and single-use approval. Exact integer amounts. No signing or funds movement without owner approval. No publishing, pushing, or submission without owner approval. One recorded mainnet purchase is FULFILLED with independent receipt and artifact checks. General live preparation remains disabled; the exact-order guard is preserved. Production and demo use isolated Neon resources and distinct issuer identities. John is illustrative; the example agent is deterministic.

## Brand Commitments
RouteTill. Precise, candid fintech language. Original icon and wordmark, light/dark support, accessible typography and restrained motion. Purchase Passport and Break-It Lab are the centerpieces.

## Evidence on Hand
Committed November 13 mainnet evidence records exactly 10 Base USDC, one durable entitlement, a matching 1,613-byte artifact and one signed Passport with twelve standalone checks. This is one purchase, not an adoption metric. See docs/evidence/mainnet-655d4cc9-0eaf-41b7-a7bf-05fc73286eea/.

## Product Principles
- Fail closed when settlement evidence is missing.
- Explain application assertions separately from independently checked chain facts.
- Make the actual security logic testable by judges.
- Preserve digital bytes and check their SHA-256 digest.

## Accessibility & Inclusion
Keyboard navigation, visible focus, reduced motion, readable contrast, responsive desktop/tablet/mobile flows.
