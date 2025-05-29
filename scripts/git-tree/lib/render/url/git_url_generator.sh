#!/bin/bash

# Single responsibility: Generate git-compatible relative URLs for render functions
# Uses core URL utility for consistent relative path generation

# Source core URL utilities
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../../url/generate_git_relative_url.sh"

generate_git_url() {
    local filepath="$1"
    local relative_prefix="$2"
    
    generate_git_relative_url "$relative_prefix" "$filepath"
}
