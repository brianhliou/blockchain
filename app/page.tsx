'use client';

import { useEffect, useState, useCallback } from 'react';
import { Block } from '@/lib/types';
import BlockchainViewPaginated from '@/components/BlockchainViewPaginated';
import AddBlockForm from '@/components/AddBlockForm';

const INITIAL_BLOCKS_TO_FETCH = 11; // Latest + 10 recent

export default function Home() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [totalBlocks, setTotalBlocks] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showExplainer, setShowExplainer] = useState(false);

  const fetchChain = useCallback(async () => {
    try {
      const response = await fetch(`/api/chain?limit=${INITIAL_BLOCKS_TO_FETCH}&reverse=true`);
      if (!response.ok) {
        throw new Error('Failed to fetch blockchain');
      }
      const data = await response.json();
      setBlocks(data.blocks);
      setTotalBlocks(data.pagination.total);
      setError('');
    } catch (err) {
      setError('Failed to load blockchain. Please refresh the page.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChain();
  }, [fetchChain]);

  const handleBlockAdded = () => {
    fetchChain();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header with Inline Explainer Toggle */}
        <header className="mb-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-2">
                Blockchain Demo
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                An interactive demonstration of blockchain technology
              </p>
            </div>
            <button
              onClick={() => setShowExplainer(!showExplainer)}
              className="flex-shrink-0 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 border border-blue-600 dark:border-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              aria-expanded={showExplainer}
            >
              {showExplainer ? '✕ Close Guide' : '? How it Works'}
            </button>
          </div>

          {/* Collapsible Explainer */}
          {showExplainer && (
            <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800 animate-fadeIn">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                How This Blockchain Works
              </h2>
              <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Block Structure</h3>
                  <p className="mb-2">Each block contains the following fields:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong>Index:</strong> Position in the chain (0, 1, 2, ...)</li>
                    <li><strong>Timestamp:</strong> ISO 8601 format (e.g., 2025-01-01T00:00:00.000Z)</li>
                    <li><strong>Data:</strong> Your message or transaction data</li>
                    <li><strong>Previous Hash:</strong> Links to the previous block (64-char hex)</li>
                    <li><strong>Nonce:</strong> Proof-of-work number (mining result)</li>
                    <li><strong>Hash:</strong> SHA-256 fingerprint of all above fields</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Hash Computation</h3>
                  <p className="mb-2">The hash is computed using SHA-256:</p>
                  <div className="bg-white dark:bg-gray-900 p-3 rounded border border-gray-200 dark:border-gray-700 font-mono text-xs overflow-x-auto">
                    <div>hash = SHA-256(</div>
                    <div className="ml-4">index + &quot;|&quot; +</div>
                    <div className="ml-4">timestamp + &quot;|&quot; +</div>
                    <div className="ml-4">data + &quot;|&quot; +</div>
                    <div className="ml-4">prevHash + &quot;|&quot; +</div>
                    <div className="ml-4">nonce</div>
                    <div>)</div>
                  </div>
                  <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                    The &quot;|&quot; is a pipe character used as a separator, not an OR operation.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Proof-of-Work Mining</h3>
                  <p className="mb-2">
                    To add a block, you must find a <strong>nonce</strong> that makes the hash start with
                    five zeros (00000...). Your browser tries nonce values starting from 0 until it finds one that works:
                  </p>
                  <div className="bg-white dark:bg-gray-900 p-3 rounded border border-gray-200 dark:border-gray-700 font-mono text-xs space-y-1">
                    <div>nonce=0 → hash=cd382f... ❌</div>
                    <div>nonce=1 → hash=9a3c5d... ❌</div>
                    <div>nonce=2 → hash=7e2f4a... ❌</div>
                    <div>...</div>
                    <div className="text-green-600 dark:text-green-400">nonce=2456891 → hash=00000a... ✅</div>
                  </div>
                  <p className="mt-2">
                    This computational work makes the blockchain secure and tamper-resistant.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Chain Immutability</h3>
                  <p>
                    Each block&apos;s hash includes the previous block&apos;s hash. Changing any past block would:
                  </p>
                  <ol className="list-decimal list-inside space-y-1 ml-4 mt-2">
                    <li>Change that block&apos;s hash</li>
                    <li>Break the link to the next block</li>
                    <li>Require re-mining all subsequent blocks</li>
                  </ol>
                  <p className="mt-2">This makes tampering computationally infeasible.</p>
                </div>

                <div className="pt-3 border-t border-blue-200 dark:border-blue-700">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    💡 <strong>Tip:</strong> All values shown in the blocks below can be used to independently
                    verify the hash using any SHA-256 calculator. The precise ISO timestamp format is preserved
                    for verification.
                  </p>
                </div>
              </div>
            </div>
          )}
        </header>

        {/* Add Block Form */}
        <section className="mb-8">
          <AddBlockForm onBlockAdded={handleBlockAdded} />
        </section>

        {/* Blockchain Display */}
        <section>
          {loading && (
            <div className="text-center py-12">
              <div className="text-gray-600 dark:text-gray-400">Loading blockchain...</div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          {!loading && !error && blocks.length > 0 && (
            <BlockchainViewPaginated initialBlocks={blocks} totalBlocks={totalBlocks} />
          )}
        </section>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-500 dark:text-gray-500">
          <p>
            Educational demo • Blockchain resets periodically • Rate limited to 5 blocks per minute
          </p>
          <p className="mt-2 text-xs">
            Built with Next.js • In-memory storage (no database) • <a href="https://github.com/YOUR_USERNAME/YOUR_REPO" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">View Source</a>
          </p>
        </footer>
      </div>
    </div>
  );
}
