#!/bin/bash

# Kill any processes running on ports 3001 and 8080
echo "Checking for processes on ports 3001 and 8080..."

# Kill processes on port 3001 (backend)
if lsof -ti:3001 >/dev/null 2>&1; then
    PIDS=$(lsof -ti:3001)
    echo "Found running server on port 3001 (backend) with PID(s): $PIDS - killing it..."
    echo $PIDS | xargs kill -9 2>/dev/null || true
    echo "✓ Server on port 3001 killed successfully"
else
    echo "No processes found on port 3001"
fi

# Kill processes on port 8080 (frontend)
if lsof -ti:8080 >/dev/null 2>&1; then
    PIDS=$(lsof -ti:8080)
    echo "Found running server on port 8080 (frontend) with PID(s): $PIDS - killing it..."
    echo $PIDS | xargs kill -9 2>/dev/null || true
    echo "✓ Server on port 8080 killed successfully"
else
    echo "No processes found on port 8080"
fi

echo "Port cleanup complete."
