#!/bin/bash

# GitHub Actions adapter for transforming relative links to GitHub URLs
# Post-processes git-tree output to convert relative links to absolute GitHub URLs

# Source required GitHub utilities
ADAPTER_SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$ADAPTER_SCRIPT_DIR/github_url.sh"
source "$ADAPTER_SCRIPT_DIR/repo_url.sh"

# Transform relative markdown links to GitHub URLs
# Input: markdown content with relative links like [file.sh](path/file.sh) or [file.sh](../../../path/file.sh)
# Output: markdown content with GitHub URLs like [file.sh](https://github.com/owner/repo/blob/branch/path/file.sh)
transform_links_to_github_urls() {
    local markdown_content="$1"
    
    # Get branch from environment or fallback
    local branch="${GITHUB_HEAD_REF:-${GITHUB_REF#refs/heads/}}"
    
    # Get repository URL
    local repo_url=$(get_repo_url)
    
    # Process line by line to handle markdown links more carefully
    echo "$markdown_content" | while IFS= read -r line; do
        # Transform links that don't start with http:// or https://
        # This regex matches [text](path) where path doesn't start with http
        echo "$line" | sed -E "s|\[([^\]]+)\]\(([^)h][^)]*)\)|[\1](${repo_url}/blob/${branch}/\2)|g"
    done
}
