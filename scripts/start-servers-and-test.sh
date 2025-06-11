#!/bin/bash
# Usage: ./scripts/start-servers-and-test.sh "<start-server-cmd>" <url-to-wait-for> "<test-cmd>"
# Example: ./scripts/start-servers-and-test.sh "npm run dev" http://localhost:8080 "./run-cypress.sh"

set -e

START_CMD="$1"
WAIT_URL="$2"
TEST_CMD="$3"

if [ -z "$START_CMD" ] || [ -z "$WAIT_URL" ] || [ -z "$TEST_CMD" ]; then
  echo "Usage: $0 '<start-server-cmd>' <url-to-wait-for> '<test-cmd>'"
  exit 1
fi

# Start the server in the background
bash -c "$START_CMD" &
SERVER_PID=$!

# Wait for the server to be ready
MAX_RETRIES=30
RETRY_DELAY=1
RETRIES=0

until curl --silent --fail "$WAIT_URL" > /dev/null; do
  RETRIES=$((RETRIES+1))
  if [ $RETRIES -ge $MAX_RETRIES ]; then
    echo "Server did not become ready at $WAIT_URL after $MAX_RETRIES seconds."
    kill $SERVER_PID 2>/dev/null || true
    exit 1
  fi
  sleep $RETRY_DELAY
done

echo "Server is ready at $WAIT_URL. Running tests..."

# Run the test command
bash -c "$TEST_CMD"

# Kill the server after tests
kill $SERVER_PID 2>/dev/null || true
