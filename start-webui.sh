#!/bin/bash
echo "Starting Career-Ops Web UI..."

# Get the directory where the script is located
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Navigate to the webui directory
cd "$DIR/webui"

# Ensure dependencies are installed just in case (optional, fast if already installed)
if [ ! -d "node_modules" ]; then
  echo "Installing backend dependencies..."
  npm install
fi

if [ ! -d "ui/node_modules" ]; then
  echo "Installing frontend dependencies..."
  cd ui && npm install && cd ..
fi

# Run the dev server
npm run dev
