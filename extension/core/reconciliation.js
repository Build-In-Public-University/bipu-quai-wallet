export const RECONCILIATION_STATES = Object.freeze([
  'prepared', 'provider_accepted', 'pending_inclusion', 'included', 'confirmed',
  'failed_on_chain', 'provider_rejected', 'reconciliation_unknown', 'replaced', 'reorg_detected'
]);

export function reconcileReceipt(intent, transaction, receipt) {
  if (!transaction || !receipt) return { state: 'reconciliation_unknown', reasons: ['transaction or receipt unavailable'] };
  const reasons = [];
  if (transaction.chainId && transaction.chainId.toLowerCase() !== intent.chainId.toLowerCase()) reasons.push('chain ID mismatch');
  if (transaction.from?.toLowerCase() !== intent.from) reasons.push('sender mismatch');
  if (transaction.to?.toLowerCase() !== intent.to) reasons.push('recipient mismatch');
  if ((transaction.value || '').toLowerCase() !== intent.valueWei) reasons.push('value mismatch');
  if ((transaction.input || '0x').toLowerCase() !== intent.data) reasons.push('calldata mismatch');
  if (reasons.length) return { state: 'reconciliation_unknown', reasons };
  if (receipt.status === '0x0' || receipt.status === 0) return { state: 'failed_on_chain', reasons: ['receipt status indicates failure'] };
  if (receipt.status === '0x1' || receipt.status === 1) return { state: 'confirmed', reasons: [] };
  return { state: 'reconciliation_unknown', reasons: ['unrecognized receipt status'] };
}
