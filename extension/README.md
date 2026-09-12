# BIPU Wallet browser extension — Demos 0–3

This is the unpacked Manifest V3 shell for the teaching-first Quai wallet.

## Install locally

1. Open `chrome://extensions` in Chrome/Chromium.
2. Enable Developer mode.
3. Choose **Load unpacked**.
4. Select this `extension/` directory.
5. Open the extension popup and choose **Open teaching panel**.

## Scope

This slice proves the extension architecture and moves Demos 0–3 into it:

- popup entry point
- persistent side panel
- MV3 service worker message bus
- shared schema-versioned local state
- narrow permissions
- live Demo 0 native QUAI observation through the service worker
- Demo 1 normalized asset inventory and recent token activity through QuaiScan
- Demos 2–3 deterministic operation explanation and pre-sign prediction
- Demo 4 provider-gated native QUAI transfer preparation and approval boundary
- Demo 5 bounded, evidence-labeled Ask Quai answers tied to observed context
- Demo 6 browser-local operation familiarity with explicit invalidation
- Demo 7 read-only NFT object inspection and current holder/indexer lookup
- Demo 8 local network-policy fixtures with visible exclusion reasons
- Demo 9 resettable local learner sandbox with quarantined red-team fixture

It deliberately has no page scraping, private-key handling, or silent signing. Unknown selectors and unsupported questions remain unknown. Cached familiarity never replaces live verification or authorizes signing. Holder records are not a social graph or contact permission. Network filters are not endorsement, safety, liquidity, or custody claims. Demo 9 does not mint, message, join a real network, or infer understanding. The extension is useful before it is trusted.
