const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('Demo 4 exposes a provider-gated explain-before-sign flow', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  assert.match(html, /DEMO 4 \/ SIGN WHAT IT EXPLAINS/);
  assert.match(html, /Connect compatible wallet/);
  const js = fs.readFileSync(path.join(__dirname, '..', 'src/app.js'), 'utf8');
  assert.match(js, /Approve &amp; send/);
  assert.match(js, /eth_requestAccounts/);
  assert.match(js, /eth_sendTransaction/);
  assert.match(js, /explainedRequest/);
  assert.match(js, /provider-gated/i);
});

test('Demo 1 preserves read-only boundaries and explicit sources', () => {
  const js = fs.readFileSync(path.join(__dirname, '..', 'src/app.js'), 'utf8');
  assert.match(js, /account\/balance/);
  assert.match(js, /account\/tokenlist/);
  assert.match(js, /QuaiScan · tokentx/);
  assert.doesNotMatch(js, /privateKey|signTransaction/);
});

test('Demos 2 and 3 remain present', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const js = fs.readFileSync(path.join(__dirname, '..', 'src/app.js'), 'utf8');
  assert.match(html, /TEACHING LAB · WQUAI WITHDRAW/);
  assert.match(html, /Predict state change/);
  assert.match(js, /Simple → Curious → Technical → Raw/);
  assert.match(js, /stateDiff/);
});

test('server serves the Demo 4 entrypoint', async () => {
  const server = require('../server');
  await new Promise((resolve) => setTimeout(resolve, 20));
  const response = await fetch('http://127.0.0.1:4173/');
  assert.equal(response.status, 200);
  assert.match(await response.text(), /DEMO 4 \/ SIGN WHAT IT EXPLAINS/);
  server.close();
});
