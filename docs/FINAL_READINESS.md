# Final README, media and submission readiness — November 14, 2026

This is a **pre-release validation snapshot**, not a professional penetration test. The owner subsequently approved committing, pushing and deploying this 12-file pass on November 14. Local/release-pending statuses below describe the verification stage; post-deployment results are recorded separately in `artifacts/final-media-release/`. Source base: `50009f58badaf6861b69eaca0d378f0cb08b778e` (the owner's newer README-only commit). The fresh public clone used `1ca934111ce3696a7949b89bc8bd3c98d0fcb1b1`; setup commands and application code are identical between those two commits. The reviewable player changes were then copied into that isolated clone for build and playback checks. No production credentials were copied into it.

## Readiness table

| Requirement | Status | Evidence | Remaining action |
| --- | --- | --- | --- |
| Exact approved final film, unchanged | **PASSED NOW** | [Original-file provenance](FINAL_VIDEO.md): 124s, 1920×1080, 30 fps, 14,862,383 bytes; source/hosted SHA-256 match | None; do not replace it with an older cut |
| Public original hosting | **PASSED NOW** | [Public GitHub MP4](https://github.com/sopskistar/RouteTill/releases/download/judge-demo-final-2026-11-14/RouteTill_Judge_Demo_Final_Updated_Frontend.mp4); downloaded without credentials; GitHub asset digest agrees | Keep the asset available |
| Optional original-quality website player | **PASSED NOW, LOCAL** | Production build: real public MP4 playback and seeking; 1920×1080, 124s; standard controls, no autoplay; mobile no overflow; axe zero | Approve release of the local integration |
| Existing guided demo behavior | **PASSED NOW** | Three existing Playwright journeys: manual/automatic progression, typed fields, reduced motion, keyboard and slow initialization; all passed | None before release |
| Public guest purchase and delivery | **PASSED NOW** | Fresh hosted session: product → exact terms → human approval → simulated payment → FULFILLED → actual 1,613-byte file → matching approved digest → signed demo Passport | No wallet, owner code or registration required |
| Retry and download access protection | **PASSED NOW** | A further replay retained the same entitlement ID and count 1; anonymous access 401, another guest 403, guest administration 403, demo session against production 401 | Preserve these boundaries |
| Five hosted Lab checks | **PASSED NOW** | Recipient substitution, spending limit and approval reuse rejected; 20 notifications, 15 concurrent, produced one entitlement; Passport/file tampering rejected | None |
| Deterministic example agent | **PASSED NOW** | Fresh-clone browser journey: qualifying proposal; token approval/product writes denied; human approval; simulated fulfillment; entitled bytes verified; seven-case plan retrieved | It is not an LLM or a wallet signer |
| Historical real purchase | **PASSED NOW** | Read-only production query: FULFILLED, one attempt, one entitlement, one Passport; stored 1,613 bytes match approved/committed digest | No new payment required or authorized |
| Independent historical settlement/Passport verification | **PASSED NOW** | 12/12 standalone checks passed using fresh Base/Arbitrum RPC observations; native Base USDC, approved merchant, exact 10 USDC and finality checked; public original integrity/file pass, tampered copy fails | RPC trust and provider association remain explicit limits |
| Actual fresh-clone setup | **PASSED NOW** | Public Git clone, Node 22.23.1/npm 10.9.8, `npm ci`, copy `.env.example`, `npm run seed`, start app on documented alternate origin; two existing guest/agent journeys passed | No private service credentials needed for no-funds setup |
| Offline verification and tamper reproduction | **PASSED NOW** | Seeded Passport: integrity PASS, mainnet UNVERIFIED as expected; changed Passport and changed file each exited 1 | Do not describe synthetic integrity as mainnet settlement |
| Typecheck, targeted lint and production build | **PASSED NOW** | Isolated integration build passed; no new dependency | Release only reviewed changes |
| Secret scan | **PASSED NOW** | 223 source/history/current built-bundle inputs, zero findings; configured private values compared only in memory | Preserve ignored secrets |
| Public repository | **PASSED NOW** | GitHub reports `private: false`; public HTTPS clone succeeded | Keep public through judging |
| Dependency audit | **PASSED NOW** | Fresh `npm ci`: 549 packages installed, 556 audited, zero vulnerabilities | No package upgrades introduced |
| Full unit/integration and wider browser campaign | **PREVIOUSLY VERIFIED** | November 14 communication pass at `1db3a4200ebbda56470ea6186cf3af6571b8b66a`: 224 tests, 12 browser journeys; [dated report](COMMUNICATION_REVIEW.md) | Not rerun wholesale for a media/documentation change |
| Baseline, attribution, license and current boundaries | **PASSED NOW** | README retains initial baseline/diff, tools/licenses, deterministic agent, one recorded route, no-funds data, protected downloads and disabled general live preparation | Keep repo public through judging; demos through Nov 18, ideally Nov 25; no uptime guarantee |
| Current hosted configuration | **PASSED NOW** | Both deployments READY on `50009f5`; live payments false, trial binding absent; configuration fingerprints and distinct signing identities unchanged | No payment-setting changes authorized |
| Submission receipt/history | **UNAVAILABLE** | Available local artifacts searched; the only JSON request log found was provider authentication, not an organizer receipt. This does not establish whether the form was submitted elsewhere | Owner checks existing organizer records; use Request changes for corrections |
| Public X post / Demo post URL | **WAITING FOR OWNER** | [279-character X draft](SUBMISSION.md), final original MP4 available for attachment | Owner publishes with required tags/media and supplies the public X post URL |
| Personal form data and consent | **WAITING FOR OWNER** | [Copy-ready non-personal draft](SUBMISSION.md), `idea` exactly **1,728 characters** | Owner enters actual identity, team size, NEAR payout account and consent; no payload invented |
| Second-project disclosure | **WAITING IF APPLICABLE** | Conditional SilentSourcing language preserved; no submission status inferred | If actually submitting both, confirm independence and reciprocal disclosure |
| README/player release | **WAITING FOR OWNER APPROVAL** | Working diff includes final links, public thumbnail, documentation and narrowly scoped media CSP | Approve commit/push/deploy to the two existing projects |

## Verification detail and artifacts

Current results are saved under ignored `artifacts/final-readiness/`: original fingerprint/probe/hosted comparison, fresh install/seed/browser/verifier logs, hosted buyer/Lab and permission results, fresh standalone chain result, player playback/CSP/mobile screenshots, integration typecheck/build/lint and secret-scan logs. Older reports and immutable mainnet evidence were not rewritten to appear current.

The source file was decoded without reported errors and inspected through representative frames/captions. The updated homepage appears. No material implementation contradiction was found in that review. The owner-approved MP4, including its audio/captions, was not edited. The public asset was uploaded as original bytes; no large video was added to ordinary Git history.

The current mainnet evidence describes **one** recorded purchase. Exactly-once means entitlement issuance, not one allowed HTTP download. Artifact hashing checks agreed bytes, not quality. A Passport signature authenticates the issuer record; independent RPC observations and the provider's routing association have separate trust roles.

## Concurrent README preservation

During this work the owner published `50009f5`, which streamlined the README. The local branch was safely fast-forwarded with an automatic safety stash and explicit backups. The owner's **Why RouteTill**, concise baseline and **Current scope** sections were retained alongside the newly requested exact opening, final-video links and judge-first order. Conditional second-project and hosting-availability statements were retained because their requirements remain applicable. No unrelated source file changed during reconciliation.

## Official requirements and owner actions

The [live HACKATHON.md](https://nearhackathon.com/HACKATHON.md) was read for this pass. The README now supplies a concrete problem/product/NEAR explanation, genuine screenshots, distinct public experiences, DO → SEE steps, exact reproduction, real evidence, baseline/diff and third-party/MIT attribution. A final media link is now available rather than invented.

The form's Demo post link is the owner's **public X post**, not the application, GitHub asset or local MP4. The post must state it was built at NEAR HACKATHON, tag **@NEARProtocol** and **#NEARHackathon**, and attach media. Tracks supported by the implementation are Real-World Money (strongest), AI Security & Defense, and Agent Economy; final selection belongs to the owner.

Do not submit merely because a local receipt was not found. If the project is not already submitted, the owner completes the form before **November 14, 2026, 23:59 UTC**. If already submitted and anything needs correction, use [Request changes](https://nearhackathon.com/request-changes), not a duplicate application. No social post or application was sent by this pass.

Technical evidence and media hosting had no unresolved blocker at review. The owner has approved the code/documentation release; automatic deployment and live checks follow this snapshot. Owner-controlled X publication and submission actions remain separate. The final original video is public independently of the code release.

## Reviewable changed files

- `README.md`
- `docs/DEMO_SCRIPT.md`
- `docs/FINAL_READINESS.md`
- `docs/FINAL_VIDEO.md`
- `docs/JUDGE_WALKTHROUGH.md`
- `docs/LIMITATIONS.md`
- `docs/SUBMISSION.md`
- `docs/VIDEO_HANDOFF.md`
- `next.config.ts`
- `public/demo/final-demo-thumbnail.jpg`
- `src/components/guided-demo.tsx`
- `src/core/demo-video.ts`
