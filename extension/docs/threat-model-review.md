# Phase 1 Threat Model Review

Status: reviewed — blockers identified
Reviewed against: `d6c3de7` implementation state
Scope: MV3 extension, service worker, side panel, provider bridge, contract modules, and manifest.

## Verdict

The threat model identifies the correct trust boundaries, but the current implementation does not yet meet the production contract. The extension remains suitable for teaching and controlled test fixtures. It is not ready for public funds or a production-wallet claim.

## Blockers

### T-001 — Provider acceptance is presented as the terminal result

Severity: critical

`extension/service-worker.js` returns `{ ok: true, hash }` immediately after `eth_sendTransaction`. `extension/sidepanel/sidepanel.js` renders “Provider accepted the request” and does not perform transaction or receipt readback. The reconciliation module exists only as an unintegrated contract.

Risk: a rejected, dropped, replaced, reverted, or wrong-chain transaction can remain unresolved while the UI implies completion progress without an independent chain result.

Required fix: persist the intent and provider response separately; read the transaction and receipt from RPC; verify chain, sender, recipient, value, calldata, status, block anchor, and replacement/reorg state; render `reconciliation_unknown` when readback cannot complete.

### T-002 — The send path does not consume the canonical intent contract

Severity: critical

The boundary is now partially implemented: `service-worker.js` validates `message.intent` with `validateNativeTransferIntent()` and rebuilds the provider payload with `toProviderTransaction()`. The side panel sends the versioned intent rather than an arbitrary transaction object.

Remaining risk: provider chain/account checks and approval binding are not yet implemented. The canonical intent must be bound to the account and network rechecked immediately before the provider request.

### T-003 — Exact QUAI amounts are computed through JavaScript Number

Severity: high

Resolved in the current slice. `core/amount.js` parses decimal strings into exact base units with `BigInt`, and the side panel uses the parsed value for both the explanation and provider-bound intent. Tests cover safe-integer overflow, 18-decimal precision, exponent notation, negatives, excess precision, and leading zeros.

Remaining scope: the parser must remain the sole amount path as provider and reconciliation work is added.

### T-004 — Provider and chain identity are not verified at approval time

Severity: high

The current approval path now requests `eth_chainId` and `eth_accounts`, validates both against the canonical intent, and preserves the provider identity through `validateProviderContext()` before calling `eth_sendTransaction`.

Remaining risk: the checks and send occur through separate provider requests. A later hardening slice should perform the context check and send through one approval-bound provider execution path, and should handle provider disconnect/account-change events explicitly.

## High-priority gaps

### T-005 — RPC/indexer transport lacks production validation

Severity: high

The service worker uses one hard-coded RPC endpoint and one indexer endpoint. Requests have no timeout, fallback, response schema validation, block hash anchor, or conflict state. `scan()` reduces non-array results to an empty array in some cases, which can turn malformed data into an apparently empty result.

Required fix: typed adapters, bounded timeout/retry, endpoint health, schema validation, block anchors, stale/conflict states, and explicit unavailable results.

### T-006 — Untrusted values reach `innerHTML` in several render paths

Severity: high

Some values are escaped, but not all. Ask Quai evidence text is inserted without `escape()`. Provider account text is inserted directly into the signing result. Selector-derived text can enter Ask Quai evidence. RPC-derived numeric conversion can also throw rather than produce a bounded error state.

Required fix: use `textContent` or a DOM builder for untrusted values; escape every dynamic interpolation as a temporary measure; add hostile metadata/provider/selector fixtures and a CSP.

### T-007 — Address validation is generic EVM validation, not Quai validation

Severity: high

The ledger-prefix and mixed-case checksum controls are now implemented in `extension/core/address.js`. The validator rejects Qi-ledger addresses for QUAI operations, rejects malformed addresses and invalid mixed-case checksums, and canonicalizes all-lowercase/all-uppercase input through the pinned Keccak implementation.

Remaining required fix: apply and verify the complete validator consistently to every displayed network context and complete live provider/runtime verification.

### T-008 — Runtime state-machine and reconciliation states are not integrated

Severity: medium/high

`RECONCILIATION_STATES` and `reconcileReceipt()` are tested as pure functions, but no durable runtime record advances through them. Service-worker suspension can therefore lose the relationship between intent, provider response, hash, and receipt.

Required fix: add a versioned local transaction record with explicit lifecycle transitions, restart-safe persistence, idempotent polling, and bounded retention.

### T-009 — Service-worker message handlers lack a typed sender/message policy

Severity: medium

Message types and payloads are dispatched by string checks. There is no centralized schema validation, version negotiation, or sender policy. `SET_PHASE` also accepts arbitrary phase values.

Required fix: centralize message schemas, reject malformed payloads, validate sender context where relevant, and allowlist phase and operation values.

### T-010 — Manifest and release controls are incomplete

Severity: medium

The manifest permissions are reasonably narrow, but there is no explicit extension-page CSP, dependency lock/review workflow, reproducible package receipt, or clean-profile release evidence in the implementation repository.

Required fix: add CSP where compatible, document permission rationale, pin/audit dependencies, produce a package hash, and verify a clean browser profile before any public-fund release.

## Controls that are currently good

- Private keys remain outside the extension boundary.
- Provider signing is explicit rather than automatic.
- Popup side-panel opening is directly gesture-bound.
- Demo 5–10 safety boundaries are visible and tested.
- Cached familiarity is not used as authorization.
- Holder data is labeled as indexer data rather than a social graph.
- The project has a useful pure reconciliation contract to integrate rather than invent.

## Phase 1 disposition

```text
Threat model review: complete
Production contract: not verified
Public-fund readiness: blocked
Next required phase: integrate canonical intent + provider checks + receipt reconciliation
```
