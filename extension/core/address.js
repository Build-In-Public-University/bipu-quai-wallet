import { keccak256 } from '../vendor/js-sha3-0.13.0.mjs';

const ADDRESS_PATTERN = /^0x[0-9a-fA-F]{40}$/;

export function formatQuaiChecksumAddress(address) {
  if (typeof address !== 'string' || !ADDRESS_PATTERN.test(address)) throw new Error('Address must contain 40 hexadecimal characters.');
  const chars = address.slice(2).toLowerCase().split('');
  const hash = keccak256(chars.join(''));
  for (let i = 0; i < 40; i++) if (parseInt(hash[i], 16) >= 8) chars[i] = chars[i].toUpperCase();
  return `0x${chars.join('')}`;
}

export function isQuaiAddress(address) {
  if (typeof address !== 'string' || !ADDRESS_PATTERN.test(address)) return false;
  const secondByte = Number.parseInt(address.slice(4, 6), 16);
  return (secondByte & 0x80) === 0;
}

export function validateQuaiAddress(address, { allowZero = true } = {}) {
  if (typeof address !== 'string' || !ADDRESS_PATTERN.test(address)) throw new Error('Address must contain 40 hexadecimal characters.');
  if (!isQuaiAddress(address)) throw new Error('Invalid Quai address or Qi-ledger address.');
  if (!allowZero && /^0x0{40}$/i.test(address)) throw new Error('Zero address cannot be a sender.');
  const checksum = formatQuaiChecksumAddress(address);
  const mixedCase = /[a-f].*[A-F]|[A-F].*[a-f]/.test(address.slice(2));
  if (mixedCase && checksum !== address) throw new Error('Invalid Quai address checksum.');
  return checksum;
}
