async function message(payload) { return chrome.runtime.sendMessage(payload); }
const phase = document.querySelector('#phase');
const network = document.querySelector('#network');
const result = document.querySelector('#result');
const button = document.querySelector('#open-panel');
const state = await message({ type: 'GET_STATE' });
if (state?.ok) { phase.textContent = state.state.phase.toUpperCase(); network.textContent = `${state.state.network.name} · chain ${state.state.network.chainId}`; }
button.addEventListener('click', async () => {
  const response = await message({ type: 'OPEN_SIDE_PANEL' });
  result.textContent = response?.ok ? 'Teaching panel opened.' : `Panel unavailable: ${response?.error || 'unknown error'}`;
});
