export const PHASES = Object.freeze(['observe', 'understand', 'network', 'practice', 'graduate']);
const MESSAGE_TYPES = Object.freeze(['GET_STATE', 'SET_PHASE', 'OBSERVE_ADDRESS', 'CONNECT_PROVIDER', 'SEND_TRANSACTION', 'ASK_QUAI', 'REMEMBER_OPERATION', 'VALIDATE_OPERATION', 'NFT_HOLDERS', 'OPEN_SIDE_PANEL']);

function exactKeys(message, allowed) {
  return Object.keys(message).every((key) => allowed.includes(key));
}

export function validateRuntimeMessage(message) {
  if (!message || typeof message !== 'object' || Array.isArray(message) || typeof message.type !== 'string') throw new Error('Malformed runtime message.');
  if (!MESSAGE_TYPES.includes(message.type)) throw new Error('Unknown runtime message type.');
  const common = ['type'];
  if (message.type === 'GET_STATE' || message.type === 'CONNECT_PROVIDER' || message.type === 'OPEN_SIDE_PANEL') {
    if (!exactKeys(message, common)) throw new Error('Runtime message contains unsupported fields.');
  } else if (message.type === 'SET_PHASE') {
    if (!exactKeys(message, [...common, 'phase']) || !PHASES.includes(message.phase)) throw new Error('Runtime phase is not allowed.');
  } else if (message.type === 'OBSERVE_ADDRESS') {
    if (!exactKeys(message, [...common, 'address']) || typeof message.address !== 'string') throw new Error('Invalid observation message.');
  } else if (message.type === 'SEND_TRANSACTION') {
    if (!exactKeys(message, [...common, 'intent']) || !message.intent || typeof message.intent !== 'object') throw new Error('Invalid transaction message.');
  } else if (message.type === 'ASK_QUAI') {
    if (!exactKeys(message, [...common, 'question', 'selector', 'wquaiBalance']) || typeof message.question !== 'string') throw new Error('Invalid Ask Quai message.');
  } else if (message.type === 'REMEMBER_OPERATION' || message.type === 'VALIDATE_OPERATION') {
    if (!exactKeys(message, [...common, 'operation']) || !message.operation || typeof message.operation !== 'object') throw new Error('Invalid operation message.');
  } else if (message.type === 'NFT_HOLDERS') {
    if (!exactKeys(message, [...common, 'contract', 'tokenId']) || typeof message.contract !== 'string' || typeof message.tokenId !== 'string') throw new Error('Invalid NFT message.');
  }
  return Object.freeze(message);
}
