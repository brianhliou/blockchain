#!/bin/bash

# Local Redis Setup Script for Blockchain Demo
# This script sets up a local Redis instance for development

set -e

echo "🚀 Setting up local Redis for blockchain demo..."
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed"
    echo "📥 Please install Docker Desktop from: https://www.docker.com/products/docker-desktop/"
    exit 1
fi

echo "✅ Docker found"

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running"
    echo "🔄 Please start Docker Desktop and try again"
    exit 1
fi

echo "✅ Docker is running"

# Stop and remove existing container if it exists
if docker ps -a | grep -q blockchain-redis; then
    echo "🧹 Removing existing Redis container..."
    docker rm -f blockchain-redis &> /dev/null || true
fi

# Start Redis container
echo "🐳 Starting Redis container..."
docker run -d \
  --name blockchain-redis \
  -p 6379:6379 \
  redis:7-alpine

echo "✅ Redis container started on port 6379"

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    cat > .env.local << 'EOF'
# Local Redis configuration
KV_REST_API_URL=http://localhost:8079
KV_REST_API_TOKEN=local_dev_token
KV_REST_API_READ_ONLY_TOKEN=local_dev_token
EOF
    echo "✅ Created .env.local"
else
    echo "ℹ️  .env.local already exists, skipping creation"
fi

echo ""
echo "✅ Local Redis setup complete!"
echo ""
echo "📋 Next steps:"
echo ""
echo "1. Install the REST proxy (one-time):"
echo "   npm install -g @upstash/redis-rest-proxy"
echo ""
echo "2. Start the REST proxy (in a separate terminal):"
echo "   npx @upstash/redis-rest-proxy --redis-url redis://localhost:6379 --port 8079"
echo ""
echo "3. Start your app (in another terminal):"
echo "   npm run dev"
echo ""
echo "🎉 Your blockchain will now use persistent local Redis storage!"
echo ""
echo "📊 Useful commands:"
echo "   docker logs blockchain-redis     # View Redis logs"
echo "   docker stop blockchain-redis     # Stop Redis"
echo "   docker start blockchain-redis    # Start Redis"
echo "   docker exec -it blockchain-redis redis-cli KEYS '*'  # View all keys"
echo "   docker exec -it blockchain-redis redis-cli GET demo:chain  # View blockchain"
echo ""
