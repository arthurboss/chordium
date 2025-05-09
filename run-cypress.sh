#!/bin/bash

# Script to run Cypress tests with proper Node.js setup
# Ensures we use a consistent environment for running tests

# Set the Node environment to test
export NODE_ENV=test

# Add support for process.env in browser context
export CYPRESS_INCLUDE_PROCESS=1

# Run Cypress with CommonJS config file
npx cypress run --config-file cypress.config.cjs