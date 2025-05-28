#!/bin/bash

# Function to get GitHub repository info
get_github_repo_info() {
    local remote_url=$(git config --get remote.origin.url 2>/dev/null)
    if [[ -n "$remote_url" ]]; then
        # Extract owner/repo from GitHub URL (both HTTPS and SSH formats)
        local repo_path=$(echo "$remote_url" | sed 's/.*github\.com[/:]//' | sed 's/\.git$//')
        if [[ -n "$repo_path" && "$repo_path" =~ ^[^/]+/[^/]+$ ]]; then
            echo "$repo_path"
            return 0
        fi
    fi
    return 1
}
