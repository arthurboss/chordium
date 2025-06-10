#!/bin/bash

# S3 Test Runner
# Runs organized S3 tests with clear output

echo "🧪 Running S3 Service Tests..."
echo "================================"

# Set test environment
export NODE_OPTIONS="--experimental-vm-modules"

# Define test directories
UNIT_TESTS="tests/services/s3/unit"
INTEGRATION_TESTS="tests/services/s3/integration"

echo ""
echo "📋 Unit Tests:"
echo "----------------"

# Run unit tests
npx jest $UNIT_TESTS --verbose --collectCoverage=false

if [ $? -eq 0 ]; then
    echo "✅ Unit tests passed"
else
    echo "❌ Unit tests failed"
    exit 1
fi

echo ""
echo "🔗 Integration Tests:"
echo "--------------------"

# Run integration tests
npx jest $INTEGRATION_TESTS --verbose --collectCoverage=false

if [ $? -eq 0 ]; then
    echo "✅ Integration tests passed"
else
    echo "❌ Integration tests failed"
    exit 1
fi

echo ""
echo "🎉 All S3 tests passed!"
