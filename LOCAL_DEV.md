# Local Development Guide

This guide explains how to run the blockchain demo locally with different storage options.

## Option 1: In-Memory Storage (No Setup Required)

The easiest way to get started. Works out of the box but data is **not persistent**.

```bash
npm run dev
```

**What happens:**
- App runs on http://localhost:3000
- Storage: In-memory Map
- Data resets when server restarts
- Perfect for testing UI and blockchain logic

---

## Option 2: Local Redis with Docker (Persistent Storage)

Run a local Redis instance that mimics Vercel KV behavior. Data persists between restarts.

### Step 1: Install Docker

Download from [docker.com](https://www.docker.com/products/docker-desktop/)

### Step 2: Start Redis Container

```bash
docker run -d \
  --name blockchain-redis \
  -p 6379:6379 \
  redis:7-alpine
```

This starts Redis on `localhost:6379`

### Step 3: Set Environment Variables

Create `.env.local` in the project root:

```bash
# For local Redis, use these values
KV_REST_API_URL=http://localhost:8079
KV_REST_API_TOKEN=local_token

# These aren't used for local Redis but needed to pass validation
KV_REST_API_READ_ONLY_TOKEN=local_token
```

### Step 4: Install and Run Upstash Redis REST Proxy

The Vercel KV SDK needs a REST API, not direct Redis. Use the Upstash proxy:

```bash
# Install globally
npm install -g @upstash/redis-rest-proxy

# Run the proxy (bridges localhost:8079 -> Redis localhost:6379)
npx @upstash/redis-rest-proxy \
  --redis-url redis://localhost:6379 \
  --port 8079
```

### Step 5: Start Your App (in another terminal)

```bash
npm run dev
```

**What happens:**
- App connects to local Redis via REST proxy
- Data persists between server restarts
- You can inspect data: `docker exec -it blockchain-redis redis-cli`
- View keys: `redis-cli KEYS *`
- View chain: `redis-cli GET demo:chain`

### Managing Redis

```bash
# Stop Redis
docker stop blockchain-redis

# Start Redis again
docker start blockchain-redis

# Remove Redis container
docker rm -f blockchain-redis

# View logs
docker logs blockchain-redis

# Clear all data
docker exec -it blockchain-redis redis-cli FLUSHALL
```

---

## Option 3: Upstash Cloud (Free Tier)

Use real Vercel KV infrastructure for local development.

### Step 1: Create Upstash Account

1. Go to [console.upstash.com](https://console.upstash.com/)
2. Sign up (free tier available)

### Step 2: Create Redis Database

1. Click **Create Database**
2. Choose a region close to you
3. Select **Free** tier
4. Click **Create**

### Step 3: Get REST API Credentials

1. Click on your database
2. Scroll to **REST API** section
3. Copy the credentials

### Step 4: Add to `.env.local`

```bash
KV_REST_API_URL=https://your-db.upstash.io
KV_REST_API_TOKEN=your_token_here
KV_REST_API_READ_ONLY_TOKEN=your_read_only_token_here
```

### Step 5: Start Your App

```bash
npm run dev
```

**What happens:**
- App connects to real Upstash Redis
- Data persists globally
- Same infrastructure as production Vercel KV
- Free tier: 10,000 commands/day

---

## Option 4: Vercel KV (Production-like)

Use the same setup as production deployment.

### Prerequisites

- Vercel account
- Vercel CLI installed: `npm install -g vercel`

### Step 1: Link Project to Vercel

```bash
vercel link
```

Follow the prompts to connect your project.

### Step 2: Create Vercel KV Database

```bash
# Option A: Via CLI
vercel kv create blockchain-demo

# Option B: Via Dashboard
# 1. Go to vercel.com/dashboard
# 2. Select your project
# 3. Go to Storage tab
# 4. Click "Create Database"
# 5. Select "KV"
```

### Step 3: Link KV to Your Project

```bash
# In your project directory
vercel env pull .env.local
```

This automatically downloads the KV credentials to `.env.local`

### Step 4: Start Your App

```bash
npm run dev
```

**What happens:**
- App connects to production Vercel KV
- Data persists globally
- Same environment as deployed app
- Can view data in Vercel dashboard

---

## Comparison Table

| Option | Setup Time | Persistence | Cost | Best For |
|--------|-----------|-------------|------|----------|
| **In-Memory** | 0 min | ❌ No | Free | Quick testing, UI work |
| **Local Redis** | 5 min | ✅ Yes | Free | Full local development |
| **Upstash Cloud** | 3 min | ✅ Yes | Free tier | Testing with real cloud |
| **Vercel KV** | 5 min | ✅ Yes | Free tier | Production-like env |

---

## Troubleshooting

### "Missing required environment variables KV_REST_API_URL"

**Solution:** App is using in-memory storage (this is fine for testing). To use persistent storage, follow Option 2, 3, or 4 above.

### "Connection refused" with Local Redis

**Checklist:**
1. Is Docker running? `docker ps`
2. Is Redis container running? `docker ps | grep blockchain-redis`
3. Is the REST proxy running? Check terminal output
4. Are environment variables set? `cat .env.local`

### Rate Limiting Not Working Locally

With in-memory storage, rate limiting works per session. For persistent rate limiting across restarts, use Options 2-4.

### Want to Reset the Blockchain?

**In-Memory:**
```bash
# Just restart the server
npm run dev
```

**Local Redis:**
```bash
docker exec -it blockchain-redis redis-cli DEL demo:chain
```

**Upstash/Vercel KV:**
Use the dashboard or:
```bash
# Via REST API
curl -X DELETE "$KV_REST_API_URL/get/demo:chain" \
  -H "Authorization: Bearer $KV_REST_API_TOKEN"
```

---

## Recommended Workflow

1. **Initial Development**: Use in-memory (no setup)
2. **Feature Testing**: Switch to local Redis (persistent)
3. **Pre-Deploy Testing**: Use Vercel KV (production environment)
4. **Deploy**: Push to Vercel (automatic KV integration)

---

## Next Steps

After setting up local development:

1. Add blocks through the UI: http://localhost:3000
2. Test API endpoints:
   ```bash
   # Get blockchain
   curl http://localhost:3000/api/chain

   # Add a block
   curl -X POST http://localhost:3000/api/blocks \
     -H "Content-Type: application/json" \
     -d '{"data":"Hello Blockchain"}'
   ```
3. Test rate limiting (add 6 blocks quickly)
4. Check storage logs in terminal

---

## Questions?

- In-memory vs persistent? See comparison table above
- Docker issues? Check troubleshooting section
- Want to deploy? See main README.md
