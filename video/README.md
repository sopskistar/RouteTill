# RouteTill — Meet John narrated demonstration

The review cut is 99.3 seconds, 1920×1080 at 30 fps, with H.264 video, AAC narration and burned-in sentence-aligned captions. It follows the exact five homepage scenes, enforced by `tests/story.test.ts`. The video is **not published**; the owner must approve it first.

Review output: `output/routetill-guided-product-review.mp4`. Previous narrated review: `output/routetill-meet-john-narrated-review.mp4` and `output/routetill-meet-john-narrated-review-v1-backup.mp4`, preserved. Original silent fallback: `output/routetill-demo.mp4`, preserved unchanged. The fallback covers earlier simulated evidence.

## Editable source

- `src/index.tsx`: seven authored scenes, including five approved John chapters, Lab and closing.
- `narration-script.json`: approved editorial story plus revised voiceover for owner review; first five editorial name/title/body entries match `../src/core/john-story.ts`.
- `timeline.json`: timing and sentence caption boundaries.
- `captions-narrated.srt`: caption sidecar.
- `capture-timing.json`: historical first-cut clip timing, retained as evidence; the revised typing clip uses 150 deterministic browser frames at 10 fps.
- [Storyboard and evidence boundaries](../docs/DEMO_SCRIPT.md), [asset and voice licenses](../docs/ASSET_LICENSES.md).

## Reproduce locally

Install the root project first, then:

```sh
npm ci --prefix video
node video/prepare-assets.mjs
```

Generate narration in an isolated Python environment using `requirements-narration.txt` and the public-domain-dataset Piper `en_US-ljspeech-high` model. Model and config URLs are:

- https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/ljspeech/high/en_US-ljspeech-high.onnx
- https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/ljspeech/high/en_US-ljspeech-high.onnx.json

`generate-narration.py` expects the tool environment at `../artifacts/final-package/voice-env/` and model at `../artifacts/final-package/voice-model/`. Run it from the repository root. It produces new `narration-v2/` WAV files, timing metadata and synchronized captions. No hosted TTS credential, payment or owner voice sample is used.

Capture only no-funds walkthrough actions and existing public evidence; never create another funded purchase for a recording. The final assets under `public/product-captures/` are genuine app browser captures. Approval is a labeled demo reenactment; the real Passport is a current recorded view of the original purchase. The revision uses readable evidence cards sourced from the committed mainnet manifest and actual public production receipt, hash and signature panels. No fabricated explorer screenshot is used. Deterministic browser frames capture the labeled typing reenactment with a paused presentation clock; no server authorization clock is changed.

```sh
npm --prefix video run studio
npm --prefix video run render:narrated
```

Generated narration, capture media and output MP4s are ignored to preserve the owner’s publication approval. The app’s original John/background assets are public; copying them here adds no runtime dependency. Remotion’s free-license eligibility depends on the actual team/company. Piper is a separate GPL tool; narration uses the public-domain LJ Speech dataset. No paid service or license was purchased.
