async function message(payload) { return chrome.runtime.sendMessage(payload); }
const phase = document.querySelector('#phase');
const network = document.querySelector('#network');
const result = document.querySelector('#result');
const button = document.querySelector('#open-panel');
const state = await message({ type: 'GET_STATE' });
if (state?.ok) { phase.textContent = state.state.phase.toUpperCase(); network.textContent = `${state.state.network.name} · chain ${state.state.network.chainId}`; }
button.addEventListener('click', () => {
  if (!chrome.sidePanel?.open) {
    result.textContent = 'Panel unavailable: side panel API is not available.';
    return;
  }
  chrome.sidePanel.open({ windowId: chrome.windows.WINDOW_ID_CURRENT })
    .then(() => { result.textContent = 'Teaching panel opened.'; })
    .catch((error) => { result.textContent = `Panel unavailable: ${error.message || 'unknown error'}`; });
});
