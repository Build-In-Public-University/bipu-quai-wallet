const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('MV3 manifest has narrow Phase 1 permissions', () => {
  const manifest = JSON.parse(read('manifest.json'));
  assert.equal(manifest.manifest_version, 3);
  assert.deepEqual(manifest.permissions, ['storage', 'sidePanel', 'activeTab', 'scripting']);
  assert.deepEqual(manifest.host_permissions, ['https://rpc.quai.network/*', 'https://quaiscan.io/*']);
  assert.equal(manifest.background.service_worker, 'service-worker.js');
  assert.equal(manifest.side_panel.default_path, 'sidepanel/sidepanel.html');
});

test('popup opens the side panel directly from the user gesture', () => {
  const popup = read('popup/popup.js');
  assert.match(popup, /chrome\.sidePanel\.open\(\{ windowId: chrome\.windows\.WINDOW_ID_CURRENT \}\)/);
  assert.doesNotMatch(popup, /OPEN_SIDE_PANEL/);
});

test('extension shell contains all user-facing entry points', () => {
  assert.match(read('popup/popup.html'), /Open teaching panel/);
  assert.match(read('sidepanel/sidepanel.html'), /State/);
  assert.match(read('sidepanel/sidepanel.html'), /Graduate/);
  assert.match(read('test-page.html'), /intentionally inert/);
});

test('Phase 1 contains explicit no-side-effect boundaries', () => {
  assert.match(read('sidepanel/sidepanel.html'), /No page scraping/);
  assert.match(read('sidepanel/sidepanel.html'), /Provider signing is explicit/);
  assert.match(read('README.md'), /signing/i);
  assert.doesNotMatch(read('service-worker.js'), /privateKey|signTransaction/);
});

test('Phase 2 keeps live observation in the service worker', () => {
  assert.match(read('service-worker.js'), /quai_getBalance/);
  assert.match(read('service-worker.js'), /OBSERVE_ADDRESS/);
  assert.match(read('sidepanel/sidepanel.js'), /OBSERVE_ADDRESS/);
  assert.match(read('sidepanel/sidepanel.html'), /DEMO 0 · LIVE OBSERVER/);
});

test('Demo 1 keeps normalized assets and activity source-labeled', () => {
  assert.match(read('service-worker.js'), /tokenlist/);
  assert.match(read('service-worker.js'), /tokentx/);
  assert.match(read('sidepanel/sidepanel.js'), /Normalized assets/);
  assert.match(read('sidepanel/sidepanel.js'), /Recent activity/);
  assert.match(read('sidepanel/sidepanel.js'), /sources\.rpc/);
});

test('Demos 2 and 3 remain explain-only and fail closed on unknown selectors', () => {
  const operation = read('core/operation.js');
  const panel = read('sidepanel/sidepanel.js');
  assert.match(operation, /WQUAI_WITHDRAW_SELECTOR/);
  assert.match(operation, /No state change prediction is safe/);
  assert.match(panel, /Deterministic local interpretation/);
  assert.match(panel, /does not execute, estimate gas, sign, or broadcast/);
  assert.doesNotMatch(panel, /eth_sendTransaction|eth_sign|privateKey/);
});

test('Demo 4 keeps signing provider-gated and approval-separated', () => {
  const worker = read('service-worker.js');
  const panel = read('sidepanel/sidepanel.js');
  assert.match(worker, /world: 'MAIN'/);
  assert.match(worker, /eth_requestAccounts/);
  assert.match(worker, /eth_sendTransaction/);
  assert.match(panel, /CONNECT_PROVIDER/);
  assert.match(panel, /EXPLAINED REQUEST · NOT SENT/);
  assert.match(panel, /Approve &amp; send/);
  assert.doesNotMatch(panel, /privateKey|signTransaction/);
});

test('Demo 5 is bounded, evidence-labeled, and uncertain outside context', () => {
  const ask = read('core/ask-quai.js');
  const worker = read('service-worker.js');
  const panel = read('sidepanel/sidepanel.js');
  assert.match(ask, /No bounded answer is available from the current wallet context/);
  assert.match(ask, /ON-CHAIN FACT/);
  assert.match(ask, /ECOSYSTEM SOURCE/);
  assert.match(ask, /MODEL INTERPRETATION/);
  assert.match(worker, /ASK_QUAI/);
  assert.match(panel, /Uncertainty preserved/);
});

test('Demo 6 stores familiarity separately from authorization and exposes invalidation', () => {
  const cache = read('core/cache.js');
  const worker = read('service-worker.js');
  const panel = read('sidepanel/sidepanel.js');
  assert.match(cache, /CACHE_KEY/);
  assert.match(cache, /Re-understand required/);
  assert.match(cache, /changed/);
  assert.match(worker, /REMEMBER_OPERATION/);
  assert.match(worker, /VALIDATE_OPERATION/);
  assert.match(panel, /Local familiarity never replaces live chain verification or authorizes signing/);
});

test('Demo 7 keeps NFT holder lookup read-only and fail-closed', () => {
  const nft = read('core/nft.js');
  const worker = read('service-worker.js');
  const panel = read('sidepanel/sidepanel.js');
  assert.match(nft, /validateNftRequest/);
  assert.match(nft, /No current indexer records returned/);
  assert.match(nft, /not a social graph/);
  assert.match(worker, /getTokenHolders/);
  assert.match(worker, /NFT_HOLDERS/);
  assert.match(panel, /CURRENT INDEXER DATA/);
  assert.doesNotMatch(panel, /eth_sendTransaction|signTransaction/);
});

test('Demo 8 keeps network policy local, explicit, and explainable', () => {
  const policy = read('core/policy.js');
  const panel = read('sidepanel/sidepanel.js');
  assert.match(policy, /network mismatch/);
  assert.match(policy, /links quarantined/);
  assert.match(policy, /policyReport/);
  assert.match(panel, /AUDITABLE POLICY OUTCOMES/);
  assert.match(panel, /No message was sent/);
  assert.doesNotMatch(panel, /fetch\(|eth_sendTransaction|signTransaction/);
});

test('shared state is schema-versioned and merges defaults', () => {
  const state = read('core/state.js');
  assert.match(state, /schemaVersion: 1/);
  assert.match(state, /export function mergeState/);
  assert.match(state, /permissions/);
});
