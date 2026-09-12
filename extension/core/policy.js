export const POLICY_MESSAGES = Object.freeze([
  { id: 'm1', sender: 'current-holder', text: 'A new collector joined the test network.', holder: true, link: false, network: 'cyprus-1' },
  { id: 'm2', sender: 'current-holder', text: 'Summary: three collection notes and one shared project.', holder: true, link: false, network: 'cyprus-1' },
  { id: 'm3', sender: 'non-holder', text: 'Urgent link: claim your reward now https://example.invalid', holder: false, link: true, network: 'cyprus-1' },
  { id: 'm4', sender: 'other-network', text: 'Asset note from a different network.', holder: true, link: false, network: 'other' }
]);

export function policyDecision(message, rules) {
  const reasons = [];
  if (rules.network && message.network !== rules.network) reasons.push(`network mismatch: expected ${rules.network}`);
  if (rules.holderRequired && !message.holder) reasons.push('current holder required');
  if (rules.linksQuarantined && message.link) reasons.push('links quarantined');
  if (reasons.length) return { outcome: 'QUARANTINED', reasons };
  return { outcome: message.text.startsWith('Summary:') ? 'SUMMARIZED' : 'DELIVERED', reasons: ['no blocking rule matched'] };
}

export function policyReport(messages = POLICY_MESSAGES, rules = {}) {
  return messages.map((message) => ({ message, decision: policyDecision(message, rules) }));
}
