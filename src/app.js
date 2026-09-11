const RPC_URL = 'https://rpc.quai.network/cyprus1';
const SCAN_URL = 'https://quaiscan.io/api';
const addressInput = document.querySelector('#address');
const observeButton = document.querySelector('#observe');
const state = document.querySelector('#state');
const error = document.querySelector('#error');

function isAddress(value) { return /^0x[a-fA-F0-9]{40}$/.test(value.trim()); }
function big(value) { return BigInt(value); }
function formatUnits(value, decimals = 18, places = 4) {
  const scale = 10n ** BigInt(decimals); const whole = value / scale;
  const fraction = (value % scale).toString().padStart(decimals, '0').slice(0, places).replace(/0+$/, '');
  return `${whole.toLocaleString()}${fraction ? `.${fraction}` : ''}`;
}
function shortAddress(value) { return `${value.slice(0, 8)}…${value.slice(-6)}`; }
function escapeHtml(value) { return String(value).replace(/[&<>"']/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;' }[char])); }
async function rpc(method, params = []) {
  const response = await fetch(RPC_URL, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', method, params, id: Date.now() }) });
  if (!response.ok) throw new Error(`RPC responded with HTTP ${response.status}`);
  const payload = await response.json(); if (payload.error) throw new Error(payload.error.message || 'Quai RPC error'); return payload.result;
}
async function scan(action, address, extra = '') {
  const response = await fetch(`${SCAN_URL}?module=account&action=${action}&address=${encodeURIComponent(address)}${extra}`);
  if (!response.ok) throw new Error(`QuaiScan responded with HTTP ${response.status}`);
  const payload = await response.json();
  if (payload.status === '0' && action !== 'tokenlist') throw new Error(payload.message || 'QuaiScan returned no data');
  return payload.result || [];
}
function normalizedAssets(nativeWei, tokenList) {
  return [{ type: 'native', symbol: 'QUAI', name: 'Quai', contract: null, decimals: 18, balance: nativeWei, source: 'account/balance' }, ...tokenList.map((token) => ({ type: token.type === 'ERC-721' ? 'nft' : 'fungible', symbol: token.symbol || '—', name: token.name || 'Unnamed token', contract: token.contractAddress, decimals: Number(token.decimals || 0), balance: big(token.balance || 0), source: 'account/tokenlist' }))];
}
function activityLabel(item, address) {
  const self = address.toLowerCase(); const from = (item.from || '').toLowerCase(); const to = (item.to || '').toLowerCase();
  return from === self ? 'Sent' : to === self ? 'Received' : 'Observed';
}
function render({ address, nativeWei, assets, transfers, chainId, blockNumber, observedAt }) {
  const assetRows = assets.map((asset) => `<div class="asset-row"><div class="asset-icon ${asset.type}">${asset.type === 'native' ? 'Q' : asset.type === 'nft' ? 'N' : 'T'}</div><div class="asset-main"><strong>${escapeHtml(asset.symbol)}</strong><span>${escapeHtml(asset.name)}</span></div><div class="asset-balance">${formatUnits(asset.balance, asset.decimals)} <small>${escapeHtml(asset.symbol)}</small></div><div class="asset-meta"><span>${asset.type.toUpperCase()}</span><span>${asset.contract ? escapeHtml(shortAddress(asset.contract)) : 'native ledger'}</span></div></div>`).join('');
  const activityRows = transfers.slice(0, 5).map((item) => `<div class="activity-row"><div class="activity-direction ${activityLabel(item, address).toLowerCase()}">${activityLabel(item, address) === 'Received' ? '↓' : '↑'}</div><div class="activity-main"><strong>${activityLabel(item, address)} ${escapeHtml(item.tokenSymbol || 'token')}</strong><span>${escapeHtml(shortAddress(item.hash || item.transactionHash))}</span></div><div class="activity-value">${formatUnits(big(item.value || 0), Number(item.tokenDecimal || 18))} ${escapeHtml(item.tokenSymbol || '')}<small>block ${Number(item.blockNumber).toLocaleString()}</small></div></div>`).join('') || '<div class="no-activity">No token transfer events were returned for this address.</div>';
  state.innerHTML = `<div class="observation"><div class="state-head"><div><div class="metric-label">NORMALIZED WALLET STATE</div><h2>${escapeHtml(shortAddress(address))}</h2></div><div class="network-pill">CYPRUS-1 · CHAIN ${big(chainId).toString()}</div></div><div class="content-grid"><article class="panel assets"><div class="panel-head"><div><div class="metric-label">ASSETS</div><h3>${assets.length} normalized ${assets.length === 1 ? 'asset' : 'assets'}</h3></div><span class="source-chip">QuaiScan · tokenlist</span></div>${assetRows}<p class="panel-foot">Native QUAI is represented separately from fungible tokens. Contract addresses are not inferred.</p></article><article class="panel activity"><div class="panel-head"><div><div class="metric-label">RECENT ACTIVITY</div><h3>${transfers.length ? `${Math.min(transfers.length, 5)} token events` : 'No token events'}</h3></div><span class="source-chip">QuaiScan · tokentx</span></div>${activityRows}<p class="panel-foot">Events are normalized into direction, token, amount, and block. Calldata remains untouched.</p></article></div><div class="refresh-line"><span>Observed ${observedAt.toLocaleTimeString()} · block ${Number(blockNumber).toLocaleString()}</span><button id="refresh" type="button">↻ Refresh live state</button></div></div>`;
  document.querySelector('#refresh').addEventListener('click', observe);
}
async function observe() {
  const address = addressInput.value.trim(); error.hidden = true;
  if (!isAddress(address)) { error.textContent = 'That is not a valid EVM address. Expected 0x followed by 40 hexadecimal characters.'; error.hidden = false; return; }
  observeButton.disabled = true; observeButton.textContent = 'Reading…'; state.innerHTML = '<div class="empty-state"><div class="pulse-ring"></div><p>Reading native state, assets, and activity…</p></div>';
  try {
    const [nativeWei, chainId, blockNumber, tokenList, transfers] = await Promise.all([scan('balance', address), rpc('quai_chainId'), rpc('quai_blockNumber'), scan('tokenlist', address), scan('tokentx', address, '&page=1&offset=5&sort=desc')]);
    render({ address, nativeWei: big(nativeWei), assets: normalizedAssets(big(nativeWei), tokenList), transfers: Array.isArray(transfers) ? transfers : [], chainId, blockNumber, observedAt: new Date() });
  } catch (cause) { error.textContent = `Could not normalize this address: ${cause.message}`; error.hidden = false; state.innerHTML = '<div class="empty-state"><div class="pulse-ring"></div><p>Observation failed. No synthetic balances were substituted.</p></div>'; }
  finally { observeButton.disabled = false; observeButton.innerHTML = 'Load state <span>↗</span>'; }
}
observeButton.addEventListener('click', observe); addressInput.addEventListener('keydown', (event) => { if (event.key === 'Enter') observe(); });
