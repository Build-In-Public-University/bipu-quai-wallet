# BIPU Wallet browser extension — Phase 2

This is the unpacked Manifest V3 shell for the teaching-first Quai wallet.

## Install locally

1. Open `chrome://extensions` in Chrome/Chromium.
2. Enable Developer mode.
3. Choose **Load unpacked**.
4. Select this `extension/` directory.
5. Open the extension popup and choose **Open teaching panel**.

## Scope

Phase 2 proves the extension architecture and moves Demo 0 into it:

- popup entry point
- persistent side panel
- MV3 service worker message bus
- shared schema-versioned local state
- narrow permissions
- live Demo 0 native QUAI observation through the service worker

It deliberately has no page scraping, provider detection, keys, signing, messaging, or external writes. The extension is useful before it is trusted.
