# Communication pass — November 14, 2026

Prepared locally from `ceaa07a5fcce9eedf14e476cfd61376e74587399`. This report covers the communication pass, not an independent penetration test or human usability study. This is a **pre-release verification snapshot**: production and demo were separately checked at `cca1da522b14aadf5002d14839052c6608a2624c`, both READY. The owner subsequently approved committing, pushing and deploying this pass; release verification is recorded separately under ignored `artifacts/communication-release/`.

## What changed

- [Canonical positioning](POSITIONING.md), [product brief](../PRODUCT.md) and [brand guide](BRAND.md): agent-assisted cross-chain checkout; buyer and merchant in one purchase; John explicitly illustrative; deterministic example agent.
- Homepage, shared John scenes, guided demonstration, checkout, order, merchant workspace, Passport, developer page, footer and metadata/Open Graph: clear agent/human/provider/verifier roles; application authorization separate from personal wallet confirmation; simulation separate from historical mainnet proof.
- Compact five-step purchase overview and four connected protection mechanisms. Existing navy/coral workspace, illustrations, controls and motion preserved. No new runtime dependency.
- Passport explains issuer signature integrity, independent settlement observations and artifact matching separately. One entitlement means durable access, including authorized repeat downloads; a hash does not establish quality.
- Lab outcomes now explain why each backend rejection or constraint protects the approved purchase. Real handlers and demo permissions are unchanged.
- [README](../README.md), [judge walkthrough](JUDGE_WALKTHROUGH.md), [architecture](ARCHITECTURE.md), [limitations](LIMITATIONS.md), [submission draft](SUBMISSION.md): consistent claims, working routes and retained reproduction/baseline/license information.
- [Video handoff](VIDEO_HANDOFF.md): 30-second explanation, five existing scenes, verified source paths, essential screen moments and required reenactment labels. `DEMO_SCRIPT.md` points to the handoff and retains the older script as history. No video file, narration, captions or video source was edited, rendered or reviewed.

## Checks actually performed

| Check | Result / scope |
| --- | --- |
| Unit/integration | **224 passed**, nine files; existing policy, payment, persistence and verifier coverage |
| Playwright | **12 passed**, isolated local preview using `.env.example` and local PGlite; no private production configuration copied |
| Final persona disclosure | Existing John-story browser check rerun after the last explanatory text addition: **1 passed** |
| Browser coverage | Guided controls, typing, playback, slow initialization, reduced motion; guest proposal → human approval → simulated delivery → file hash → signed Passport/tamper detection; all five Lab checks; merchant/agent permission paths; mocked injected wallet discovery and ownership message |
| Typecheck / lint / production build | **PASS**; final build includes all 12 prerendered pages and the metadata image |
| Responsive screenshots | 1440, 1280, 768, 390 and 360px in light and dark themes: **no horizontal page overflow**; reviewed actual desktop/mobile renders |
| Accessibility | Four homepage size/theme states and the changed Passport: **zero axe WCAG A/AA violations**; browser journeys also exercise accessibility, focus and reduced motion |
| Hosted no-funds checkout | Fresh guest, no owner code: proposal, approval, simulated fulfillment, file matching and signed record **PASS** |
| Hosted Lab | All five **PASS**; 20 notifications, including 15 concurrent, produced **one stored entitlement** |
| Hosted permissions | Guest administration **403**; anonymous order/download **401**; another guest order/download **403**; demo session against production **401** |
| Genuine public Passport | Original signature and artifact matching **PASS**; altered recipient **rejected**, against the unchanged production key |
| Standalone mainnet verification | **12/12 PASS**, using fresh read-only Base/Arbitrum RPC observations; `INDEPENDENTLY_OBSERVED` settlement |
| Committed evidence | **12 checksum entries PASS**; approved artifact remains 1,613 bytes and the recorded digest matches |
| Submission copy | Supplied `idea` remains **1,728 characters**; revised X draft **249 raw characters**, with required tags and app/repository links; nothing posted |
| Local document links | All relative links in the changed product/judge documents checked; no missing destinations |
| Secret scan | **220 inputs, zero findings**, including Git history and the current production browser bundle |
| Public deployments | Both READY; health works; live payments **false**; trial binding absent; distinct public-key fingerprints unchanged |

An initial sandbox run could not initialize one PGlite test suite within its hook limit, and a sandbox build could not obtain TypeScript subprocess output. The same checks passed outside the sandbox; no authentication or database code was changed to compensate.

Current run artifacts are under ignored `artifacts/communication-pass/`, including `visual.json`, `passport-preview.json`, `hosted-buyer.json`, `hosted-state.json`, `independent-native.json`, screenshots and final build/lint logs. Previous audit reports remain unchanged. The website test no longer requires archived video editorial bodies to equal current website copy; homepage and guided demo still share one story source.

## Screenshots

- [Actual updated homepage desktop viewport](screenshots/home-hero-desktop.png)
- [Actual updated homepage mobile viewport](screenshots/communication-home-mobile.png)
- Additional full-page captures: `artifacts/communication-pass/screenshots/home-{light,dark}-{1440,1280,768,390,360}.png`.
- Guided approval/payment/Passport mobile and updated Passport desktop/mobile captures are in the same directory. The updated Passport preview displays the unmodified public production record/key; it does not create a payment or substitute simulated evidence.

## What a new visitor can learn

The agent proposes the merchant’s dataset. The human authorizes exact terms and separately confirms any wallet transfer. NEAR Intents supplies the authenticated cross-chain quote and execution. RouteTill independently checks the merchant receipt and matching file, then issues one durable entitlement and a signed linked record. John’s guided sequence and public checkout use no funds; the November 13 completed purchase is separate historical evidence.

## Preserved boundaries / remaining limits

Payment services, financial arithmetic, database schema, signing keys, immutable evidence and exact-order guard were not changed. No new funded purchase, approval consumption, transaction signing or production configuration mutation occurred. Only isolated guest demonstration purchases were exercised.

General public live payment activation remains disabled and needs a separately reviewed architecture. Public Passport and evidence are readable; actual order/download permissions remain protected. The standalone verifier depends on trusted RPC availability and independently pinning issuer identity. Signature integrity does not prove consensus or causal routing.

The owner approved this communication-only release on November 14. Its commit, automatic deployments and post-deployment checks are recorded in the release report, rather than retroactively changing the pre-release test observations above. Video publication and submission remain the owner’s responsibility; the handoff identifies the lack of original funded-wallet-confirmation footage and forbids presenting reenactment as that recording.

## Exact changed-file scope

Presentation source:

- `src/app/page.tsx`, `src/app/demo/page.tsx`, `src/app/docs/page.tsx`
- `src/app/layout.tsx`, `src/app/opengraph-image.tsx`, `src/app/globals.css`
- `src/components/home-experience.tsx`, `src/components/guided-demo.tsx`, `src/components/shell.tsx`
- `src/components/checkout.tsx`, `src/components/order.tsx`, `src/components/merchant.tsx`
- `src/components/lab.tsx`, `src/components/passport.tsx`
- `src/core/john-story.ts`, `src/core/positioning.ts`

Documentation and actual screenshots:

- `README.md`, `PRODUCT.md`
- `docs/POSITIONING.md`, `docs/BRAND.md`, `docs/ARCHITECTURE.md`, `docs/LIMITATIONS.md`
- `docs/JUDGE_WALKTHROUGH.md`, `docs/SUBMISSION.md`, `docs/DEMO_SCRIPT.md`, `docs/VIDEO_HANDOFF.md`
- `docs/COMMUNICATION_REVIEW.md`
- `docs/screenshots/home-hero-desktop.png`, `docs/screenshots/communication-home-mobile.png`

Existing checks adjusted for current copy:

- `tests/story.test.ts`, `tests/browser/journeys.spec.ts`, `tests/browser/public-buyer.spec.ts`
