'use client';

import { Block } from '@/lib/types';
import { useState, useEffect } from 'react';

interface BlockchainViewPaginatedProps {
  initialBlocks: Block[];
  totalBlocks: number;
}

export default function BlockchainViewPaginated({
  initialBlocks,
  totalBlocks
}: BlockchainViewPaginatedProps) {
  const BLOCKS_PER_PAGE = 10;

  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [expandedBlocks, setExpandedBlocks] = useState<Set<number>>(new Set());

  // Update blocks when initialBlocks changes (e.g., after adding a new block)
  useEffect(() => {
    setBlocks(initialBlocks);
  }, [initialBlocks]);

  const latestBlock = blocks[0]; // Assuming blocks are in reverse order (newest first)
  const olderBlocks = blocks.slice(1);

  const totalPages = Math.ceil((totalBlocks - 1) / BLOCKS_PER_PAGE); // -1 because latest is shown separately

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

  const loadPage = async (page: number) => {
    setLoading(true);
    try {
      // Calculate offset: page 1 shows blocks 0-10 (latest + 10 recent)
      // page 2 shows blocks 11-20, page 3 shows blocks 21-30, etc.
      const offset = (page - 1) * BLOCKS_PER_PAGE;

      const response = await fetch(
        `/api/chain?limit=${BLOCKS_PER_PAGE + 1}&offset=${offset}&reverse=true`
      );

      if (!response.ok) throw new Error('Failed to fetch blocks');

      const data = await response.json();
      setBlocks(data.blocks);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error loading page:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderBlock = (block: Block, isLatest = false) => {
    const isExpanded = expandedBlocks.has(block.index);

    return (
      <div
        key={block.index}
        className={`border rounded-lg p-6 shadow-md ${
          isLatest
            ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800'
        }`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {isLatest && (
              <span className="px-3 py-1 text-sm font-bold bg-blue-600 text-white rounded-full">
                LATEST
              </span>
            )}
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
                Nonce:
              </div>
              <div className="text-orange-600 dark:text-orange-400 bg-gray-50 dark:bg-gray-900 p-2 rounded font-mono text-sm">
                {block.nonce.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
                Timestamp:
              </div>
              <div className="text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-900 p-2 rounded font-mono text-xs break-all">
                {block.timestamp}
              </div>
            </div>
          </div>

          {isExpanded && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
                🔍 Hash Verification Details
              </h4>

              <div className="space-y-3">
                <div>
                  <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    Previous Hash:
                  </div>
                  <div className="text-purple-600 dark:text-purple-400 bg-gray-50 dark:bg-gray-900 p-2 rounded font-mono text-xs break-all">
                    {block.prevHash}
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
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Blockchain Explorer
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {totalBlocks.toLocaleString()} blocks • Showing newest first
          </p>
        </div>
      </div>

      {/* Latest Block - Prominently Displayed */}
      {latestBlock && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Latest Block
          </h3>
          {renderBlock(latestBlock, true)}
        </div>
      )}

      {/* Recent Blocks */}
      {olderBlocks.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Recent Blocks
          </h3>
          <div className="space-y-4">
            {olderBlocks.map(block => renderBlock(block))}
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => loadPage(currentPage - 1)}
            disabled={currentPage === 1 || loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <span className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => loadPage(currentPage + 1)}
            disabled={currentPage === totalPages || loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {loading && (
        <div className="text-center py-8">
          <div className="text-gray-600 dark:text-gray-400">Loading blocks...</div>
        </div>
      )}
    </div>
  );
}
