import { DEFAULT_STATE, STATE_KEY, mergeState } from './core/state.js';

const RPC_URL = 'https://rpc.quai.network/cyprus1';
const SCAN_URL = 'https://quaiscan.io/api';

async function rpc(method, params = []) {
  const response = await fetch(RPC_URL, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', method, params, id: Date.now() }) });
  if (!response.ok) throw new Error(`Quai RPC responded with HTTP ${response.status}`);
  const payload = await response.json();
  if (payload.error) throw new Error(payload.error.message || 'Quai RPC error');
  return payload.result;
}

async function scan(action, address) {
  const response = await fetch(`${SCAN_URL}?module=account&action=${action}&address=${encodeURIComponent(address)}`);
  if (!response.ok) throw new Error(`QuaiScan responded with HTTP ${response.status}`);
  const payload = await response.json();
  if (payload.status === '0' && action !== 'tokenlist') throw new Error(payload.message || 'QuaiScan returned no data');
  return Array.isArray(payload.result) ? payload.result : [];
}

function isAddress(value) { return /^0x[a-fA-F0-9]{40}$/.test(value.trim()); }

async function observeAddress(address) {
  if (!isAddress(address)) throw new Error('Expected 0x followed by 40 hexadecimal characters.');
  const [balance, chainId, blockNumber, tokenList, transfers] = await Promise.all([
    rpc('quai_getBalance', [address, 'latest']),
    rpc('quai_chainId'),
    rpc('quai_blockNumber'),
    scan('tokenlist', address),
    scan('tokentx', address)
  ]);
  return { address, balance, chainId, blockNumber, tokenList, transfers, observedAt: new Date().toISOString(), sources: { rpc: RPC_URL, assets: `${SCAN_URL}?module=account&action=tokenlist`, activity: `${SCAN_URL}?module=account&action=tokentx` } };
}

async function getState() {
  const stored = await chrome.storage.local.get(STATE_KEY);
  return mergeState(stored[STATE_KEY]);
}

async function setState(next) {
  const state = mergeState(next);
  await chrome.storage.local.set({ [STATE_KEY]: state });
  return state;
}

chrome.runtime.onInstalled.addListener(async () => {
  const current = await getState();
  await setState(current || DEFAULT_STATE);
  if (chrome.sidePanel?.setPanelBehavior) {
    await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === 'GET_STATE') {
    getState().then((state) => sendResponse({ ok: true, state }));
    return true;
  }
  if (message?.type === 'SET_PHASE') {
    getState().then((state) => setState({ ...state, phase: message.phase })).then((state) => sendResponse({ ok: true, state }));
    return true;
  }
  if (message?.type === 'OBSERVE_ADDRESS') {
    observeAddress(message.address).then((observation) => sendResponse({ ok: true, observation })).catch((error) => sendResponse({ ok: false, error: error.message }));
    return true;
  }
  if (message?.type === 'OPEN_SIDE_PANEL') {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }).then((tabs) => {
      const tabId = sender.tab?.id || tabs[0]?.id;
      if (!tabId || !chrome.sidePanel?.open) return sendResponse({ ok: false, error: 'No active tab is available.' });
      return chrome.sidePanel.open({ tabId }).then(() => sendResponse({ ok: true })).catch((error) => sendResponse({ ok: false, error: error.message }));
    });
    return true;
  }
  sendResponse({ ok: false, error: 'Unknown message type.' });
  return false;
});
