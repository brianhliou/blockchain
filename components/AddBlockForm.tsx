'use client';

import { useState, useRef, useEffect } from 'react';
import { DIFFICULTY } from '@/lib/crypto';

interface AddBlockFormProps {
  onBlockAdded: () => void;
}

interface MiningResult {
  nonce: number;
  hash: string;
  attempts: number;
  hashRate: number;
  elapsed: number;
  timestamp: string; // Store timestamp used during mining
}

export default function AddBlockForm({ onBlockAdded }: AddBlockFormProps) {
  const [data, setData] = useState('');
  const [mining, setMining] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Mining stats
  const [miningResult, setMiningResult] = useState<MiningResult | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [hashRate, setHashRate] = useState(0);
  const [currentHash, setCurrentHash] = useState('');

  const workerRef = useRef<Worker | null>(null);

  // Cleanup worker on unmount
  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  const startMining = async () => {
    if (!data.trim()) {
      setError('Please enter block data before mining');
      return;
    }

    setMining(true);
    setError('');
    setSuccess('');
    setMiningResult(null);
    setAttempts(0);
    setHashRate(0);
    setCurrentHash('');

    try {
      // Fetch latest block info
      const response = await fetch('/api/chain?limit=1&reverse=true');
      if (!response.ok) {
        throw new Error('Failed to fetch blockchain info');
      }
      const chainData = await response.json();
      const prevBlock = chainData.blocks[0];

      // Generate timestamp once for consistent hashing
      const timestamp = new Date().toISOString();

      // Create worker with cache-busting parameter
      workerRef.current = new Worker(`/workers/miner.js?v=${Date.now()}`);

      // Handle worker messages
      workerRef.current.onmessage = (e) => {
        const { type } = e.data;

        if (type === 'progress') {
          setAttempts(e.data.attempts);
          setHashRate(e.data.hashRate);
          setCurrentHash(e.data.hash);
        } else if (type === 'success') {
          // Include timestamp in result
          setMiningResult({ ...e.data, timestamp });
          setMining(false);
          workerRef.current?.terminate();
          workerRef.current = null;
        } else if (type === 'error') {
          setError(e.data.message);
          setMining(false);
          workerRef.current?.terminate();
          workerRef.current = null;
        }
      };

      // Start mining with fixed timestamp
      workerRef.current.postMessage({
        index: prevBlock.index + 1,
        timestamp,
        data: data.trim(),
        prevHash: prevBlock.hash
      });
    } catch (err) {
      setError('Failed to start mining. Please try again.');
      setMining(false);
      console.error(err);
    }
  };

  const stopMining = () => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
    setMining(false);
  };

  const submitBlock = async () => {
    if (!miningResult) {
      setError('No valid nonce found. Please mine first.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/blocks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: data.trim(),
          nonce: miningResult.nonce,
          timestamp: miningResult.timestamp
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          setError('Rate limit exceeded. Please wait before adding another block.');
        } else {
          setError(result.message || 'Failed to add block');
        }
        return;
      }

      setSuccess(`Block #${result.index} added successfully! (${miningResult.attempts.toLocaleString()} attempts, ${(miningResult.elapsed / 1000).toFixed(2)}s)`);
      setData('');
      setMiningResult(null);
      setAttempts(0);
      setHashRate(0);
      setCurrentHash('');
      onBlockAdded();
    } catch (err) {
      setError('Network error. Please try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-800 shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        ⛏️ Mine New Block
      </h2>

      <div className="space-y-4">
        {/* Data Input */}
        <div>
          <label
            htmlFor="data"
            className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
          >
            Block Data (max 1000 characters):
          </label>
          <textarea
            id="data"
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            rows={4}
            maxLength={1000}
            required
            placeholder="Enter any text data for your block..."
            disabled={mining || submitting}
          />
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {data.length} / 1000 characters
          </div>
        </div>

        {/* Mining Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
            <p className="font-semibold">Proof-of-Work Required:</p>
            <p>
              Hash must start with <code className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded font-mono">{Array(DIFFICULTY).fill('0').join('')}</code> ({DIFFICULTY} zeros)
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Your browser will compute thousands of hashes to find a valid nonce.
            </p>
          </div>
        </div>

        {/* Mining Stats */}
        {(mining || miningResult) && (
          <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {mining ? '⚡ Mining in Progress...' : '✅ Mining Complete!'}
            </h3>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-600 dark:text-gray-400">Attempts:</div>
                <div className="font-mono font-bold text-gray-900 dark:text-white">
                  {(miningResult?.attempts || attempts).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-gray-600 dark:text-gray-400">Hash Rate:</div>
                <div className="font-mono font-bold text-gray-900 dark:text-white">
                  {(miningResult?.hashRate || hashRate).toLocaleString()} H/s
                </div>
              </div>
              {miningResult && (
                <>
                  <div>
                    <div className="text-gray-600 dark:text-gray-400">Nonce Found:</div>
                    <div className="font-mono font-bold text-green-600 dark:text-green-400">
                      {miningResult.nonce.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600 dark:text-gray-400">Time:</div>
                    <div className="font-mono font-bold text-gray-900 dark:text-white">
                      {(miningResult.elapsed / 1000).toFixed(2)}s
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Current/Final Hash */}
            <div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                {mining ? 'Current Hash:' : 'Valid Hash:'}
              </div>
              <div className={`font-mono text-xs break-all p-2 rounded ${
                miningResult
                  ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}>
                {miningResult?.hash || currentHash || 'Computing...'}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {!mining && !miningResult && (
            <button
              onClick={startMining}
              disabled={!data.trim() || submitting}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <span>⛏️</span>
              <span>Start Mining</span>
            </button>
          )}

          {mining && (
            <button
              onClick={stopMining}
              className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <span>⏹</span>
              <span>Stop Mining</span>
            </button>
          )}

          {miningResult && (
            <>
              <button
                onClick={() => {
                  setMiningResult(null);
                  setAttempts(0);
                  setHashRate(0);
                  setCurrentHash('');
                }}
                disabled={submitting}
                className="px-6 py-3 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
              >
                Mine Again
              </button>
              <button
                onClick={submitBlock}
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <span>✓</span>
                    <span>Submit Block</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>

        {/* Messages */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-300 text-sm">
            {success}
          </div>
        )}
      </div>
    </div>
  );
}
