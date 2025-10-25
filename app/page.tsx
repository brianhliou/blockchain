'use client';

import { useEffect, useState, useCallback } from 'react';
import { Block } from '@/lib/types';
import BlockchainViewPaginated from '@/components/BlockchainViewPaginated';
import AddBlockForm from '@/components/AddBlockForm';
import Header from '@/components/Header';
import AboutModal from '@/components/AboutModal';

const INITIAL_BLOCKS_TO_FETCH = 11; // Latest + 10 recent

export default function Home() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [totalBlocks, setTotalBlocks] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showHowItWorks, setShowHowItWorks] = useState(false);

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
      <Header />
      <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Add Block Form */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Mine New Block
            </h2>
            <button
              onClick={() => setShowHowItWorks(true)}
              className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 border border-blue-600 dark:border-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex-shrink-0"
            >
              ? How it Works
            </button>
          </div>
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
            Built with Next.js • In-memory storage (no database)
          </p>
        </footer>
      </div>

      <AboutModal isOpen={showHowItWorks} onClose={() => setShowHowItWorks(false)} />
    </div>
  );
}
