# BIPU Quai Teaching Wallet

> Don't Trust. Understand.

A Quai-native wallet that teaches users what the network is doing while they use it.

## Demo 1 — The Wallet Knows What You Own

This demo remains deliberately read-only. It accepts a Quai address and normalizes native QUAI, discovered tokens, and recent token transfer events. Native balance, token list, and activity come from QuaiScan's read-only account API; chain identity and latest block come from the Quai Cyprus-1 RPC. Every card carries a source label.

## Demos 2–3 — Explain → Predict

The teaching lab starts with a known WQUAI `withdraw(uint256)` candidate. Demo 2 translates the contract, selector, intent, and expected effect through a progressive explanation. Demo 3 renders a pre-sign state diff: WQUAI decreases, native QUAI increases, and gas remains an explicit uncertainty.

These are local deterministic interpretations. They do not call `eth_estimateGas`, sign, broadcast, or claim that a transaction executed. The WQUAI contract address is sourced from the Quai bridge documentation, and the `withdraw()` selector is the standard EVM selector `0x2e1a7d4d`.

No keys. No signing. No transaction side effects.

## Run it

Requires Node.js 20+.

```bash
npm test
npm start
```

Then open http://127.0.0.1:4173.

The default address is the zero address because it is accepted by the active Cyprus-1 RPC and provides a deterministic live observation. Replace it with an address that belongs to the active Cyprus-1 zone for the real recording; Quai routes addresses to their specific zone and the node will reject out-of-scope addresses.

## Source boundary

- Mainnet Cyprus-1 RPC: `https://rpc.quai.network/cyprus1`
- Mainnet chain ID: `9`
- Demo status: local prototype, read-only observer
- Not implemented yet: custody, tokens, transaction decoding, simulation, signing, Ask Quai, NFT networks, messaging policy, learner network

The architecture and demo sequence follow `BIPU_Quai_Teaching_Wallet_Hackathon_Roadmap.pdf` in the project brief. The next build boundary is Demo 1: normalized assets and activity.
