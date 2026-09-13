# BIPU Quai Teaching Wallet

> Don't Trust. Understand.

A Quai-native wallet that teaches users what the network is doing while they use it.

## Demo 1 — The Wallet Knows What You Own

This demo remains deliberately read-only. It accepts a Quai address and normalizes native QUAI, discovered tokens, and recent token transfer events. Native balance, token list, and activity come from QuaiScan's read-only account API; chain identity and latest block come from the Quai Cyprus-1 RPC. Every card carries a source label.

## Demos 2–3 — Explain → Predict

The teaching lab starts with a known WQUAI `withdraw(uint256)` candidate. Demo 2 translates the contract, selector, intent, and expected effect through a progressive explanation. Demo 3 renders a pre-sign state diff: WQUAI decreases, native QUAI increases, and gas remains an explicit uncertainty.

These are local deterministic interpretations. They do not call `eth_estimateGas`, sign, broadcast, or claim that a transaction executed. The WQUAI contract address is sourced from the Quai bridge documentation, and the `withdraw()` selector is the standard EVM selector `0x2e1a7d4d`.

No keys. No signing. No transaction side effects.

## Demo 4 — The Wallet Can Sign What It Explains

Demo 4 adds a provider-gated request path. A compatible browser wallet remains the signer. BIPU requests the active account, prepares a small native QUAI transfer, renders the from/to/value/raw value, and only then exposes `eth_sendTransaction` behind an explicit `Approve & send` click. Verification does not trigger that button.

## Receipts

A T0-to-present reconstructed session ledger, plus the earlier hardening excerpt, document the project decisions and verification outputs: [`receipts/README.md`](receipts/README.md). The receipt is process evidence, not production-release approval.

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
- Demo status: local prototype; observation is read-only, signing is provider-gated, validation is browser-local
- Not implemented yet: production custody hardening, token transaction signing, NFT networks, messaging policy, learner network

The architecture and demo sequence follow `BIPU_Quai_Teaching_Wallet_Hackathon_Roadmap.pdf` in the project brief. Demo 4 is provider-gated and has not been used to broadcast a transaction during development verification.

## Demo 5 — Ask Quai

Demo 5 adds a bounded, context-aware teaching surface. It answers a small set of questions about the WQUAI state and candidate withdrawal already visible in the wallet. Each answer separates on-chain fact, ecosystem source, and model interpretation. Unknown questions return `No bounded answer is available from the current wallet context` rather than generic ecosystem prose. This first version is local and deterministic: no private data, external model call, or transaction action is used.

## Demo 6 — Understanding Becomes Cached Validation

Demo 6 stores a known WQUAI `withdraw(uint256)` pattern in browser-local storage: destination contract, selector, function, expected effects, and permission condition. A repeat comparison reports `Recognized operation` only when all assumptions match. Changing the contract or selector produces `Re-understand required` and names the changed assumption. The cache reduces repeated explanation cost; it does not replace live chain verification or authorize signing.

## Demo 7 — NFTs Are Networks

Demo 7 adds a read-only NFT object and holder-network surface. Enter an indexed ERC-721 collection contract and token ID to inspect the object anchor, then use `Find the Others` to query current holders through QuaiScan's `token/getTokenHolders` endpoint. The holder list is labeled as current indexer data—not a social graph, proof of physical presence, or permission to contact holders. No NFT metadata or holder records are fabricated when the indexer returns no data.

## Demo 8 — Networks Have Boundaries

Demo 8 adds a local policy lab for an NFT holder network. Four deterministic rules can be toggled: current holder required, links quarantined, mutual holders prioritized, and duplicates suppressed. Three synthetic test messages produce visible delivered, summarized, and quarantined outcomes. `Why was this filtered?` names the rule, and the result remains overridable. No real message is sent; on-chain ownership is not treated as identity or contact permission.

## Demo 9 — Practice Before Access

Demo 9 adds an isolated onboarding sandbox. `Issue temporary learner NFT` creates a clearly local, non-transferable learner credential and exposes four practice steps: enter the simulated network, route a bounded red-team message, and inspect a simulated transaction. The learner NFT is not minted, never grants real BIPU membership, and expires when the sandbox is reset. Completed exercises are not interpreted as proof of understanding.

## Demo 10 — Earn the Network

Demo 10 adds observable graduation gates: a temporary learner must exist, a counterfactual must be recognized, and cached understanding must be explicitly invalidated. Only when all three are complete does the local surface say `Understanding demonstrated`; it also retires the learner in the local model. No deployed mint contract is configured, so no permanent NFT is minted and no real BIPU network is unlocked. A future mint remains provider-gated and requires a separate contract, explanation, approval, and readback.
