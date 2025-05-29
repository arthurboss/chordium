#!/bin/bash

# Single responsibility: Extract repository URL from git remote or environment
# Pure function that handles both local git and GitHub Actions contexts

get_repo_url() {
    # In GitHub Actions, use environment variable if available
    if [[ -n "$GITHUB_REPOSITORY" ]]; then
        echo "https://github.com/$GITHUB_REPOSITORY"
        return 0
    fi
    
    # Local git context - extract from remote
    local remote_name="${1:-origin}"
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
