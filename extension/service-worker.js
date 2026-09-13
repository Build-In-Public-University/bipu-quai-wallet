import { DEFAULT_STATE, STATE_KEY, mergeState } from './core/state.js';
import { answerQuestion } from './core/ask-quai.js';
import { CACHE_KEY, compareOperation, operationFingerprint } from './core/cache.js';
import { holderResult, validateNftRequest } from './core/nft.js';
import { isQuaiAddress, validateQuaiAddress } from './core/address.js';
import { validateNativeTransferIntent, toProviderTransaction } from './core/transaction-intent.js';
import { validateProviderContext } from './core/provider-context.js';
import { createTransferRecord, updateTransferRecord } from './core/reconciliation.js';
import { rpcRequest, indexerRequest } from './core/transport.js';
import { validateRuntimeMessage } from './core/message-validation.js';

const RPC_URL = 'https://rpc.quai.network/cyprus1';
const SCAN_URL = 'https://quaiscan.io/api';

async function rpc(method, params = []) {
  return rpcRequest(RPC_URL, method, params);
}

async function scan(action, address) {
  return indexerRequest(`${SCAN_URL}?module=account&action=${action}&address=${encodeURIComponent(address)}`);
}

function isAddress(value) { return isQuaiAddress(value?.trim()); }

async function observeAddress(address) {
  const normalizedAddress = validateQuaiAddress(address);
  const [balance, chainId, blockNumber, tokenList, transfers] = await Promise.all([
    rpc('quai_getBalance', [normalizedAddress, 'latest']),
    rpc('quai_chainId'),
    rpc('quai_blockNumber'),
    scan('tokenlist', normalizedAddress),
    scan('tokentx', normalizedAddress)
  ]);
  return { address: normalizedAddress, balance, chainId, blockNumber, tokenList, transfers, observedAt: new Date().toISOString(), sources: { rpc: RPC_URL, assets: `${SCAN_URL}?module=account&action=tokenlist`, activity: `${SCAN_URL}?module=account&action=tokentx` } };
}

async function nftHolders(contract, tokenId) {
  const request = validateNftRequest(contract, tokenId);
  const url = `${SCAN_URL}?module=token&action=getTokenHolders&contractaddress=${encodeURIComponent(request.contract)}&tokenId=${encodeURIComponent(request.tokenId)}`;
  const result = await indexerRequest(url);
  return { ...request, ...holderResult(result), source: url };
}

async function activeTabId(sender) {
  const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  const tabId = sender.tab?.id || tabs[0]?.id;
  if (!tabId) throw new Error('No active tab is available.');
  return tabId;
}

async function providerRequest(sender, method, params = []) {
  const tabId = await activeTabId(sender);
  const results = await chrome.scripting.executeScript({ target: { tabId }, world: 'MAIN', func: async (requestMethod, requestParams) => {
    const candidate = window.pelagus || window.ethereum;
    if (!candidate?.request) throw new Error('No compatible EVM provider detected.');
    return { provider: window.pelagus ? 'pelagus' : 'ethereum', result: await candidate.request({ method: requestMethod, params: requestParams }) };
  }, args: [method, params] });
  return results[0]?.result;
}

async function verifyProviderContext(sender, intent) {
  const chain = await providerRequest(sender, 'eth_chainId');
  const accounts = await providerRequest(sender, 'eth_accounts');
  return validateProviderContext({ provider: chain.provider, chainId: chain.result, accounts: accounts.result }, intent);
}

async function reconcileProviderAcceptance(intent, provider, hash) {
  const record = createTransferRecord(intent, provider, hash);
  let next = record;
  try {
    const transaction = await rpc('quai_getTransactionByHash', [hash]);
    const receipt = await rpc('quai_getTransactionReceipt', [hash]);
    next = updateTransferRecord(record, transaction, receipt);
  } catch (error) {
    next = { ...record, state: 'reconciliation_unknown', reasons: [`independent readback failed: ${error.message}`], updatedAt: new Date().toISOString() };
  }
  const state = await getState();
  await setState({ ...state, pendingTransfer: next });
  return next;
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
  try {
    message = validateRuntimeMessage(message);
  } catch (error) {
    sendResponse({ ok: false, error: error.message });
    return false;
  }
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
  if (message?.type === 'CONNECT_PROVIDER') {
    providerRequest(sender, 'eth_requestAccounts').then((result) => sendResponse({ ok: true, provider: result.provider, account: result.result?.[0] })).catch((error) => sendResponse({ ok: false, error: error.message }));
    return true;
  }
  if (message?.type === 'SEND_TRANSACTION') {
    try {
      const intent = validateNativeTransferIntent(message.intent);
      verifyProviderContext(sender, intent).then((context) => providerRequest(sender, 'eth_sendTransaction', [toProviderTransaction(intent)]).then((result) => reconcileProviderAcceptance(intent, context.provider, result.result).then((reconciliation) => sendResponse({ ok: reconciliation.state === 'confirmed', state: reconciliation.state, hash: result.result, intent, provider: context.provider, reconciliation })))).catch((error) => sendResponse({ ok: false, error: error.message }));
    } catch (error) {
      sendResponse({ ok: false, error: error.message });
    }
    return true;
  }
  if (message?.type === 'ASK_QUAI') {
    getState().then((state) => sendResponse({ ok: true, answer: answerQuestion(message.question, { selector: message.selector, wquaiBalance: message.wquaiBalance || state.selectedAsset?.balance }) })).catch((error) => sendResponse({ ok: false, error: error.message }));
    return true;
  }
  if (message?.type === 'REMEMBER_OPERATION') {
    const operation = operationFingerprint(message.operation);
    chrome.storage.local.set({ [CACHE_KEY]: operation }).then(() => sendResponse({ ok: true, operation })).catch((error) => sendResponse({ ok: false, error: error.message }));
    return true;
  }
  if (message?.type === 'VALIDATE_OPERATION') {
    chrome.storage.local.get(CACHE_KEY).then((stored) => sendResponse({ ok: true, comparison: compareOperation(stored[CACHE_KEY], operationFingerprint(message.operation)) })).catch((error) => sendResponse({ ok: false, error: error.message }));
    return true;
  }
  if (message?.type === 'NFT_HOLDERS') {
    nftHolders(message.contract, message.tokenId).then((result) => sendResponse({ ok: true, result })).catch((error) => sendResponse({ ok: false, error: error.message }));
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
