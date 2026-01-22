#!/usr/bin/env bash
set -euo pipefail

# Install dependencies if needed
if [ ! -d node_modules ]; then
  echo "Installing npm dependencies..."
  npm install
fi

node src/infrastructure/express/server.js
