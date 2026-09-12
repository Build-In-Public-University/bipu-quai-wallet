const UNSUPPORTED = 'No bounded answer is available from the current wallet context.';

export function answerQuestion(question, context = {}) {
  const text = String(question || '').trim().toLowerCase();
  const hasWquai = text.includes('wquai') || text.includes('wrapped quai');
  const asksWhy = text.includes('why') && (text.includes('have') || text.includes('hold') || text.includes('balance'));
  const asksWithdraw = text.includes('withdraw') || text.includes('unwrap');
  if (hasWquai && asksWhy) return { supported: true, question, evidence: [{ type: 'ON-CHAIN FACT', text: `The observed state contains ${context.wquaiBalance || 'a'} WQUAI balance.` }, { type: 'ECOSYSTEM SOURCE', text: 'WQUAI is the wrapped representation used for token-style contract interactions.' }, { type: 'MODEL INTERPRETATION', text: 'A prior interaction, receipt, bridge, or transfer may explain its presence; this observer cannot identify which without a provenance record.' }] };
  if (hasWquai && asksWithdraw) return { supported: true, question, evidence: [{ type: 'ON-CHAIN FACT', text: `The selected operation is ${context.selector || 'not specified'}.` }, { type: 'ECOSYSTEM SOURCE', text: 'The teaching candidate is withdraw(uint256), which may convert wrapped units back toward native QUAI.' }, { type: 'MODEL INTERPRETATION', text: 'Treat this as an explanation candidate, not proof that the contract, selector, caller, allowance, or outcome is valid.' }] };
  return { supported: false, question, evidence: [{ type: 'UNCERTAINTY', text: UNSUPPORTED }] };
}

export { UNSUPPORTED };
