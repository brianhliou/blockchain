import { Block } from './types';
import { computeHash } from './crypto';
import { storage } from './storage';

const CHAIN_KEY = 'demo:chain';

/**
 * Gets the entire blockchain from storage
 */
export async function getChain(): Promise<Block[]> {
  const chain = await storage.get<Block[]>(CHAIN_KEY);

  // If chain doesn't exist, initialize with genesis block
  if (!chain) {
    const genesisBlock = await createGenesisBlock();
    await storage.set(CHAIN_KEY, [genesisBlock]);
    return [genesisBlock];
  }

  return chain;
}

/**
 * Creates the genesis (first) block
 * Uses a fixed timestamp to ensure consistency across restarts
 */
export async function createGenesisBlock(): Promise<Block> {
  const index = 0;
  const timestamp = '2025-01-01T00:00:00.000Z'; // Fixed timestamp for consistency
  const data = 'Genesis Block';
  const prevHash = '0';
  const nonce = 0; // Genesis block doesn't need mining

  const hash = await computeHash(index, timestamp, data, prevHash, nonce);

  return {
    index,
    timestamp,
    data,
    prevHash,
    nonce,
    hash,
  };
}

/**
 * Gets the last block in the chain
 */
export async function getLatestBlock(): Promise<Block> {
  const chain = await getChain();
  return chain[chain.length - 1];
}

/**
 * Appends a new block to the chain
 */
export async function appendBlock(block: Block): Promise<void> {
  const chain = await getChain();
  chain.push(block);
  await storage.set(CHAIN_KEY, chain);
}
