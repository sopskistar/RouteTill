# Guided judge demonstration and revised film — November 14, 2026

This release separates four tasks: **Watch the demo** (`/demo`), **Try buyer checkout** (the existing no-funds guest checkout), **Run 5 security checks** (`/lab`) and **View real payment proof** (the original production Passport). Seller administration remains protected. The homepage story and film retain the approved five John scenes; the new guided surface shows those scenes through product actions.

## What changed

- `/demo` is a client-only presentation sequence with play, pause, replay, previous/next, stage selection, progress, keyboard navigation and reduced-motion alternatives. It never creates an order, calls execution endpoints or requests a wallet signature.
- It reuses RouteTill's ProductCover, Badge, Hash, typography, form styling and original John. The typed cap/refund inputs are explicitly a guided reenactment, not an alternate editable purchase policy. The existing hands-on guest policy, its fixed terms and all server guards are unchanged.
- John visibly enters 11 USDC and the demonstration refund address. The seller's 10 USDC price never changes. Agent proposal is distinct from human authorization. Payment simulation is separately labeled from the genuine November 13 source transfer and Base receipt.
- The Passport's decorative rotation and excessive headline tracking were removed. The existing Manrope font, navy/coral palette and workspace image remain. Playback controls sit above the scene rather than obscuring forms on mobile.
- Original mainnet evidence files, financial services, authorization, reconciliation, issuer identities, rate limits and database configuration were not modified.

## Executed checks

- 224 unit/integration tests passed. The story test preserves the exact first-five name/title/body entries across homepage, video script and timeline; revised voiceover is separate editorial narration.
- Three targeted browser journeys passed together: manual guided controls/typing/keyboard/reduced motion; automatic completion of all five scenes; and fresh no-code guest checkout → approval → simulated fulfillment → downloaded hash → original/tampered Passport.
- The playback test asserts zero mutating API requests. It caught a timer delta captured through mutable state; the delta is now calculated before the state updater. Full-stage progression and final stop have a regression check.
- Typecheck and lint passed. Production build and deployment outcomes are verified before release.
- Actual screenshots were checked at 1440, 1280, 768, 390 and 360 pixels. No horizontal overflow in ten home/guided viewport states. Four axe scans across desktop/mobile returned zero violations. Light/dark and reduced motion were inspected; no uncaught browser errors were recorded.
- Hallmark's per-TSX source sweep does not resolve global CSS and reported missing focus/active/disabled styles. Those styles already exist in `globals.css`; browser checks and visual review confirm they apply. The render tier could not locate its optional puppeteer-core package; Playwright supplied actual rendering/capture instead. No redundant browser dependency was installed.

The screenshots in `docs/screenshots/guided-demo-{desktop,mobile}.png` and updated `home-hero-desktop.png` are actual isolated release-preview application captures. The latter replaces the earlier production screenshot described in the dated README review. Current public deployment checks are performed after the Git deployment, not inferred from these local images.

## Revised film and evidence provenance

New review MP4: `video/output/routetill-guided-product-review.mp4`, approximately 99.3 seconds, with professional-style offline narration and synchronized sentence captions. The earlier 91-second MP4 remains unchanged, with a second `-v1-backup.mp4` copy. Publication requires owner review.

The opening explains RouteTill within the first ten seconds. Original John is a guide alongside large application panels, not the focus of two long static story screens. Browser frames visibly type the cap and complete refund wallet; real isolated guest approval UI follows. A presentation-only paused browser clock makes the capture deterministic; no server policy clock, immutable expiry or approval is altered. Mainnet payment cards read the committed manifest and lead to actual production receipt panels. Actual file-hash and signature panels explain the Passport. The Lab segment shows a genuine completed hosted rejection and 20 → 1 outcome. No fake explorer or financial action is shown.

Caption timing, media existence, code/decode checks, frame readability and audio validation are required before delivery. Editable source and attribution are in [video/README.md](../video/README.md) and [ASSET_LICENSES.md](ASSET_LICENSES.md). No video, X post or submission is published by this release.

## Financial scope

The original order `655d4cc9-0eaf-41b7-a7bf-05fc73286eea` remains the only claimed funded demonstration. Its public evidence, buyer-only download boundary, exactly-one entitlement and independent verification are preserved. Both live-preparation flags stay false and trial bindings stay absent. General public live payment activation remains outside this presentation change.

## Final pre-deployment results

The final unit/integration rerun passed all 224 tests in nine files in 32.31 seconds, with unchanged test timeouts. A redundant run during simultaneous video rendering/building had setup-hook timeouts and was interrupted; the completed rerun supersedes it. Final lint and typecheck passed. The isolated-clone production build generated all 12 pages, including `/demo`. Source/history secret scan: 215 inputs, zero findings; a separate scan of the freshly compiled clone's public bundles also found zero issues.

The rendered MP4 is 99.349 seconds, 1920×1080 H.264 at 30 fps with AAC 48 kHz speech, 7,299,973 bytes. Full FFmpeg decode returned zero errors. Mean audio level was -21.7 dB, peak -2.8 dB, with no clipping. The contact-sheet review covers the full sequence and the closing frame; the typing, receipt and Passport frames were inspected at full size. Captions stay within each scene's audio/timing bounds. The earlier narrated MP4 and its backup remain the same size and are preserved.

Fresh read-only mainnet verification still reports FULFILLED, one 1,613-byte entitlement and one valid Passport with independent settlement observations. No financial state or signed evidence was changed. Public hosted verification is run after the approved Git integration deployment; the final report records those results separately.

## Hosted startup hardening

The first fast hosted check clicked a server-rendered scene button before its JavaScript initialized. A later network-idle inspection had no browser errors and confirmed the scene worked. Controls now render disabled until client initialization completes, with a short loading status, so slow connections cannot silently lose an initial click. No payment or backend request is introduced by readiness. Targeted playback/guest tests and the production build are rerun for this correction.

All three final guided tests passed after readiness hardening, including a deliberately blocked JavaScript load that verifies disabled SSR controls become usable once scripts are released. Manual navigation and complete automatic playback passed again without mutating API calls. The existing hands-on guest journey passed separately; readiness changes only the guided controls.
