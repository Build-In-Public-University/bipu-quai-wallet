import { validateQuaiAddress } from './address.js';

export const INTENT_VERSION = 1;
export const SUPPORTED_NETWORKS = Object.freeze({
  'cyprus-1': Object.freeze({ chainId: '0x9', label: 'Cyprus-1' })
});
export const SUPPORTED_OPERATIONS = Object.freeze(['native-quai-transfer']);
const INTENT_FIELDS = Object.freeze(['intentVersion', 'network', 'chainId', 'operation', 'from', 'to', 'valueWei', 'data', 'sourceBlock', 'approval', 'custody']);

export function validateNativeTransferIntent(intent) {
  if (!intent || typeof intent !== 'object') throw new Error('Transaction intent is required.');
  if (Object.keys(intent).some((key) => !INTENT_FIELDS.includes(key))) throw new Error('Transaction intent contains unsupported fields.');
  if (intent.intentVersion !== INTENT_VERSION) throw new Error('Unsupported transaction intent version.');
  if (intent.operation !== 'native-quai-transfer') throw new Error('Unsupported transaction operation.');
  if (intent.network !== 'cyprus-1' || intent.chainId !== SUPPORTED_NETWORKS['cyprus-1'].chainId) throw new Error('Transaction intent network mismatch.');
  if (intent.data !== '0x') throw new Error('Only native QUAI transfers are supported.');
  if (intent.approval !== 'external-provider-required' || intent.custody !== 'bipu-never-holds-private-keys') throw new Error('Transaction intent custody boundary is invalid.');
  const normalized = createNativeTransferIntent(intent);
  if (intent.sourceBlock !== null && typeof intent.sourceBlock !== 'string') throw new Error('Invalid source block.');
  return Object.freeze({ ...normalized, sourceBlock: intent.sourceBlock ?? null });
}

export function toProviderTransaction(intent) {
  const validated = validateNativeTransferIntent(intent);
  return { from: validated.from, to: validated.to, value: validated.valueWei, data: validated.data };
}

export function createNativeTransferIntent({ network = 'cyprus-1', from, to, valueWei, sourceBlock }) {
  const config = SUPPORTED_NETWORKS[network];
  if (!config) throw new Error(`Unsupported network: ${network}`);
  const sender = validateQuaiAddress(from, { allowZero: false });
  const recipient = validateQuaiAddress(to);
  if (!/^0x[0-9a-fA-F]+$/.test(valueWei || '') || BigInt(valueWei) < 0n) throw new Error('Invalid value');
  return Object.freeze({
    intentVersion: INTENT_VERSION,
    network,
    chainId: config.chainId,
    operation: 'native-quai-transfer',
    from: sender,
    to: recipient,
    valueWei: valueWei.toLowerCase(),
    data: '0x',
    sourceBlock: sourceBlock || null,
    approval: 'external-provider-required',
    custody: 'bipu-never-holds-private-keys'
  });
}
