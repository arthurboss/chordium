#!/bin/bash

# Single responsibility: Generate GitHub blob URLs for render functions
# Uses core URL utilities and blob store for consistent GitHub URL generation

# Source core URL utilities
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../../url/get_repo_url.sh"
source "$SCRIPT_DIR/../../url/generate_github_blob_url.sh"

# Source blob URL store if available (GitHub context)
if [[ -f "$SCRIPT_DIR/../../../../../.github/scripts/git-tree/utils/blob_url_store.sh" ]]; then
    source "$SCRIPT_DIR/../../../../../.github/scripts/git-tree/utils/blob_url_store.sh"
fi

generate_github_url() {
    local filepath="$1"
    local fallback_param="$2"  # Not used for GitHub URLs, but maintained for compatibility
    
    # Try to get blob URL from store first (if in GitHub context)
    if declare -F get_blob_url > /dev/null; then
        local stored_blob_url=$(get_blob_url "$filepath")
        if [[ -n "$stored_blob_url" && "$stored_blob_url" != "null" ]]; then
            echo "$stored_blob_url"
            return 0
        fi
    fi
    
    # Fallback: construct GitHub URL manually using core utilities
    local repo_url=$(get_repo_url)
    local branch="${GITHUB_HEAD_REF:-${GITHUB_REF#refs/heads/}}"
    
    if [[ -n "$repo_url" && -n "$branch" ]]; then
        generate_github_blob_url "$repo_url" "$branch" "$filepath"
    else
        echo "$filepath"  # Ultimate fallback to relative path
    fi
}
