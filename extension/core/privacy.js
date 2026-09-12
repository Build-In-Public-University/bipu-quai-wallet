export const PRIVACY_CONTRACT = Object.freeze({
  telemetry: 'disabled-by-default',
  pageScraping: 'disabled',
  privateKeys: 'never-accessed',
  remoteAccounts: 'not-stored',
  localStorage: 'preferences-and-display-cache-only',
  rpcAddressDisclosure: 'address-is-sent-to-configured-rpc-for-requested-read',
  indexerAddressDisclosure: 'address-is-sent-to-configured-indexer-for-requested-read',
  diagnostics: 'user-initiated-and-redacted'
});

export function privacySummary() {
  return Object.freeze({ ...PRIVACY_CONTRACT });
}
