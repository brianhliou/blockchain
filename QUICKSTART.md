# Quick Start Guide

Choose your path based on what you need:

## 🚀 Just Want to See It Work?

**No setup required!**

```bash
npm install
npm run dev
```

Open http://localhost:3000

✅ Works immediately
⚠️ Data resets when server restarts

---

## 💾 Want Persistent Storage?

### Option A: Local Redis (Docker)

**Best for: Local development with full persistence**

```bash
# Terminal 1: Setup Redis
npm run redis:setup

# Terminal 2: Start REST proxy
npm install -g @upstash/redis-rest-proxy
npm run redis:proxy

# Terminal 3: Start app
npm run dev
```

**Requirements:** Docker installed

✅ Data persists across restarts
✅ Real Redis database locally
✅ Works offline

---

### Option B: Upstash Cloud (Free)

**Best for: Quick cloud testing**

1. Sign up at [console.upstash.com](https://console.upstash.com/)
2. Create a free Redis database
3. Copy credentials to `.env.local`:

```env
KV_REST_API_URL=https://your-db.upstash.io
KV_REST_API_TOKEN=your_token
KV_REST_API_READ_ONLY_TOKEN=your_token
```

4. Run: `npm run dev`

✅ No Docker needed
✅ Real cloud database
✅ Free tier available

---

### Option C: Vercel KV

**Best for: Production-like environment**

```bash
# Install Vercel CLI
npm install -g vercel

# Link project
vercel link

# Create KV database
vercel kv create blockchain-demo

# Download credentials
vercel env pull .env.local

# Start app
npm run dev
```

✅ Same as production
✅ Managed by Vercel
✅ Easy deployment

---

## 📊 Comparison

| What You Get | In-Memory | Local Redis | Upstash | Vercel KV |
|--------------|-----------|-------------|---------|-----------|
| **Works instantly** | ✅ | ❌ | ❌ | ❌ |
| **Persistent data** | ❌ | ✅ | ✅ | ✅ |
| **Works offline** | ✅ | ✅ | ❌ | ❌ |
| **Setup time** | 0 min | 5 min | 3 min | 5 min |
| **Docker required** | No | Yes | No | No |

---

## 🎯 Recommended Path

1. **First time?** → Use in-memory (no setup)
2. **Serious development?** → Use local Redis
3. **Ready to deploy?** → Use Vercel KV

---

## 📖 Need More Details?

- Full guide: [LOCAL_DEV.md](./LOCAL_DEV.md)
- Main README: [README.md](./README.md)
- Troubleshooting: See LOCAL_DEV.md

---

## 🧪 Test Your Setup

```bash
# Get blockchain
curl http://localhost:3000/api/chain

# Add a block
curl -X POST http://localhost:3000/api/blocks \
  -H "Content-Type: application/json" \
  -d '{"data":"Hello World"}'

# Get updated chain
curl http://localhost:3000/api/chain
```

Expected: You should see your new block with a valid hash!

---

## ❓ Common Questions

**Q: Do I need a database?**
A: No! The app works out-of-the-box with in-memory storage.

**Q: When should I use persistent storage?**
A: When you want your blockchain to survive server restarts.

**Q: Which storage is fastest?**
A: In-memory > Local Redis > Cloud (Upstash/Vercel)

**Q: Can I switch storage types later?**
A: Yes! Just change your `.env.local` or remove it for in-memory.

**Q: What happens to my data if I switch?**
A: Each storage type is independent. Your data stays in that storage system.

---

**Ready?** Pick your option above and start building! 🚀
