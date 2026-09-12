# Phase 1 Threat Model

Status: draft for review

## Assets

- User’s public address and network identity.
- Transaction intent: sender, recipient, value, calldata, chain, and expected effect.
- Provider approval boundary.
- Local preferences, cache, and transaction display state.
- Integrity of displayed chain and indexer evidence.
- Extension package and update path.

Private keys are explicitly outside the BIPU trust boundary in the v1 external-provider model.

## Trust boundaries

```text
Untrusted webpage
  → browser extension popup/side panel
  → MV3 service worker
  → configured RPC/indexer
  → external wallet provider
  → Quai network
```

The webpage is not an input authority. Page content must not become transaction intent without an explicit, reviewed adapter. RPC and indexer responses are external data and require schema validation. The provider is responsible for key custody and signing but is not treated as independent confirmation.

## Threats and controls

| Threat | Impact | Required control | Current state |
|---|---|---|---|
| Malicious webpage influences recipient or calldata | Loss of funds | No page scraping; canonical intent; render-before-approval | Partial |
| Malicious provider reports wrong account or chain | Wrong signing context | Read provider chain/account immediately before approval | Partial |
| RPC returns stale or forged state | Incorrect explanation | Source labels, block anchors, fallback, reconciliation | Planned |
| Indexer invents or omits activity | Misleading portfolio view | Label indexer data and reconcile critical fields with RPC | Planned |
| Chain changes between preparation and approval | Wrong-network transaction | Compare chain ID at preparation and approval | Planned |
| Provider accepts transaction but chain rejects it | False success | Independent transaction and receipt readback | Partial |
| Replaced, dropped, or reorged transaction | Incorrect final state | Explicit reconciliation state machine | Implemented as contract; runtime planned |
| XSS through token/NFT metadata or RPC fields | Account/UI compromise | Escape untrusted display values; CSP; hostile fixtures | Partial |
| Extension update compromise | Broad compromise | Permission review, dependency pinning, release hash, audit | Planned |
| Local cache mistaken for authorization | Unsafe signing | Cache is display-only and invalidated on changed assumptions | Implemented |
| User privacy exposed through telemetry | Address/activity leakage | Telemetry disabled by default; redacted diagnostics | Implemented as contract |

## Explicit non-goals

- BIPU does not generate, import, export, or store private keys in v1.
- BIPU does not infer safety from token names, holder records, volume, or indexer presence.
- BIPU does not treat a provider hash as final settlement.
- BIPU does not scrape arbitrary pages or accept arbitrary page instructions.
- BIPU does not provide recovery if the external provider loses the account.

## Review questions

Before Phase 1 is verified:

1. Can a webpage influence a transaction without an explicit user action?
2. Does the approval screen show the exact chain, sender, recipient, value, and calldata?
3. What happens when provider chain/account changes between preparation and approval?
4. What evidence is independent of the provider?
5. Which displayed fields can be stale or indexer-derived?
6. What is the user-visible state when reconciliation cannot complete?
7. Can untrusted metadata reach an unsafe DOM sink?
8. What package, permission, dependency, and update controls protect the extension?

A “yes” to any unresolved safety question blocks public-fund use.
