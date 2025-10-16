export interface Block {
  index: number;
  timestamp: string; // ISO 8601 format
  data: string;
  prevHash: string;
  nonce: number; // Proof-of-work nonce
  hash: string;
}
