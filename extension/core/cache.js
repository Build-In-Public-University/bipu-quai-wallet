export const CACHE_KEY = 'bipu-known-operation-v1';

export function operationFingerprint({ contract, selector, expected }) {
  return { contract: String(contract || ''), selector: String(selector || '').toLowerCase(), expected: String(expected || '') };
}

export function compareOperation(cached, current) {
  if (!cached) return { status: 'No remembered pattern', changed: [] };
  const fields = ['contract', 'selector', 'expected'];
  const changed = fields.filter((field) => cached[field] !== current[field]);
  return changed.length ? { status: 'Re-understand required', changed } : { status: 'Recognized operation', changed: [] };
}
