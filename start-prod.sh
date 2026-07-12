#!/bin/bash
# Start LootLoom in production mode (more reliable than dev mode in memory-constrained environments)
cd /home/z/my-project

# Check if build exists, if not build it
if [ ! -f .next/standalone/server.js ]; then
  echo "Building..."
  NODE_OPTIONS="--max-old-space-size=2048" npx next build
  cp -r .next/static .next/standalone/.next/
  cp -r public .next/standalone/ 2>/dev/null
fi

# Start the production server
echo "Starting production server on port 3000..."
export NODE_ENV=production
export NODE_OPTIONS="--max-old-space-size=256"
exec bun .next/standalone/server.js
