export const DEFAULT_TIMEOUT_MS = 8000;

export async function fetchJson(url, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw new Error('Response was not a JSON object.');
    return payload;
  } catch (error) {
    if (error.name === 'AbortError') throw new Error(`Request timed out after ${timeoutMs}ms.`);
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export async function rpcRequest(url, method, params = [], timeoutMs = DEFAULT_TIMEOUT_MS) {
  const payload = await fetchJson(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', method, params, id: Date.now() }) }, timeoutMs);
  if (payload.jsonrpc !== '2.0' || !Object.prototype.hasOwnProperty.call(payload, 'id')) throw new Error('Malformed JSON-RPC response.');
  if (payload.error && typeof payload.error === 'object') throw new Error(payload.error.message || 'Quai RPC error');
  if (!Object.prototype.hasOwnProperty.call(payload, 'result')) throw new Error('JSON-RPC result is missing.');
  return payload.result;
}

export async function indexerRequest(url, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const payload = await fetchJson(url, {}, timeoutMs);
  if (!Object.prototype.hasOwnProperty.call(payload, 'result')) throw new Error('Indexer result is missing.');
  if (payload.status === '0') throw new Error(payload.message || 'Indexer returned no data.');
  if (!Array.isArray(payload.result)) throw new Error('Indexer result is not an array.');
  return payload.result;
}
