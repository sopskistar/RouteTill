# Approved final demonstration — original-file provenance

The owner selected **RouteTill_Judge_Demo_Final_Updated_Frontend.mp4**. Older cuts are historical backups and are not the selected film.

- [Watch/download the final demo — original MP4](https://github.com/sopskistar/RouteTill/releases/download/judge-demo-final-2026-11-14/RouteTill_Judge_Demo_Final_Updated_Frontend.mp4)
- [Public GitHub media release and checksum file](https://github.com/sopskistar/RouteTill/releases/tag/judge-demo-final-2026-11-14)
- [Separate interactive guided walkthrough](https://routetill.vercel.app/demo)
- [Separate hands-on no-funds checkout](https://routetill-demo.vercel.app/checkout/purchase-vectors?mode=demo)
- [Historical mainnet Purchase Passport](https://routetill.vercel.app/passport/655d4cc9-0eaf-41b7-a7bf-05fc73286eea?mode=live)

## Preservation and public hosting

| Property | Observed source and hosted original |
| --- | --- |
| Size | **14,862,383 bytes** |
| SHA-256 | `294ce432904abb0441e7c939c805d42f78db25b921821b34ade1bb7c14d457c7` |
| Duration | **124.000 seconds (2:04)** |
| Video | H.264, **1920 × 1080**, **30/1 fps**, 755,437 bits/s |
| Audio | AAC, stereo, 48,000 Hz, 194,488 bits/s |
| Container bitrate | 958,863 bits/s |
| Captions | English text burned into the approved pictures; no separate selectable subtitle stream |
| Hosting | Public GitHub Release asset, `video/mp4`; original bytes outside ordinary Git history |
| Public verification | Unauthenticated full download matched the source size and SHA-256; GitHub’s asset digest also matched |

The source MP4 was read for hashing, FFprobe metadata, full decode validation and separate inspection images. It was **not compressed, resized, trimmed, re-encoded, regenerated or overwritten**. No streaming rendition was generated. A separate JPEG thumbnail was extracted at 22 seconds; this does not modify the MP4. The owner’s local source remains `video/output/RouteTill_Judge_Demo_Final_Updated_Frontend.mp4`.

The media release references the already published application commit `1ca934111ce3696a7949b89bc8bd3c98d0fcb1b1`; it is a media-hosting tag, not a declaration that general live checkout is enabled. GitHub Releases access was already available; no paid hosting was purchased. See [GitHub asset documentation](https://docs.github.com/en/rest/releases/assets).

## Inspection and factual boundaries

Representative frames and burned-in captions across the selected film were inspected. The updated “Your agent proposes the purchase. You stay in control.” homepage is visible. The film labels the prototype agent as fixed-rules/proposal-only, the checkout as a guided no-funds reenactment, the Lab as controlled/no-funds, and the financial proof as the recorded November 13, 2026 purchase.

The inspected evidence shows the recorded Arbitrum funding, exact 10 Base USDC merchant receipt, matching 1,613-byte artifact, one entitlement and signed Passport. Its caption distinguishes twelve standalone checks from the browser’s signature/fingerprint checks. It explicitly permits repeat authorized downloads and separates signature integrity from independently checked chain receipts. No material contradiction with these implementation boundaries was identified in the sampled frames/captions. This is not a claim that the footage records a new live payment or that agent discovery used an LLM. The narrated character remains an illustrative buyer, not a claimed external customer.

The MP4 includes earlier interface details in its recorded walkthrough, but its updated homepage and financial claims agree with the current implementation. The approved film was not edited to replace those recordings. Full media decoding reported no errors. Inspection did not regenerate or alter narration, audio levels or captions.

## Reproduce the hosted-original comparison

```sh
curl --fail --location \
  --output /tmp/RouteTill_Judge_Demo_Final_Updated_Frontend.mp4 \
  https://github.com/sopskistar/RouteTill/releases/download/judge-demo-final-2026-11-14/RouteTill_Judge_Demo_Final_Updated_Frontend.mp4
sha256sum /tmp/RouteTill_Judge_Demo_Final_Updated_Frontend.mp4
```

Expected SHA-256: `294ce432904abb0441e7c939c805d42f78db25b921821b34ade1bb7c14d457c7`. This download needs no repository-owner credentials. GitHub may redirect to a temporary signed asset URL; use the stable URL above. Availability depends on the hosting service; no future uptime guarantee is claimed.

The website player uses standard controls, `preload="none"`, no autoplay and the original MP4 URL. Its media-only CSP allowance covers the repository release path and GitHub’s release-asset host; script, connection, framing and payment restrictions are preserved. Website integration passed local production-build playback checks before release; the owner subsequently approved its deployment. The post-release checks are recorded separately.

This hosting action is neither an X post nor a hackathon application. The owner publishes the X demo post and supplies its URL for the submission’s Demo post field.
