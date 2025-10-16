'use client';

import { Block } from '@/lib/types';
import { useState } from 'react';

interface BlockchainViewProps {
  chain: Block[];
}

export default function BlockchainView({ chain }: BlockchainViewProps) {
  const [expandedBlocks, setExpandedBlocks] = useState<Set<number>>(new Set());

  const toggleBlockExpansion = (index: number) => {
    setExpandedBlocks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        Current Blockchain
      </h2>
      <div className="space-y-4">
        {chain.map((block, idx) => {
          const isExpanded = expandedBlocks.has(block.index);
          return (
            <div
              key={block.index}
              className="border border-gray-300 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-800 shadow-md"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    #{block.index}
                  </div>
                  {block.index === 0 && (
                    <span className="px-2 py-1 text-xs font-semibold bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
                      GENESIS
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    {new Date(block.timestamp).toLocaleString()}
                  </div>
                  <button
                    onClick={() => toggleBlockExpansion(block.index)}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {isExpanded ? '▼ Hide Details' : '▶ Show Verification'}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    Data:
                  </div>
                  <div className="text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-900 p-3 rounded font-mono text-sm break-all">
                    {block.data}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    Hash:
                  </div>
                  <div className="text-green-600 dark:text-green-400 bg-gray-50 dark:bg-gray-900 p-3 rounded font-mono text-xs break-all">
                    {block.hash}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    Previous Hash:
                  </div>
                  <div className="text-purple-600 dark:text-purple-400 bg-gray-50 dark:bg-gray-900 p-3 rounded font-mono text-xs break-all">
                    {block.prevHash}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    Nonce (Proof-of-Work):
                  </div>
                  <div className="text-orange-600 dark:text-orange-400 bg-gray-50 dark:bg-gray-900 p-3 rounded font-mono text-sm">
                    {block.nonce.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Expanded Verification Section */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
                    🔍 Hash Verification Details
                  </h4>

                  <div className="space-y-3">
                    <div>
                      <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-2">
                        Precise Timestamp (ISO 8601):
                        <button
                          onClick={() => copyToClipboard(block.timestamp)}
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                          title="Copy to clipboard"
                        >
                          📋
                        </button>
                      </div>
                      <div className="text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-900 p-2 rounded font-mono text-xs break-all">
                        {block.timestamp}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                        Hash Input String:
                      </div>
                      <div className="text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-900 p-3 rounded font-mono text-xs break-all border border-gray-200 dark:border-gray-700">
                        <div className="space-y-1">
                          <div><span className="text-blue-600 dark:text-blue-400">{block.index}</span> <span className="text-gray-400">|</span></div>
                          <div><span className="text-blue-600 dark:text-blue-400">{block.timestamp}</span> <span className="text-gray-400">|</span></div>
                          <div><span className="text-blue-600 dark:text-blue-400">{block.data}</span> <span className="text-gray-400">|</span></div>
                          <div><span className="text-blue-600 dark:text-blue-400 break-all">{block.prevHash}</span> <span className="text-gray-400">|</span></div>
                          <div><span className="text-blue-600 dark:text-blue-400">{block.nonce}</span></div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                        Concatenated String (for SHA-256):
                        <button
                          onClick={() => copyToClipboard(`${block.index}|${block.timestamp}|${block.data}|${block.prevHash}|${block.nonce}`)}
                          className="ml-2 text-blue-600 dark:text-blue-400 hover:underline"
                          title="Copy to clipboard"
                        >
                          📋 Copy
                        </button>
                      </div>
                      <div className="text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-900 p-2 rounded font-mono text-xs break-all max-h-32 overflow-y-auto">
                        {`${block.index}|${block.timestamp}|${block.data}|${block.prevHash}|${block.nonce}`}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                        Expected Hash (SHA-256 of above):
                      </div>
                      <div className="text-green-600 dark:text-green-400 bg-gray-50 dark:bg-gray-900 p-2 rounded font-mono text-xs break-all">
                        {block.hash}
                      </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-3">
                      <p className="text-xs text-gray-700 dark:text-gray-300">
                        💡 <strong>Verify yourself:</strong> Copy the concatenated string above and paste it into any
                        online SHA-256 calculator (e.g., <a href="https://emn178.github.io/online-tools/sha256.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">this one</a>).
                        The result should match the hash shown above.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {idx < chain.length - 1 && (
                <div className="mt-4 flex justify-center">
                  <div className="text-2xl text-gray-400 dark:text-gray-600">
                    ↓
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
