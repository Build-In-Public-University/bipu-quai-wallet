const MAX_DECIMALS = 18;

export function parseQuaiAmount(value) {
  const text = String(value ?? '').trim();
  if (!/^(?:0|[1-9]\d*)(?:\.\d{1,18})?$/.test(text)) {
    throw new Error('Amount must be a non-negative decimal QUAI value with at most 18 decimals.');
  }
  const [whole, fraction = ''] = text.split('.');
  const padded = fraction.padEnd(MAX_DECIMALS, '0');
  return {
    input: text,
    valueWei: BigInt(`${whole}${padded}`),
    decimals: MAX_DECIMALS
  };
}
