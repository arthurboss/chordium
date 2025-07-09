#!/bin/bash
# Usage: ./scripts/start-servers-and-test.sh "<start-server-script>" <url-to-wait-for> "<test-script>"
# Example: ./scripts/start-servers-and-test.sh "dev" http://localhost:8080 "cy:run"

set -e

START_SCRIPT="$1"
WAIT_URL="$2"
TEST_SCRIPT="$3"

if [ -z "$START_SCRIPT" ] || [ -z "$WAIT_URL" ] || [ -z "$TEST_SCRIPT" ]; then
  echo "Usage: $0 '<start-server-script>' <url-to-wait-for> '<test-script>'"
  exit 1
fi

# Convert script names to npm run commands
if [[ "$START_SCRIPT" != npm* ]] && [[ "$START_SCRIPT" != ./* ]]; then
  START_CMD="npm run $START_SCRIPT"
else
  START_CMD="$START_SCRIPT"
fi

if [[ "$TEST_SCRIPT" != npm* ]] && [[ "$TEST_SCRIPT" != ./* ]]; then
  TEST_CMD="npm run $TEST_SCRIPT"
else
  TEST_CMD="$TEST_SCRIPT"
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
