#!/bin/bash

# GitHub Actions adapter for markdown link creation
# Injects GitHub URL generation into the git-tree rendering pipeline

# Source required GitHub utilities
ADAPTER_SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$ADAPTER_SCRIPT_DIR/github_url.sh"
source "$ADAPTER_SCRIPT_DIR/repo_url.sh"

# Override the create_markdown_link function to use GitHub URLs
create_markdown_link() {
    local filepath="$1"
    local relative_prefix="$2"  # Ignored in GitHub mode
    local filename=$(basename "$filepath")
    
    # Get branch from environment or fallback
    local branch="${GITHUB_HEAD_REF:-${GITHUB_REF#refs/heads/}}"
    
    # Generate GitHub URL
    local repo_url=$(get_repo_url)
    local github_url=$(generate_github_url "$repo_url" "$branch" "$filepath")
    echo "[$filename]($github_url)"
}
