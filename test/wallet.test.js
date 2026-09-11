const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('Demo 0 shell contains the teaching loop anchors', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  assert.match(html, /Don't Trust\.\s*Understand\./);
  assert.match(html, /WALLET CAN SEE/);
  assert.match(html, /value="0x[a-fA-F0-9]{40}"/);
  const js = fs.readFileSync(path.join(__dirname, '..', 'src/app.js'), 'utf8');
  assert.match(js, /quai_getBalance/); // explicit RPC source, not hidden magic
});

test('Demo 0 reads live Quai methods and never asks for a key', () => {
  const js = fs.readFileSync(path.join(__dirname, '..', 'src/app.js'), 'utf8');
  assert.match(js, /quai_getBalance/);
  assert.match(js, /quai_chainId/);
  assert.match(js, /quai_blockNumber/);
  assert.doesNotMatch(js, /privateKey|signTransaction|eth_send/);
});

test('server serves the app entrypoint', async () => {
  const server = require('../server');
  await new Promise((resolve) => setTimeout(resolve, 20));
  const response = await fetch('http://127.0.0.1:4173/');
  assert.equal(response.status, 200);
  assert.match(await response.text(), /BIPU Wallet/);
  server.close();
});
