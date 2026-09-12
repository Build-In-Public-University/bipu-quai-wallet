export function validateNftRequest(contract, tokenId) {
  const normalized = String(contract || '').trim();
  const id = String(tokenId || '').trim();
  if (!/^0x[a-fA-F0-9]{40}$/.test(normalized)) throw new Error('NFT contract must be a 20-byte hexadecimal address.');
  if (!/^\d+$/.test(id)) throw new Error('NFT token ID must be a non-negative integer.');
  return { contract: normalized, tokenId: id };
}

export function holderResult(records) {
  if (!Array.isArray(records) || records.length === 0) return { found: false, holders: [], message: 'No current indexer records returned. No holder conclusion is available.' };
  return { found: true, holders: records, message: 'Current holder/indexer data only. This is not a social graph, proof of physical presence, or permission to contact holders.' };
}
