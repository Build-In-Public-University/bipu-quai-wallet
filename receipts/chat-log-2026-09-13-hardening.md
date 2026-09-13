# Receipt: Phase 1 hardening session

- Project: BIPU Quai Wallet
- Date: 2026-09-13
- Receipt marker: `RECEIPTS`
- Source: local Hermes CLI session
- External session URL: not available

## User brief

Add a committed receipts layer containing chat-log evidence for the build. The optional external receipt-link field may point to an AI session, screenshot, console log, or another artifact that proves the work.

## Sanitized conversation record

### Hardening sequence

User: Continue to the next hardening slice.

Assistant: Implemented and verified bounded RPC/indexer transport, including timeout handling, response validation, and failure tests.

Verification recorded:

```text
Focused threat suite: 16 tests — 14 passed, 2 intentionally failing
Full suite: 44 tests — 42 passed, 2 intentionally failing
```

The remaining controls were safe rendering and centralized runtime-message validation.

User: Continue.

Assistant: Replaced the Ask Quai evidence rendering path with text-only DOM construction and escaped dynamic provider/transaction values in the signing path.

Verification recorded:

```text
Focused threat suite: 16 tests — 15 passed, 1 intentionally failing
Full suite: 44 tests — 43 passed, 1 intentionally failing
```

User: Continue.

Assistant: Added centralized runtime-message validation. Message types, fields, operation payloads, NFT payloads, and phase values are now validated before service-worker dispatch.

Verification recorded:

```text
Focused threat suite: 17 passed, 0 failed
Full suite: 45 passed, 0 failed
```

User: Add a reviewed pinned Keccak implementation.

Assistant: Added a vendored `js-sha3@0.13.0` ESM artifact, recorded its MIT license, upstream source, and npm integrity, and integrated the pinned `keccak256` function into Quai mixed-case address validation.

The official checksum vector was verified:

```text
lower:
0x8ba1f109551bd432803012645ac136ddd64dba72

checksummed:
0x8ba1f109551bD432803012645Ac136ddd64DBA72
```

Verification recorded:

```text
Focused threat suite: 18 passed, 0 failed
Full suite: 46 passed, 0 failed
```

User: Do the live runtime verification.

Assistant: Started the local app and exercised the read-only browser runtime.

Observed:

- local app loaded at `http://127.0.0.1:4173/`;
- Cyprus-1 state loaded;
- chain 9 rendered;
- 2 normalized assets returned;
- 5 token events returned;
- malformed address `0x1234` failed closed with a bounded validation error;
- deterministic explain and predict paths rendered without signing.

A stale-state defect was found during this run: a failed refresh left the previous normalized state visible. The refresh path was changed to clear old state before loading and on failure.

Final verification after that fix:

```text
Full suite: 46 passed, 0 failed
JavaScript syntax checks passed
git diff --check passed
```

The actual unpacked MV3 extension and injected provider were not available through the inspectable browser window. No provider account, private key, or real transaction was accessed.

## Evidence boundary

This receipt proves that the listed repository changes were made and that the listed local tests/runtime checks returned the recorded results. It does not prove:

- production readiness;
- live provider signing;
- receipt reconciliation against a real transaction;
- clean-profile extension installation;
- public release approval.
