const RPC_URL = 'https://rpc.quai.network/cyprus1';
const addressInput = document.querySelector('#address');
const observeButton = document.querySelector('#observe');
const state = document.querySelector('#state');
const error = document.querySelector('#error');

function isAddress(value) { return /^0x[a-fA-F0-9]{40}$/.test(value.trim()); }
function hexToBigInt(value) { return BigInt(value); }
function formatQuai(wei) {
  const whole = wei / 10n ** 18n;
  const fraction = (wei % 10n ** 18n).toString().padStart(18, '0').slice(0, 4).replace(/0+$/, '');
  return `${whole.toLocaleString()}${fraction ? `.${fraction}` : ''}`;
}
function shortAddress(value) { return `${value.slice(0, 8)}…${value.slice(-6)}`; }
async function rpc(method, params = []) {
  const response = await fetch(RPC_URL, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', method, params, id: Date.now() }) });
  if (!response.ok) throw new Error(`RPC responded with HTTP ${response.status}`);
  const payload = await response.json();
  if (payload.error) throw new Error(payload.error.message || 'The Quai node returned an error');
  return payload.result;
}
function renderObservation({ address, balance, chainId, blockNumber, observedAt }) {
  state.innerHTML = `<div class="observation">
    <article class="metric primary"><div><div class="metric-label">LIVE NATIVE BALANCE</div><div class="balance">${formatQuai(balance)} <small>QUAI</small></div></div><div class="source">source <b>quai_getBalance</b> · latest</div></article>
    <article class="metric"><div class="metric-label">NETWORK</div><div class="metric-value">Cyprus-1</div><div class="source">chain ID <b>${hexToBigInt(chainId).toString()}</b></div></article>
    <article class="metric"><div class="metric-label">ADDRESS</div><div class="metric-value">${shortAddress(address)}</div><div class="source">read-only observation</div></article>
    <article class="metric"><div class="metric-label">LATEST BLOCK</div><div class="metric-value">${hexToBigInt(blockNumber).toLocaleString()}</div><div class="source">source <b>quai_blockNumber</b></div></article>
    <article class="metric"><div class="metric-label">STATE PROVENANCE</div><div class="metric-value">LIVE RPC</div><div class="source">not a local cache</div></article>
    <div class="refresh-line"><span>Observed ${observedAt.toLocaleTimeString()}</span><button id="refresh" type="button">↻ Refresh from Quai</button></div>
  </div>`;
  document.querySelector('#refresh').addEventListener('click', observe);
}
async function observe() {
  const address = addressInput.value.trim();
  error.hidden = true;
  if (!isAddress(address)) { error.textContent = 'That is not a valid EVM address. Expected 0x followed by 40 hexadecimal characters.'; error.hidden = false; return; }
  observeButton.disabled = true; observeButton.textContent = 'Reading…';
  state.innerHTML = '<div class="empty-state"><div class="pulse-ring"></div><p>Reading live state from Quai Cyprus-1…</p></div>';
  try {
    const [balance, chainId, blockNumber] = await Promise.all([rpc('quai_getBalance', [address, 'latest']), rpc('quai_chainId'), rpc('quai_blockNumber')]);
    renderObservation({ address, balance: hexToBigInt(balance), chainId, blockNumber, observedAt: new Date() });
  } catch (cause) {
    error.textContent = `Could not observe this address: ${cause.message}`; error.hidden = false;
    state.innerHTML = '<div class="empty-state"><div class="pulse-ring"></div><p>Observation failed. The network did not give us a fact.</p></div>';
  } finally { observeButton.disabled = false; observeButton.innerHTML = 'Observe <span>↗</span>'; }
}
observeButton.addEventListener('click', observe);
addressInput.addEventListener('keydown', (event) => { if (event.key === 'Enter') observe(); });
