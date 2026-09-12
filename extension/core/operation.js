export const WQUAI_CONTRACT = '0x006C3e2AaAE5DB1bCd11A1a097cE572312EADdBB';
export const WQUAI_WITHDRAW_SELECTOR = '0x2e1a7d4d';

export function explainOperation({ selector, amount }) {
  const normalizedSelector = String(selector || '').trim().toLowerCase();
  const numericAmount = Number(amount);
  const known = normalizedSelector === WQUAI_WITHDRAW_SELECTOR && Number.isFinite(numericAmount) && numericAmount > 0;
  return {
    known,
    amount: known ? numericAmount : 0,
    title: known ? 'Withdraw WQUAI into native QUAI' : 'Unknown operation — re-understand required',
    intent: known ? `Convert ${numericAmount} WQUAI into ${numericAmount} native QUAI.` : 'The selector and amount do not establish a safe intent.',
    expected: known ? `WQUAI −${numericAmount} · QUAI +${numericAmount} · gas reserved` : 'No state change prediction is safe.',
    why: known ? 'The candidate matches the known WQUAI withdraw pattern.' : 'A selector alone is not enough to infer intent; the expected effect remains unknown.',
    contract: WQUAI_CONTRACT,
    selector: normalizedSelector
  };
}

export function predictOperation(input) {
  const result = explainOperation(input);
  return { result, rows: [
    { label: 'WQUAI', delta: result.known ? `−${result.amount} WQUAI` : 'unknown', certainty: result.known ? 'predicted' : 'blocked' },
    { label: 'native QUAI', delta: result.known ? `+${result.amount} QUAI` : 'unknown', certainty: result.known ? 'predicted' : 'blocked' },
    { label: 'gas', delta: result.known ? 'reserved, exact fee unknown' : 'unknown', certainty: 'uncertain' }
  ] };
}
