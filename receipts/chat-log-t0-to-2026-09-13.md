# Receipt: BIPU Quai Wallet from T0

- Project: BIPU Quai Wallet
- T0: 2026-09-11 14:02 local session time
- Session: `@session:default/20260911_140203_3e4317`
- Source: retained local Hermes session record
- Receipt marker: `RECEIPTS`
- External session URL: not available

## Coverage statement

This is the expanded T0-to-present receipt. It reconstructs the human-facing project conversation and verified execution checkpoints from the retained session record. It is not a verbatim raw transcript: internal system/developer messages, tool argument payloads, compaction handoffs, credentials, private keys, and unrelated personal data are excluded.

The retained session contains 146 messages. The earliest repository-specific message is the T0 below. Earlier conversations mentioning other BIPU wallet projects are outside this receipt.

## T0 — Hackyard brief

User:

> our hackyard submission is a BIPU Wallet. Quai is the main currency of it. project outline here: `~/Downloads/BIPU_Quai_Teaching_Wallet_Hackathon_Roadmap.pdf` - create a fresh repo and build until the first demo so we can record it # git-secret-ignore

## Initial build

The project was created as a fresh repository at:

`/Users/leoguinan/Projects/bipu-quai-wallet`

The first implementation established:

- a BIPU teaching-first wallet shell;
- read-only Cyprus-1 observation;
- native QUAI balance, chain identity, and block reads;
- visible source labels and provenance;
- address validation and RPC error handling;
- local Node server and tests;
- no private-key handling, custody, or signing.

The initial live observer was verified against the Cyprus-1 RPC. The repository was then extended through the planned teaching sequence.

## Demo progression

### Demo 0 — The Wallet Can See

Read-only live state observation through the Cyprus-1 RPC. The wallet shows native QUAI balance, chain identity, latest block, and the boundary between live chain state and UI state.

### Demo 1 — The Wallet Knows What You Own

Normalized native QUAI, indexed token inventory, and recent token transfer events. RPC and indexer sources remain visibly separate.

### Demos 2–3 — Explain → Predict

A bounded WQUAI withdrawal teaching lab recognizes a known selector, explains the candidate operation, and renders a conditional pre-sign state change. It does not execute, estimate gas, sign, or broadcast.

### Demo 4 — Sign What It Explains

A compatible external provider remains the signer. BIPU prepares a constrained native QUAI transfer, shows the from/to/value/raw value, and gates `eth_sendTransaction` behind explicit approval.

### Demo 5 — Ask Quai

A bounded context-aware teaching surface separates on-chain facts, ecosystem sources, and model interpretation. Unknown questions remain unknown.

### Demo 6 — Understanding Becomes Cached Validation

A known WQUAI operation can be remembered locally. Cache matches require the destination, selector, expected effects, and assumptions to match. Cache familiarity never authorizes signing or replaces live verification.

### Demo 7 — NFTs Are Networks

Read-only NFT object and holder-network surfaces use indexed data. Holder records are not treated as identity, social permission, or contact authorization.

### Demo 8 — Networks Have Boundaries

A local policy lab applies explicit holder, link, mutual-holder, and duplicate rules to synthetic messages. No real message is sent.

### Demo 9 — Practice Before Access

An isolated learner sandbox provides temporary local credentials and bounded exercises. It does not mint, grant membership, or infer understanding.

### Demo 10 — Earn the Network

Observable local graduation gates require completion of the sandbox exercises and explicit cache invalidation. No permanent NFT or real network access is granted.

## Phase 1 hardening

The threat-model workflow began with intentionally RED controls and then moved one control slice at a time to GREEN.

Implemented controls:

1. Exact decimal QUAI parsing with `BigInt`; no floating-point monetary conversion.
2. Quai/Qi ledger-prefix validation and zero-sender policy.
3. Full mixed-case Quai checksum validation using vendored pinned `js-sha3@0.13.0` Keccak-256.
4. Strict canonical native-transfer intent allowlisting.
5. Approval-time provider chain and account checks.
6. Durable transfer records and independent transaction/receipt reconciliation.
7. Bounded RPC/indexer transport with timeout and response-shape checks.
8. Safe rendering of dynamic provider, transaction, and evidence values.
9. Centralized runtime-message schema and phase validation.
10. Stale-state clearing after failed observation refresh.

The checksum implementation was initially attempted with handwritten code, failed an official vector, and was reverted. Only after vendoring and verifying the pinned upstream implementation was checksum validation integrated.

## Verification receipts

Recorded local results across the hardening sequence:

```text
Initial threat-model baseline: 28 passed, 8 intended control failures
After amount validation: 31 passed of 38
After address validation: 34 passed of 40
After canonical intents: 36 passed of 41
After provider context: 38 passed of 42
After reconciliation: 40 passed of 43
After bounded transport: 42 passed of 44
After safe rendering: 43 passed of 44
All threat controls green: 45 passed of 45
After pinned Keccak/checksum: 46 passed of 46
After stale-state fix: 46 passed of 46
```

Additional checks passed:

```text
JavaScript syntax checks passed
git diff --check passed
Receipt JSON parsed successfully
```

## Live runtime verification

The inspectable browser runtime verified:

- local app loading at `http://127.0.0.1:4173/`;
- Cyprus-1 state resolution;
- chain 9 rendering;
- 2 normalized assets;
- 5 token events;
- malformed-address fail-closed behavior;
- deterministic explain and predict behavior without signing.

A live provider-injected unpacked MV3 extension could not be exposed through the available browser window. No provider account, private key, or real transaction was accessed.

## Publication

The implementation repository is:

`https://github.com/Build-In-Public-University/bipu-quai-wallet`

The T0-to-present implementation and receipt layer were committed and pushed together. The receipt link remains `null` because this CLI session has no shareable HTTPS chat URL; the committed receipt and local session reference are the available evidence.

## Non-claims

This receipt does not claim:

- production readiness;
- clean-profile MV3 extension installation;
- live provider signing;
- real transaction reconciliation;
- public-fund readiness;
- security review beyond the recorded controls;
- that the reconstructed ledger is a verbatim transcript.
