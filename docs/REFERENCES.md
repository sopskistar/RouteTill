# Sources and attribution

Read 11 November 2026. Public documentation was inspected; competitor payment flows/test suites were not run. This is a brief scope comparison, not a market audit or uniqueness claim.

| Primary source | Documented overlap / implication |
|---|---|
| [Coldtill docs](https://coldtill.com/docs/) | Merchant API, hosted checkout, webhooks, conversion and operations are established payment features. |
| [Weave NEAR Intents](https://docs.paywithweave.com/near-intents) | Deposit-address cross-chain checkout, unified orders and merchant notifications. |
| [Aurora Intents React Widget](https://docs.near-intents.org/integration/devkit/react-widget) | Reusable swap/checkout integration; a widget alone is not RouteTill’s differentiator. |
| [Penstock source/docs](https://github.com/ace-coderr/penstock) | Agent-readable API/MCP payments, Intents settlement, receipts and explicitly labeled simulation/live paths. |

RouteTill focuses on the joined purchase authorization, independently qualified merchant credit, exact downloadable artifact and replayable adversarial tests. No claim is made that another project lacks every part of that lifecycle.

## Official integration and event sources

- [Hackathon instructions](https://nearhackathon.com/HACKATHON.md): deadline, human confirmation, public repo and X demo requirements. Read before implementation and again before final documentation/submission preparation.
- [1Click docs](https://docs.near-intents.org/), [signature SDK source](https://github.com/defuse-protocol/one-click-sdk-typescript), [live catalog](https://1click.chaindefuser.com/v0/tokens).
- Installed Next.js 16 docs under `node_modules/next/dist/docs` were consulted for route handlers, metadata and request conventions.

## Design and tools

[21st](https://21st.dev), [Magic UI terminal](https://magicui.design/docs/components/terminal), [60fps](https://60fps.design) informed component discoverability, sequential evidence feedback and restrained state motion. No proprietary component, full design, screenshot or brand was copied. RouteTill’s symbol, layouts and UI were authored for this project.

Installed skills applied: Premium UI Design, Hallmark, Impeccable, UI UX Pro Max, Brand Identity Studio, Frontend Motion Design, Frontend Visual QA, Hackathon Video Studio and Remotion guidance. Shared creative/video workspaces supply existing tools and reference conventions, not fabricated proof.

Software uses the repository’s MIT license. Next.js/React/Tailwind/viem/Vitest/Playwright are attributed dependencies; exact versions and transitive licenses are in `package-lock.json` and installed package licenses. Lucide icons: ISC. Manrope: SIL OFL via Fontsource. The official NEAR quote-signature SDK is used under its package license. Original sample product text is dedicated under CC0-1.0. Demo-video licensing is documented with its editable source; no purchased asset or unlicensed audio is required.

## Release integration references

- [AP2 specification](https://ap2-protocol.org/ap2/specification/) and [payment mandate](https://ap2-protocol.org/ap2/payment_mandate/): existing authorization mandates and linked receipts; RouteTill makes no invention or compatibility claim.
- [Rabby integration](https://rabby.io/docs/integrating-rabby-wallet), [EIP-6963](https://eips.ethereum.org/EIPS/eip-6963), [WalletConnect Universal Provider](https://github.com/WalletConnect/walletconnect-monorepo/tree/v2.0/providers/universal-provider), [viem](https://viem.sh/docs/clients/wallet).
- [Circle native USDC contracts](https://developers.circle.com/stablecoins/usdc-contract-addresses): Arbitrum and Base contract allowlist; chain IDs and six-decimal precision are also checked through RPC.
- [Neon Vercel integration](https://neon.com/docs/guides/vercel-managed-integration), [Vercel native integration naming](https://vercel.com/docs/integrations/install-an-integration/product-integration), [Hobby cron limits](https://vercel.com/docs/cron-jobs/usage-and-pricing).
