# Meet John — narrated review video

Target: **91 seconds**, 1920×1080, 30 fps, spoken narration and sentence-aligned captions. Editable composition: `video/src/index.tsx`. Approved homepage story: `src/core/john-story.ts`. The first five entries in `video/narration-script.json` must match it exactly; a regression test enforces that.

| Time | Shared scene / headline | Actual visual and evidence boundary |
| --- | --- | --- |
| 0–10.5 | **Agent finds it — John needs a dataset.** | Original cartoon John in a developer workspace; agent discovery explicitly illustrated. |
| 10.5–21 | **No blank check — His money. His decision.** | Original character animation explains the boundary between one purchase and unrestricted spending. |
| 21–34 | **John says yes — One file. One approval.** | Actual application approval interface, recorded with no-funds demo data and labeled reenactment. Seller, price and 11 USDC cap visible; ETH gas additional. |
| 34–56 | **Payment verified — Paid on Arbitrum. Received on Base.** | Actual recorded Arbitrum/Base receipt JSON, NEAR Intents SUCCESS, exact source/output/refund facts. Explorer automation was blocked; no counterfeit explorer screen is used. Real explorer links remain available in the app and submission guide. |
| 56–71 | **File + proof — Delivered. With proof.** | Actual production Purchase Passport, entitlement/digest evidence, correct file verification and 12 independent checks. The private buyer order is not accessed by bypassing authentication. |
| 71–85 | **Break-It Lab — Five security checks. No real funds.** | Genuine hosted Lab backend outcomes, 20 notifications → one entitlement; no-funds label visible. |
| 85–91 | **RouteTill — One purchase. The proof to keep.** | John, the resource and Passport; production, public demo, source and concrete NEAR Intents role. |

## Approved five-scene narration

The narration uses the exact scene bodies in `src/core/john-story.ts`, not an alternate John storyline. The on-screen headlines and five navigation labels also match. Detailed token amounts and hashes appear in the payment-evidence scene rather than being read repeatedly.

The final two narration segments:

“Judges can also try five security checks. RouteTill rejects changed recipients, over-limit payments and reused approvals. Twenty notifications produce one entitlement. Tampered evidence fails verification.”

“John got the right file. The seller got paid. And RouteTill has the proof.”

## Review files and publication

- MP4: `video/output/routetill-meet-john-narrated-review.mp4`
- Captions: `video/captions-narrated.srt`
- Timing/scene metadata: `video/timeline.json`
- Original silent fallback: `video/output/routetill-demo.mp4` — preserved; earlier simulated evidence, not the final funded demonstration.
- [Asset and voice provenance](ASSET_LICENSES.md).

The owner must watch and approve the new video before uploading it. No public URL, X post or submission is claimed. The [submission copy](SUBMISSION.md) contains the X draft and owner-entered form guidance.
