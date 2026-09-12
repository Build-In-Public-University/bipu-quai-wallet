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

test('extension shell contains all user-facing entry points', () => {
  assert.match(read('popup/popup.html'), /Open teaching panel/);
  assert.match(read('sidepanel/sidepanel.html'), /State/);
  assert.match(read('sidepanel/sidepanel.html'), /Graduate/);
  assert.match(read('test-page.html'), /intentionally inert/);
});

test('Phase 1 contains explicit no-side-effect boundaries', () => {
  assert.match(read('sidepanel/sidepanel.html'), /No page scraping/);
  assert.match(read('sidepanel/sidepanel.html'), /No RPC calls/);
  assert.match(read('README.md'), /no RPC reads/i);
  assert.doesNotMatch(read('service-worker.js'), /eth_sendTransaction|privateKey|signTransaction/);
});

test('shared state is schema-versioned and merges defaults', () => {
  const state = read('core/state.js');
  assert.match(state, /schemaVersion: 1/);
  assert.match(state, /export function mergeState/);
  assert.match(state, /permissions/);
});
