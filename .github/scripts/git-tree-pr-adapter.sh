#!/bin/bash

# GitHub Action Adapter for Git Tree PR Comments
# 
# This script has been refactored into modular components.
# This file now serves as a simple wrapper that calls the new modular implementation.

set -e  # Exit on error

# Get the script directory
readonly SCRIPT_DIR="$(dirname "${BASH_SOURCE[0]}")"

# Call the new modular implementation
exec "$SCRIPT_DIR/git-tree/git_tree_pr_adapter.sh" "$@"
