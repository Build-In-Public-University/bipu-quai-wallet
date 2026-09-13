export function validateProviderContext(context, intent) {
  if (!context || typeof context !== 'object') throw new Error('Provider context is unavailable.');
  if (!intent || typeof intent !== 'object') throw new Error('Transaction intent is unavailable.');
  if (String(context.chainId || '').toLowerCase() !== String(intent.chainId || '').toLowerCase()) {
    throw new Error('Provider network does not match transaction intent.');
  }
  if (!Array.isArray(context.accounts) || !context.accounts.some((account) => String(account).toLowerCase() === String(intent.from).toLowerCase())) {
    throw new Error('Provider account does not match transaction intent sender.');
  }
  if (!context.provider || !['pelagus', 'ethereum'].includes(context.provider)) {
    throw new Error('Provider identity is unavailable.');
  }
  return Object.freeze({ provider: context.provider, chainId: intent.chainId, account: intent.from });
}
