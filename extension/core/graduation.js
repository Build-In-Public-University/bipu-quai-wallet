export const GRADUATION_GATES = Object.freeze([
  { id: 'learner', label: 'Temporary learner issued' },
  { id: 'counterfactual', label: 'Counterfactual response recorded' },
  { id: 'cache', label: 'Familiarity invalidated after an assumption changed' }
]);

export function graduationStatus(state = {}) {
  const complete = GRADUATION_GATES.filter((gate) => Boolean(state[gate.id])).map((gate) => gate.id);
  const pending = GRADUATION_GATES.filter((gate) => !complete.includes(gate.id)).map((gate) => gate.id);
  return { complete, pending, graduated: pending.length === 0, label: pending.length === 0 ? 'UNDERSTANDING DEMONSTRATED' : 'GRADUATION INCOMPLETE' };
}
