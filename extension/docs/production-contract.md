# Phase 1 production contract

Status: in progress. This contract freezes the first production MVP before live write behavior expands.

## Production MVP scope

The first public release is a non-custodial external-provider wallet for one supported network:

- Network: Cyprus-1 (`chainId 0x9`).
- Asset: native QUAI first.
- Reads: native balance, source-labeled activity, and bounded operation context.
- Write: native QUAI transfer preparation and explicit external-provider approval.
- Confirmation: independent RPC transaction and receipt readback.
- Storage: local display cache and preferences only.

The first release does not include built-in custody, seed phrases, swaps, bridges, approvals, arbitrary contract writes, NFT transfers, hosted signing, or backend relays.

## Custody boundary

BIPU never receives, generates, stores, exports, or derives private keys in this MVP. An external wallet provider owns account recovery and signing. BIPU constructs an intent, renders it, and requests provider approval only after the user takes an explicit action.

## Transaction lifecycle

```text
prepared
→ provider_accepted
→ pending_inclusion
→ included
→ confirmed
```

Failure states are explicit:

```text
provider_rejected
failed_on_chain
reconciliation_unknown
replaced
reorg_detected
```

Provider acceptance is not confirmation. Final success requires independent readback that matches sender, recipient, value, calldata, chain, and receipt status.

## Evidence labels

- `ON-CHAIN FACT`: directly read from RPC or verified receipt.
- `INDEXER DATA`: returned by an indexer.
- `MODEL INTERPRETATION`: bounded explanation.
- `PREDICTION`: conditional expected effect.
- `UNCERTAINTY`: missing, stale, conflicting, or unsupported evidence.

## Privacy contract

- Telemetry is disabled by default.
- Page scraping is disabled.
- Private keys are never accessed.
- No remote account database exists.
- Local storage is for preferences and display cache only.
- Requested RPC/indexer reads disclose the requested address to that service.
- Diagnostics are user-initiated and redacted.

## Phase 1 exit criteria

- [x] Supported v1 scope written.
- [x] Non-custodial boundary written.
- [x] Transaction-intent schema implemented and tested.
- [x] Reconciliation states implemented and tested.
- [x] Privacy contract implemented and tested.
- [ ] Threat model reviewed against the implementation.
- [ ] Leo sign-off on the frozen production contract.
