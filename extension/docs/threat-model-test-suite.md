# Threat-model evaluation suite

Status: RED by design. This suite encodes production controls identified in `threat-model-review.md` before the implementation fixes exist.

Run the focused suite:

```bash
node --test extension/tests/threat-model.test.js
```

Run with the project suite:

```bash
npm test
```

## Current status

The focused suite contains seventeen tests. The initial RED checkpoint had eight intended threat-control failures. The implementation slices are now green for exact amounts, Quai ledger validation, canonical intents, provider context, durable reconciliation, bounded transport, safe rendering, and centralized runtime-message validation.

```text
Focused threat suite: 17 passed, 0 failed
Full suite: 45 passed, 0 failed
```

This is a control-suite result, not a production-release approval. Browser verification, live provider review, checksum completion, and explicit production-contract sign-off remain separate gates.

## GREEN order

Fix one contract at a time, preserving this suite:

1. exact decimal/base-unit parser;
2. Quai address validation;
3. canonical intent validation and service-worker integration;
4. provider chain/account recheck;
5. durable transaction record and receipt reconciliation;
6. bounded RPC/indexer adapters;
7. safe DOM rendering and CSP;
8. centralized runtime message validation.

Each GREEN step must include a focused run, then the complete `npm test` command. Do not weaken or delete a failing expectation to make the suite green.
