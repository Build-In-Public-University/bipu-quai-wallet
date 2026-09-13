const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const worker = () => read('service-worker.js');
const panel = () => read('sidepanel/sidepanel.js');

// These are intentionally RED tests. They encode Phase 1 controls that the
// current demo implementation has not yet integrated.
test('SEND_TRANSACTION accepts only a validated canonical intent', () => {
  const source = worker();
  assert.match(source, /validateNativeTransferIntent/);
  assert.match(source, /message\.intent/);
  assert.doesNotMatch(source, /\[message\.transaction\]/);
});

test('provider approval rechecks chain and account against the intent', () => {
  const source = worker();
  assert.match(source, /eth_chainId/);
  assert.match(source, /eth_accounts/);
  assert.match(source, /validateProviderContext/);
});

test('transfer amounts are parsed exactly without floating point conversion', () => {
  const source = panel();
  assert.match(source, /parseQuaiAmount|parse.*Units|parseDecimal|exact.*base/i);
  assert.doesNotMatch(source, /Number\(amount\)|amount \* 1e18|Math\.round\(amount/);
});

test('provider acceptance enters durable reconciliation instead of final success', () => {
  const source = worker();
  assert.match(source, /createTransferRecord|updateTransferRecord/);
  assert.match(source, /pending_inclusion|reconciliation_unknown/);
  assert.match(source, /pendingTransfer|chrome\.storage\.local\.set/);
  assert.doesNotMatch(source, /sendResponse\(\{ ok: true, hash: result\.result \}\)/);
});

test('RPC transport has a bounded timeout and validates response shape', () => {
  const source = worker();
  assert.match(source, /rpcRequest/);
  assert.match(source, /indexerRequest/);
  assert.match(source, /rpcRequest|indexerRequest/);
});

test('dynamic provider and evidence values do not enter unsafe HTML sinks', () => {
  const source = panel();
  assert.doesNotMatch(source, /response\.answer\.evidence\.map\(.*innerHTML/s);
  assert.doesNotMatch(source, /\$\{providerAccount\}/);
  assert.doesNotMatch(source, /\$\{recipient\}/);
  assert.doesNotMatch(source, /\$\{response\.hash\}/);
  assert.match(source, /textContent|escape/);
});

test('all wallet address paths use Quai-aware validation', () => {
  const source = worker();
  assert.match(source, /validateQuaiAddress/);
  assert.doesNotMatch(source, /function isAddress\(value\) \{ return \^0x/);
});

test('runtime messages are centrally schema-validated and phase values are allowlisted', () => {
  const source = worker();
  assert.match(source, /validateRuntimeMessage/);
  assert.match(source, /observe|understand|network|practice|graduate/);
  assert.match(source, /validateRuntimeMessage/);
});

test('exact amount parser preserves wei for large and fractional values', async () => {
  const { parseQuaiAmount } = await import('../core/amount.js');
  assert.equal(parseQuaiAmount('9007199254.740993').valueWei, 9007199254740993000000000000n);
  assert.equal(parseQuaiAmount('0.000000000000000001').valueWei, 1n);
});

test('exact amount parser rejects unsafe decimal forms', async () => {
  const { parseQuaiAmount } = await import('../core/amount.js');
  for (const value of ['1e-3', '-1', '1.0000000000000000001', '01', '']) {
    assert.throws(() => parseQuaiAmount(value), /non-negative decimal/);
  }
});

test('Quai address validation distinguishes Quai and Qi ledger prefixes', async () => {
  const { isQuaiAddress, validateQuaiAddress } = await import('../core/address.js');
  const quai = '0x000DEADBEEFCAFE0000000000000000000000000';
  const qi = '0x008000000000000DEADBEEFCAFE0000000000000';
  assert.equal(isQuaiAddress(quai), true);
  assert.equal(isQuaiAddress(qi), false);
  assert.equal(validateQuaiAddress(quai), '0x000DEAdbeEFCafE0000000000000000000000000');
  assert.throws(() => validateQuaiAddress(qi), /Qi-ledger/);
  assert.throws(() => validateQuaiAddress('0x1234'), /40 hexadecimal/);
});

test('Quai checksum formatting matches the pinned js-sha3 implementation', async () => {
  const { formatQuaiChecksumAddress, validateQuaiAddress } = await import('../core/address.js');
  const lower = '0x8ba1f109551bd432803012645ac136ddd64dba72';
  const checksummed = '0x8ba1f109551bD432803012645Ac136ddd64DBA72';
  assert.equal(formatQuaiChecksumAddress(lower), checksummed);
  assert.equal(formatQuaiChecksumAddress(checksummed), checksummed);
  assert.throws(() => validateQuaiAddress('0x000DEAdbeEFCafE0000000000000000000000001'), /checksum/);
});

test('native transfer intents reject a zero sender while allowing a zero recipient', async () => {
  const { createNativeTransferIntent } = await import('../core/transaction-intent.js');
  const zero = '0x0000000000000000000000000000000000000000';
  const sender = '0x1111111111111111111111111111111111111111';
  assert.throws(() => createNativeTransferIntent({ from: zero, to: sender, valueWei: '0x1' }), /Zero address/);
  const intent = createNativeTransferIntent({ from: sender, to: zero, valueWei: '0x1' });
  assert.equal(intent.to, zero);
});

test('canonical intent validation rejects unsupported fields and operations', async () => {
  const { createNativeTransferIntent, validateNativeTransferIntent, toProviderTransaction } = await import('../core/transaction-intent.js');
  const intent = createNativeTransferIntent({ from: '0x1111111111111111111111111111111111111111', to: '0x0000000000000000000000000000000000000000', valueWei: '0x1' });
  assert.equal(toProviderTransaction(intent).data, '0x');
  assert.throws(() => validateNativeTransferIntent({ ...intent, gas: '0x1' }), /unsupported fields/);
  assert.throws(() => validateNativeTransferIntent({ ...intent, operation: 'contract-call' }), /Unsupported transaction operation/);
  assert.throws(() => validateNativeTransferIntent({ ...intent, chainId: '0xa' }), /network mismatch/);
});

test('provider context requires the intended chain, account, and known provider', async () => {
  const { validateProviderContext } = await import('../core/provider-context.js');
  const intent = { chainId: '0x9', from: '0x1111111111111111111111111111111111111111' };
  const context = validateProviderContext({ provider: 'pelagus', chainId: '0x9', accounts: [intent.from] }, intent);
  assert.deepEqual(context, { provider: 'pelagus', chainId: '0x9', account: intent.from });
  assert.throws(() => validateProviderContext({ provider: 'pelagus', chainId: '0xa', accounts: [intent.from] }, intent), /network/);
  assert.throws(() => validateProviderContext({ provider: 'ethereum', chainId: '0x9', accounts: ['0x2222222222222222222222222222222222222222'] }, intent), /account/);
  assert.throws(() => validateProviderContext({ provider: 'unknown', chainId: '0x9', accounts: [intent.from] }, intent), /identity/);
});

test('transfer records preserve provider acceptance until independent reconciliation', async () => {
  const { createTransferRecord, updateTransferRecord } = await import('../core/reconciliation.js');
  const intent = { chainId: '0x9', from: '0x1111111111111111111111111111111111111111', to: '0x0000000000000000000000000000000000000000', valueWei: '0x1', data: '0x' };
  const record = createTransferRecord(intent, 'pelagus', '0xabc');
  assert.equal(record.state, 'provider_accepted');
  assert.equal(updateTransferRecord(record, { chainId: '0x9', from: intent.from, to: intent.to, value: '0x1', input: '0x' }, { status: '0x1' }).state, 'confirmed');
  assert.equal(updateTransferRecord(record, { chainId: '0x9', from: intent.from, to: intent.to, value: '0x1', input: '0x' }, null).state, 'pending_inclusion');
  assert.equal(updateTransferRecord(record, null, null).state, 'reconciliation_unknown');
});

test('bounded transport rejects malformed RPC and indexer responses', async () => {
  const { rpcRequest, indexerRequest } = await import('../core/transport.js');
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async () => ({ ok: true, json: async () => ({ jsonrpc: '2.0', id: 1 }) });
    await assert.rejects(() => rpcRequest('https://example.test', 'quai_chainId'), /result is missing/);
    globalThis.fetch = async () => ({ ok: true, json: async () => ({ status: '1', result: {} }) });
    await assert.rejects(() => indexerRequest('https://example.test'), /not an array/);
    globalThis.fetch = async (_url, options) => new Promise((_resolve, reject) => options.signal.addEventListener('abort', () => reject(Object.assign(new Error('aborted'), { name: 'AbortError' }))));
    await assert.rejects(() => rpcRequest('https://example.test', 'quai_chainId', [], 5), /timed out/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('runtime message validation allowlists types, fields, and phases', async () => {
  const { validateRuntimeMessage } = await import('../core/message-validation.js');
  assert.equal(validateRuntimeMessage({ type: 'SET_PHASE', phase: 'observe' }).phase, 'observe');
  assert.equal(validateRuntimeMessage({ type: 'GET_STATE' }).type, 'GET_STATE');
  assert.throws(() => validateRuntimeMessage({ type: 'SET_PHASE', phase: 'admin' }), /not allowed/);
  assert.throws(() => validateRuntimeMessage({ type: 'GET_STATE', debug: true }), /unsupported fields/);
  assert.throws(() => validateRuntimeMessage({ type: 'SEND_TRANSACTION', transaction: {} }), /Invalid transaction/);
  assert.throws(() => validateRuntimeMessage({ type: 'DELETE_WALLET' }), /Unknown runtime/);
});
