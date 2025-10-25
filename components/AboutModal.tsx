'use client';

import { useEffect } from 'react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              How This Blockchain Works
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-6 space-y-6 text-gray-700 dark:text-gray-300">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Block Structure</h3>
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
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Hash Computation</h3>
              <p className="mb-2">The hash is computed using SHA-256:</p>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded border border-gray-200 dark:border-gray-700 font-mono text-xs overflow-x-auto">
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
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Proof-of-Work Mining</h3>
              <p className="mb-2">
                To add a block, you must find a <strong>nonce</strong> that makes the hash start with
                five zeros (00000...). Your browser tries nonce values starting from 0 until it finds one that works:
              </p>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded border border-gray-200 dark:border-gray-700 font-mono text-xs space-y-1">
                <div>nonce=0 → hash=cd382f... ❌</div>
                <div>nonce=1 → hash=9a3c5d... ❌</div>
                <div>nonce=2 → hash=7e2f4a... ❌</div>
                <div>...</div>
                <div className="text-green-600 dark:text-green-400">nonce=2456891 → hash=00000a... ✅</div>
              </div>
              <p className="mt-3">
                This computational work makes the blockchain secure and tamper-resistant.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Chain Immutability</h3>
              <p className="mb-2">
                Each block&apos;s hash includes the previous block&apos;s hash. Changing any past block would:
              </p>
              <ol className="list-decimal list-inside space-y-1 ml-4">
                <li>Change that block&apos;s hash</li>
                <li>Break the link to the next block</li>
                <li>Require re-mining all subsequent blocks</li>
              </ol>
              <p className="mt-3">This makes tampering computationally infeasible.</p>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                💡 <strong>Tip:</strong> All values shown in the blocks can be used to independently
                verify the hash using any SHA-256 calculator. The precise ISO timestamp format is preserved
                for verification.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
