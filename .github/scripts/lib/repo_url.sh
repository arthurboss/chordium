#!/bin/bash

# Single responsibility: Extract repository URL from git remote
get_repo_url() {
    local remote_name="${1:-origin}"
    
    # Try to get remote URL
    local remote_url=$(git remote get-url "$remote_name" 2>/dev/null)
    
    if [[ -z "$remote_url" ]]; then
        echo "Error: Could not get remote URL for '$remote_name'" >&2
        return 1
    fi
    
    # Convert SSH to HTTPS if needed
    if [[ "$remote_url" =~ ^git@github\.com:(.+)$ ]]; then
        remote_url="https://github.com/${BASH_REMATCH[1]}"
    fi
    
    # Remove .git suffix if present
    remote_url="${remote_url%.git}"
    
    echo "$remote_url"
}
