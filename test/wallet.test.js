const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('Demos 2 and 3 expose explanation and pre-sign simulation', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  assert.match(html, /DEMOS 2–3 \/ EXPLAIN/);
  assert.match(html, /predict state change/i);
  assert.match(html, /simulate/i);
  const js = fs.readFileSync(path.join(__dirname, '..', 'src/app.js'), 'utf8');
  assert.match(js, /Simple → Curious → Technical → Raw/);
  assert.match(js, /withdraw/);
  assert.match(js, /explanation/);
  assert.match(js, /stateDiff/);
  assert.match(js, /−\$\{amount\} WQUAI/);
  assert.match(js, /uncertain/i);
});

test('Demo 1 preserves read-only boundaries and explicit sources', () => {
  const js = fs.readFileSync(path.join(__dirname, '..', 'src/app.js'), 'utf8');
  assert.match(js, /account\/balance/);
  assert.match(js, /account\/tokenlist/);
  assert.match(js, /QuaiScan · tokentx/);
  assert.doesNotMatch(js, /privateKey|signTransaction|eth_send/);
});

test('server serves the Demos 2–3 entrypoint', async () => {
  const server = require('../server');
  await new Promise((resolve) => setTimeout(resolve, 20));
  const response = await fetch('http://127.0.0.1:4173/');
  assert.equal(response.status, 200);
  assert.match(await response.text(), /DEMOS 2–3/);
  server.close();
});
