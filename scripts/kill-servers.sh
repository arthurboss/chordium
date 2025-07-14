#!/bin/bash

# Usage: ./kill-servers.sh [fe|be]
#   fe - kill only frontend (port 8080)
#   be - kill only backend (port 3001)
#   (no arg) - kill both

KILL_FE=false
KILL_BE=false

if [[ $# -eq 0 ]]; then
    KILL_FE=true
    KILL_BE=true
else
    for arg in "$@"; do
        case $arg in
            fe)
                KILL_FE=true
                ;;
            be)
                KILL_BE=true
                ;;
            *)
                echo "Unknown argument: $arg"
                echo "Usage: $0 [fe|be]"
                exit 1
                ;;
        esac
    done
fi

# Build dynamic message based on what we're killing
PORTS_MSG=""
if [ "$KILL_BE" = true ] && [ "$KILL_FE" = true ]; then
    PORTS_MSG="ports 3001 and 8080"
elif [ "$KILL_BE" = true ]; then
    PORTS_MSG="port 3001 (backend)"
elif [ "$KILL_FE" = true ]; then
    PORTS_MSG="port 8080 (frontend)"
fi

echo "Checking for processes on $PORTS_MSG..."

# Kill processes on port 3001 (backend)
if [ "$KILL_BE" = true ]; then
    if lsof -ti:3001 >/dev/null 2>&1; then
        PIDS=$(lsof -ti:3001)
        echo "Found running server on port 3001 (backend) with PID(s): $PIDS - killing it..."
        echo $PIDS | xargs kill -9 2>/dev/null || true
        echo "✓ Server on port 3001 killed successfully"
    else
        echo "No processes found on port 3001"
    fi
fi

# Kill processes on port 8080 (frontend)
if [ "$KILL_FE" = true ]; then
    if lsof -ti:8080 >/dev/null 2>&1; then
        PIDS=$(lsof -ti:8080)
        echo "Found running server on port 8080 (frontend) with PID(s): $PIDS - killing it..."
        echo $PIDS | xargs kill -9 2>/dev/null || true
        echo "✓ Server on port 8080 killed successfully"
    else
        echo "No processes found on port 8080"
    fi
fi

echo "Port cleanup complete."
