# RouteTill demo source

Original caption-led 80-second product walkthrough. Actual app recordings show an approved purchase, genuine authenticated dry quote, a separate isolated synthetic replay order, and Passport verification. No real settlement is implied. No music, paid imagery, unlicensed audio or invented terminal output.

The local build reuses the already-installed `~/hackathon-video-studio/node_modules` through an ignored local symlink. Runtime dependencies are declared here for portability. On a clean machine run `npm install` in this directory, then `npm run studio` or `npm run render`.

Capture first from the running RouteTill app with `node scripts/capture-demo.mjs` at the repository root (requires configured authenticated dry-quote credential). Recordings and the actual CLI outputs are saved under ignored local artifacts and `video/public/`. Capture source is editable and does not touch the shared video studio’s source files.

Original graphics and captions: MIT. Genuine app footage: this project. Manrope font: SIL OFL. No external audio. Original sample product: CC0. Remotion licensing applies to its renderer; check its current terms for your organization. Output: `video/output/routetill-demo.mp4`.
