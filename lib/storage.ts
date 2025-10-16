/**
 * Storage adapter that works with both Vercel KV and in-memory fallback
 * Automatically uses in-memory storage when KV credentials are missing
 */

import { kv } from '@vercel/kv';

// In-memory storage for local development
const memoryStore = new Map<string, unknown>();

/**
 * Check if KV credentials are available
 */
function hasKVCredentials(): boolean {
  return !!(
    process.env.KV_REST_API_URL &&
    process.env.KV_REST_API_TOKEN
  );
}

/**
 * Storage adapter that uses KV when available, otherwise falls back to memory
 */
export const storage = {
  async get<T>(key: string): Promise<T | null> {
    if (hasKVCredentials()) {
      try {
        return await kv.get<T>(key);
      } catch (error) {
        console.error('KV get error, falling back to memory:', error);
      }
    }

    // Fallback to in-memory storage
    const value = memoryStore.get(key);
    return value !== undefined ? (value as T) : null;
  },

  async set(key: string, value: unknown): Promise<void> {
    if (hasKVCredentials()) {
      try {
        await kv.set(key, value);
        return;
      } catch (error) {
        console.error('KV set error, falling back to memory:', error);
      }
    }

    // Fallback to in-memory storage
    memoryStore.set(key, value);
  },

  // For development: check which storage is being used
  getStorageType(): string {
    return hasKVCredentials() ? 'Vercel KV' : 'In-Memory (Local Dev)';
  }
};

// Log storage type on initialization
if (typeof window === 'undefined') {
  console.log(`🗄️  Storage: ${storage.getStorageType()}`);
}
