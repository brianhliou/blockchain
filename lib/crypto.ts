import { Block } from './types';

// Proof-of-work difficulty: hash must start with this many zeros
export const DIFFICULTY = 5;
export const DIFFICULTY_PREFIX = '0'.repeat(DIFFICULTY);

/**
 * Computes SHA-256 hash for a block including nonce
 * Hash = sha256(index | timestamp | data | prevHash | nonce)
 */
export async function computeHash(
  index: number,
  timestamp: string,
  data: string,
  prevHash: string,
  nonce: number
): Promise<string> {
  const payload = `${index}|${timestamp}|${data}|${prevHash}|${nonce}`;
  const msgBuffer = new TextEncoder().encode(payload);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Checks if a hash meets the proof-of-work difficulty requirement
 */
export function meetsProofOfWork(hash: string): boolean {
  return hash.startsWith(DIFFICULTY_PREFIX);
}

/**
 * Validates that a block's hash is correct
 */
export async function isBlockValid(block: Block): Promise<boolean> {
  const expectedHash = await computeHash(
    block.index,
    block.timestamp,
    block.data,
    block.prevHash,
    block.nonce
  );
  return block.hash === expectedHash;
}

/**
 * Validates that a new block correctly links to the previous block
 * and meets proof-of-work requirements
 */
export async function isBlockChainValid(
  newBlock: Block,
  prevBlock: Block
): Promise<boolean> {
  // Check index is incremental
  if (newBlock.index !== prevBlock.index + 1) {
    return false;
  }

  // Check prevHash matches
  if (newBlock.prevHash !== prevBlock.hash) {
    return false;
  }

  // Check hash is valid
  const isValid = await isBlockValid(newBlock);
  if (!isValid) {
    return false;
  }

  // Check proof-of-work
  if (!meetsProofOfWork(newBlock.hash)) {
    return false;
  }

  return true;
}
