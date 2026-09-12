export const LEARNER_ID = 'Learner #LOCAL-001';

export const PRACTICE_STEPS = Object.freeze([
  ['01', 'Credential issued locally', 'Not minted. Not transferable. Resettable.'],
  ['02', 'Simulated network entered', 'Practice access rules without real membership.'],
  ['03', 'Red-team message inspected', 'Identify urgency, links, and sender claims.'],
  ['04', 'Routing decision explained', 'Quarantine before any external action.']
]);

export function issueLearner() { return { id: LEARNER_ID, issued: true, localOnly: true }; }

export function routePracticeMessage(message = { sender: 'urgency sender', hasLink: true }) {
  const reasons = [];
  if (message.hasLink) reasons.push('external link');
  if (message.sender === 'urgency sender') reasons.push('urgency sender');
  return { outcome: reasons.length ? 'QUARANTINED' : 'INSPECTED', reasons, sent: false, external: false };
}
