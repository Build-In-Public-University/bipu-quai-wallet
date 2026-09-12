# BIPU Wallet browser extension — Phase 1

This is the unpacked Manifest V3 shell for the teaching-first Quai wallet.

## Install locally

1. Open `chrome://extensions` in Chrome/Chromium.
2. Enable Developer mode.
3. Choose **Load unpacked**.
4. Select this `extension/` directory.
5. Open the extension popup and choose **Open teaching panel**.

## Scope

Phase 1 proves the extension architecture only:

- popup entry point
- persistent side panel
- MV3 service worker message bus
- shared schema-versioned local state
- narrow permissions
- inert local fixture page

It deliberately has no RPC reads, page scraping, provider detection, keys, signing, messaging, or external writes. The extension is useful before it is trusted.
