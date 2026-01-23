#!/bin/bash
# Serve Cybertantra via ttyd
# Usage: ./serve-ttyd.sh [port]

PORT=${1:-7681}
DIR="$(cd "$(dirname "$0")" && pwd)"

cd "$DIR"

echo "Starting Cybertantra on port $PORT..."
echo "Access at: http://localhost:$PORT"

# --writable: allow keyboard input
# --max-clients 10: limit concurrent sessions
# --title-format: set browser tab title
exec ttyd \
  --port "$PORT" \
  --writable \
  --max-clients 10 \
  --title-format "Cybertantra" \
  npm start
