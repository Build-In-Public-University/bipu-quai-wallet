export const STATE_KEY = 'bipu-extension-state-v1';

export const DEFAULT_STATE = Object.freeze({
  schemaVersion: 1,
  phase: 'observe',
  network: { name: 'Cyprus-1', chainId: 9 },
  selectedObject: null,
  walletConnected: false,
  permissions: { allowPageContext: false, allowMessaging: false }
});

export function mergeState(saved = {}) {
  return {
    ...DEFAULT_STATE,
    ...saved,
    network: { ...DEFAULT_STATE.network, ...(saved.network || {}) },
    permissions: { ...DEFAULT_STATE.permissions, ...(saved.permissions || {}) }
  };
}
