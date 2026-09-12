import { DEFAULT_STATE, STATE_KEY, mergeState } from './core/state.js';

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
