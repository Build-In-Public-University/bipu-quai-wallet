async function message(payload) { return chrome.runtime.sendMessage(payload); }
const phase = document.querySelector('#phase');
const network = document.querySelector('#network');
const result = document.querySelector('#result');
const button = document.querySelector('#open-panel');
const state = await message({ type: 'GET_STATE' });
if (state?.ok) { phase.textContent = state.state.phase.toUpperCase(); network.textContent = `${state.state.network.name} · chain ${state.state.network.chainId}`; }
button.addEventListener('click', async () => {
  try {
    const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    const tabId = tabs[0]?.id;
    if (!tabId || !chrome.sidePanel?.open) throw new Error('No active tab is available.');
    await chrome.sidePanel.open({ tabId });
    result.textContent = 'Teaching panel opened.';
  } catch (error) {
    result.textContent = `Panel unavailable: ${error.message || 'unknown error'}`;
  }
});
