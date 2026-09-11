# BIPU Quai Teaching Wallet

> Don't Trust. Understand.

A Quai-native wallet that teaches users what the network is doing while they use it.

## Demo 0 — The Wallet Can See

This first demo is deliberately read-only. It accepts a Quai address and reads the live native QUAI balance, chain identity, and latest block directly from the Quai Cyprus-1 RPC. The UI labels the RPC method used and distinguishes live chain state from local UI state.

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
