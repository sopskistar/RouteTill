# Final video verification

File: `video/output/routetill-demo.mp4` (generated local artifact, not Git-tracked).

- Actual duration: **80.000 seconds**.
- Video: **H.264, 1920×1080, 30 fps, yuv420p**.
- Size: **4,029,369 bytes**.
- SHA-256: `a06c6500e522f87a1026b067f8ae69ac8bc62c8d780d39e44efe0f43168b5e0a`.
- No audio track: caption-led, no unlicensed music or speech.

Remotion Studio was opened and captured before the final composition was authored. Four proof frames were rendered and inspected. The final MP4 was decoded with FFmpeg and sampled at the introduction, live quote, replay result, tamper rejection and close. The quote crop was corrected, re-rendered, and checked in the final encoded file so the actual 10.105377 USDC dry-quote amount is visible.

All four product clips are genuine Playwright recordings. The live dry quote and separate synthetic settlement order are labeled. The verifier scene reads actual original/tampered CLI JSON results captured from the signed export and real downloaded bytes. No mainnet settlement, transaction or autonomous spend is represented as having occurred.

Editable source: `video/src/index.tsx`; footage generator: `scripts/capture-demo.mjs`; companion captions: `video/captions.srt`; storyboard, optional narration and X draft: [DEMO_SCRIPT.md](DEMO_SCRIPT.md). The shared installed Remotion runtime was reused without modifying its existing project sources. No publication or X post has occurred.
