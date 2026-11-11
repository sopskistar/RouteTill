# 80-second demo

Format: caption-led product walkthrough with restrained title motion, genuine app recordings and actual independent CLI results. 1920×1080 at 30 fps. Silent by design; no unlicensed music or invented narration. Editable source: `video/src/index.tsx`; capture source: `scripts/capture-demo.mjs`. Final output: `video/output/routetill-demo.mp4`.

| Time | Actual visual | Caption / optional narration |
|---|---|---|
| 0–6 | Original RouteTill title | “A payment isn’t a purchase proof. Did the intended merchant receive it? Were the approved digital bytes delivered?” |
| 6–20 | Real checkout, proposal and explicit human authorization | “One precise purchase. One human approval. Merchant, product, route, limit, expiry and digest are pinned.” |
| 20–34 | Authenticated live 1Click dry quote and verified signature | “A genuine NEAR Intents quote. No funds moved. The backend checks the signature and source cap.” |
| 34–54 | Separate isolated synthetic Break-It Lab order, all five attacks | “Now try to break it. Substitution, overpricing and reuse are blocked. Twenty notifications produce one durable entitlement.” |
| 54–68 | Actual synthetic Passport, browser integrity pass/fail and export | “The Passport carries its evidence and its limits. A modified recipient invalidates the signature.” |
| 68–74 | Visual presentation of actual CLI JSON results | “Verify outside the frontend: original PASS, tampered FAIL. Synthetic fixture; mainnet settlement UNVERIFIED.” |
| 74–80 | Brand close and concrete NEAR role | “NEAR Intents routes the cross-chain payment. RouteTill binds it to the approved purchase and digital delivery.” |

The quote preview and settlement challenge are separate orders and clearly labeled throughout. Playback is paced for readability. No funded transaction, live settlement or autonomous spending is fabricated.

The capture also saves the original/tampered exports, downloaded product, development public key and real CLI outputs under `artifacts/demo-video/`. These artifacts are local; never treat the bundled development key as an independent production trust anchor.

## Live demonstration fallback

If quote service access fails, show the timestamped original live evidence file and explain it is a recorded dry quote. Do not mark a failed request successful. The no-funds backend challenges remain runnable without the API credential. If any challenge fails, report the actual error and stop that demonstration.

## X draft for owner review

An agent can pay for something without proving it bought the approved product from the intended merchant.

Built RouteTill at NEAR HACKATHON: a human-approved purchase, NEAR Intents cross-chain payment path, exactly-once digital entitlement and a checkable Purchase Passport.

Try Break-It Lab: change the recipient, raise the price, replay 20 notifications, or tamper with the receipt.

Demo includes a live signed dry quote and explicitly synthetic settlement tests. Mainnet settlement is still UNVERIFIED.

Source: https://github.com/sopskistar/RouteTill

@NEARProtocol #NEARHackathon

Attach the verified final MP4 (or real screenshots) and the eventual owner-approved demo link. The owner publishes the post and supplies its public URL; no posting or submission has been performed.
