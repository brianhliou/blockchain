// Mining Web Worker
// Finds a valid nonce for proof-of-work

const DIFFICULTY = 5;
const DIFFICULTY_PREFIX = '0'.repeat(DIFFICULTY);

/**
 * Computes SHA-256 hash
 */
async function computeHash(index, timestamp, data, prevHash, nonce) {
  const payload = `${index}|${timestamp}|${data}|${prevHash}|${nonce}`;
  const msgBuffer = new TextEncoder().encode(payload);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Checks if hash meets difficulty requirement
 */
function meetsProofOfWork(hash) {
  return hash.startsWith(DIFFICULTY_PREFIX);
}

/**
 * Main mining loop
 */
self.onmessage = async function(e) {
  const { index, timestamp, data, prevHash } = e.data;

  let nonce = 0;
  let hash = '';
  let attempts = 0;
  const startTime = Date.now();

  // Report progress every 10,000 attempts
  const PROGRESS_INTERVAL = 10000;

  while (true) {
    hash = await computeHash(index, timestamp, data, prevHash, nonce);
    attempts++;

    // Send progress update
    if (attempts % PROGRESS_INTERVAL === 0) {
      const elapsed = Date.now() - startTime;
      const hashRate = Math.floor(attempts / (elapsed / 1000));

      self.postMessage({
        type: 'progress',
        nonce,
        hash,
        attempts,
        hashRate,
        elapsed
      });
    }

    // Check if we found a valid hash
    if (meetsProofOfWork(hash)) {
      const elapsed = Date.now() - startTime;
      const hashRate = Math.floor(attempts / (elapsed / 1000));

      self.postMessage({
        type: 'success',
        nonce,
        hash,
        attempts,
        hashRate,
        elapsed
      });
      break;
    }

    nonce++;

    // Safety: prevent infinite loop (should never reach this with difficulty 5)
    if (nonce > 100000000) {
      self.postMessage({
        type: 'error',
        message: 'Mining timeout - nonce exceeded limit'
      });
      break;
    }
  }
};
