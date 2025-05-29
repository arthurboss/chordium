#!/bin/bash

# Single responsibility: Generate GitHub blob URLs
# Creates absolute GitHub URLs for PR comments and web viewing

# Source blob URL store if available (GitHub context)
if [[ -f "$(dirname "${BASH_SOURCE[0]}")/../../../../../.github/scripts/git-tree/utils/blob_url_store.sh" ]]; then
    source "$(dirname "${BASH_SOURCE[0]}")/../../../../../.github/scripts/git-tree/utils/blob_url_store.sh"
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
    
    # Fallback: construct GitHub URL manually
    local repo_url="${GITHUB_REPOSITORY:+https://github.com/$GITHUB_REPOSITORY}"
    local branch="${GITHUB_HEAD_REF:-${GITHUB_REF#refs/heads/}}"
    
    if [[ -n "$repo_url" && -n "$branch" ]]; then
        echo "$repo_url/blob/$branch/$filepath"
    else
        echo "$filepath"  # Ultimate fallback to relative path
    fi
}
