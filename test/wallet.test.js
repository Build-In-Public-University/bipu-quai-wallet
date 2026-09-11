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

test('Demo 5 exposes bounded context-aware Ask Quai teaching', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  assert.match(html, /DEMO 5 \/ ASK QUAI/);
  assert.match(html, /ask-quai/);
  const js = fs.readFileSync(path.join(__dirname, '..', 'src/app.js'), 'utf8');
  assert.match(js, /ON-CHAIN FACT/);
  assert.match(js, /MODEL INTERPRETATION/);
  assert.match(js, /No bounded answer/);
});

test('Demo 6 exposes cached validation and named invalidation', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  assert.match(html, /DEMO 6 \/ CACHED VALIDATION/);
  assert.match(html, /remember-pattern/);
  assert.match(html, /compare-pattern/);
  const js = fs.readFileSync(path.join(__dirname, '..', 'src/app.js'), 'utf8');
  assert.match(js, /localStorage/);
  assert.match(js, /re-understand required/i);
  assert.match(js, /changed assumption/i);
});

test('Demo 7 exposes a read-only NFT object and holder network', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  assert.match(html, /DEMO 7 \/ NFTS ARE NETWORKS/);
  assert.match(html, /find-others/);
  const js = fs.readFileSync(path.join(__dirname, '..', 'src/app.js'), 'utf8');
  assert.match(js, /getTokenHolders/);
  assert.match(js, /HOLDER NETWORK/);
  assert.match(js, /not proof that the collection has no holders/);
});

test('Demo 8 exposes explainable per-network message boundaries', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  assert.match(html, /DEMO 8 \/ NETWORK BOUNDARIES/);
  const js = fs.readFileSync(path.join(__dirname, '..', 'src/app.js'), 'utf8');
  assert.match(js, /why-filtered/);
  assert.match(js, /current holder required/);
  assert.match(js, /links quarantined/);
  assert.match(js, /duplicates suppressed/);
  assert.match(js, /policy outcome/i);
});

test('Demo 9 exposes an isolated learner sandbox', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  assert.match(html, /DEMO 9 \/ PRACTICE BEFORE ACCESS/);
  assert.match(html, /issue-learner/);
  assert.match(html, /simulated network/i);
  const js = fs.readFileSync(path.join(__dirname, '..', 'src/app.js'), 'utf8');
  assert.match(js, /temporary learner NFT/);
  assert.match(js, /red-team/);
  assert.match(js, /cannot grant real BIPU membership/);
});

test('Demo 10 exposes behavior-gated graduation without pretending to mint', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  assert.match(html, /DEMO 10 \/ EARN THE NETWORK/);
  assert.match(html, /graduate/);
  const js = fs.readFileSync(path.join(__dirname, '..', 'src/app.js'), 'utf8');
  assert.match(js, /counterfactual/i);
  assert.match(js, /Understanding demonstrated/);
  assert.match(js, /no deployed mint contract/i);
});
