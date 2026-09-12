export const INTENT_VERSION = 1;
export const SUPPORTED_NETWORKS = Object.freeze({
  'cyprus-1': Object.freeze({ chainId: '0x9', label: 'Cyprus-1' })
});
export const SUPPORTED_OPERATIONS = Object.freeze(['native-quai-transfer']);

export function createNativeTransferIntent({ network = 'cyprus-1', from, to, valueWei, sourceBlock }) {
  const config = SUPPORTED_NETWORKS[network];
  if (!config) throw new Error(`Unsupported network: ${network}`);
  if (!/^0x[0-9a-fA-F]{40}$/.test(from || '')) throw new Error('Invalid sender address');
  if (!/^0x[0-9a-fA-F]{40}$/.test(to || '')) throw new Error('Invalid recipient address');
  if (!/^0x[0-9a-fA-F]+$/.test(valueWei || '') || BigInt(valueWei) < 0n) throw new Error('Invalid value');
  return Object.freeze({
    intentVersion: INTENT_VERSION,
    network,
    chainId: config.chainId,
    operation: 'native-quai-transfer',
    from: from.toLowerCase(),
    to: to.toLowerCase(),
    valueWei: valueWei.toLowerCase(),
    data: '0x',
    sourceBlock: sourceBlock || null,
    approval: 'external-provider-required',
    custody: 'bipu-never-holds-private-keys'
  });
}
