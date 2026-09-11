const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('Demo 1 shell exposes normalized asset and activity views', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  assert.match(html, /DEMO 1 \/ WHAT YOU OWN/);
  assert.match(html, /normalized asset view/i);
  const js = fs.readFileSync(path.join(__dirname, '..', 'src/app.js'), 'utf8');
  assert.match(js, /tokenlist/);
  assert.match(js, /tokentx/);
  assert.match(js, /normalizedAssets/);
});

test('Demo 1 preserves read-only boundaries and explicit sources', () => {
  const js = fs.readFileSync(path.join(__dirname, '..', 'src/app.js'), 'utf8');
  assert.match(js, /account\/balance/);
  assert.match(js, /account\/tokenlist/);
  assert.match(js, /QuaiScan · tokentx/);
  assert.doesNotMatch(js, /privateKey|signTransaction|eth_send/);
});

test('server serves the Demo 1 entrypoint', async () => {
  const server = require('../server');
  await new Promise((resolve) => setTimeout(resolve, 20));
  const response = await fetch('http://127.0.0.1:4173/');
  assert.equal(response.status, 200);
  assert.match(await response.text(), /DEMO 1/);
  server.close();
});
