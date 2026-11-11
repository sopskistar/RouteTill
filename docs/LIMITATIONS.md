# Current limits

- **Real mainnet settlement: UNVERIFIED.** A genuine authenticated signed dry quote has been recorded. No owner-approved source transfer or independent merchant receipt has been obtained.
- **Neon/hosted deployment: not verified.** No database credential was provided at initial inspection. Local persistence tests run PostgreSQL through PGlite. Production adapters/migrations are implemented; a configured Neon run and deployed browser/cron checks remain owner-dependent.
- One execution/verifier route: Arbitrum native USDC → Base native USDC. The live catalog is broader; discovery does not imply every asset has a RouteTill settlement verifier.
- Merchant ownership supports a standard EVM personal-message signature. Contract wallets requiring EIP-1271 are not supported. Wallet submission uses an injected EVM provider or manual exact deposit instructions.
- Digital products are UTF-8 text/Markdown up to 16 KB, stored transactionally. Hash verification proves bytes and entitlement access, not quality or off-platform delivery.
- Human approval is a server-authenticated account action. It is not a cryptographic buyer signature. The application and database operator remain trusted for their assertions and unique issuance history.
- Independent verification re-queries an RPC. It does not verify Ethereum consensus, a receipt inclusion proof or the provider’s causal routing association. Unsigned provider execution status is clearly identified as an assertion.
- The source cap covers the quoted input; wallet network gas is extra and unmeasured. A new execution quote can change within the approved cap. An expired or interrupted attempt requires a new purchase approval.
- Local PGlite is single-process and protected by a process lock. Multi-instance Vercel deployment requires distinct managed PostgreSQL stores, stable issuer key and a working durable scheduler.
- No automated merchant outbound webhook delivery, password reset/email verification, arbitrary binary file storage, regulatory/compliance certification, or automatic dispute resolution. Pending, incomplete, failed, refunded and disputed states do not imply successful delivery.
- The UI uses no third-party analytics; workspace operational counts provide privacy-conscious diagnostics. Physical-device and external-wallet signing QA remain separate from browser emulation.
- No public deployment, Git push, repository visibility change, X post or hackathon submission is authorized by preparing these files.
