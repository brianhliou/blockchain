# Blockchain Demo

An interactive, educational blockchain demonstration built with Next.js 15 and deployed on Vercel.

🔗 **[Live Demo](https://blockchain-mining.vercel.app/)** - Try mining your own blocks!

## Features

- ⛏️ **Proof-of-Work Mining**: Browser-based mining with Web Workers (5 leading zeros)
- 🔗 **Blockchain Explorer**: Paginated view with detailed hash verification
- 📊 **Real-time Stats**: See mining attempts, hash rate, and nonce discovery
- 🔍 **Hash Verification**: Copy and verify hashes with external SHA-256 calculators
- 🌙 **Dark Mode**: Automatic dark/light theme switching
- ⚡ **Rate Limiting**: IP-based protection (5 blocks per minute)
- 💾 **In-Memory Storage**: Ephemeral blockchain (resets on deployment)

## Tech Stack

- **Framework**: Next.js 15 (App Router + TypeScript)
- **Runtime**: Node.js (for in-memory storage)
- **Mining**: Web Workers (background thread)
- **Crypto**: Web Crypto API (SHA-256)
- **Rate Limiting**: @upstash/ratelimit (in-memory fallback)
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## Local Development

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev

# Open http://localhost:3000
```

The blockchain uses **in-memory storage** and resets when the server restarts. This is intentional for the demo.

### Optional: Persistent Storage

If you want data to persist locally, set up Vercel KV credentials:

```bash
# Create .env.local
KV_REST_API_URL=your_url
KV_REST_API_TOKEN=your_token
```

See [LOCAL_DEV.md](./LOCAL_DEV.md) for detailed setup instructions.

## Deployment

### Deploy to Vercel (No Database Required)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

```bash
# Deploy with Vercel CLI
vercel
```

**No environment variables needed!** The app runs with in-memory storage by default. The blockchain will reset on each deployment or server restart - this is intentional for an ephemeral demo.

### Optional: Add Persistence

If you want a persistent public blockchain:

1. Create a Vercel KV database in your project dashboard
2. Vercel will automatically inject the KV environment variables
3. Redeploy - your blockchain will now persist

⚠️ **Warning**: Public persistence requires content moderation.

## Architecture

### Data Model

```typescript
interface Block {
  index: number;
  timestamp: string;  // ISO 8601
  data: string;
  prevHash: string;
  nonce: number;      // Proof-of-work
  hash: string;
}
```

### Hash Computation

```
hash = SHA-256(index | timestamp | data | prevHash | nonce)
```

### Proof-of-Work

- **Difficulty**: 5 leading zeros (configurable in `lib/crypto.ts`)
- **Average attempts**: ~1 million hashes
- **Mining time**: 1-2 seconds on modern hardware
- **Implementation**: Web Worker (non-blocking)

### API Endpoints

| Route | Method | Description |
|-------|--------|-------------|
| `/api/chain` | GET | Returns blockchain with pagination (`?limit=10&offset=0&reverse=true`) |
| `/api/blocks` | POST | Validates and adds a mined block (requires valid nonce) |

### Validation Rules

1. **Data Validation**:
   - Must be non-empty string
   - Maximum 1000 characters

2. **Block Validation**:
   - Index must increment by 1
   - Previous hash must match
   - Hash must be correctly computed

3. **Rate Limiting**:
   - 5 requests per 60 seconds per IP
   - Returns 429 status when exceeded

## Project Structure

```
blockchain/
├── app/
│   ├── api/
│   │   ├── blocks/route.ts         # POST /api/blocks
│   │   └── chain/route.ts          # GET /api/chain
│   ├── layout.tsx                  # Root layout + metadata
│   ├── page.tsx                    # Main UI
│   └── icon.svg                    # Blockchain favicon
├── components/
│   ├── AddBlockForm.tsx            # Mining interface
│   └── BlockchainViewPaginated.tsx # Paginated chain explorer
├── lib/
│   ├── crypto.ts                   # SHA-256 + validation
│   ├── storage.ts                  # KV/in-memory adapter
│   ├── kv.ts                       # Blockchain operations
│   ├── ratelimit.ts                # Rate limiting
│   └── types.ts                    # TypeScript types
├── public/
│   └── workers/
│       └── miner.js                # Web Worker for mining
└── README.md
```

## How It Works

1. **Genesis Block**: Created automatically with fixed timestamp on first load
2. **User Input**: Enter block data (max 1000 characters)
3. **Mining**: Web Worker tries nonces until finding hash with 5 leading zeros
4. **Submit**: Browser sends `{data, nonce, timestamp}` to server
5. **Validation**: Server recomputes hash and validates proof-of-work
6. **Append**: Valid block added to chain
7. **Display**: UI updates to show new latest block

## Educational Notes

This demonstrates **core blockchain concepts** but simplifies for learning:

**What's Included:**
- ✅ Proof-of-Work mining (SHA-256)
- ✅ Chain immutability (linked hashes)
- ✅ Block validation
- ✅ Nonce discovery

**What's Different from Bitcoin/Ethereum:**
- ❌ No distributed network (single server)
- ❌ No mining rewards/incentives
- ❌ No transactions or wallets
- ❌ No Merkle trees
- ❌ No difficulty adjustment
- ❌ No peer discovery/consensus

## Future Enhancement Ideas

- [ ] Chain statistics dashboard (total blocks, average mining time)
- [ ] Block search/filter
- [ ] Export chain as JSON
- [ ] Difficulty adjustment visualization
- [ ] Fork/orphan block demonstration
- [ ] Transaction support
- [ ] Content moderation for public deployment

## License

MIT

## Learn More

- [How Blockchain Works](https://www.investopedia.com/terms/b/blockchain.asp)
- [SHA-256 Hash Function](https://en.wikipedia.org/wiki/SHA-2)
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel KV Documentation](https://vercel.com/docs/storage/vercel-kv)
