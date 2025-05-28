#!/bin/bash

# Single responsibility: Generate GitHub blob URLs
# Args: repo_url, branch, filepath
generate_github_url() {
    local repo_url="$1"
    local branch="$2"
    local filepath="$3"
    
    # Remove .git suffix if present
    repo_url="${repo_url%.git}"
    
    # Ensure no trailing slash
    repo_url="${repo_url%/}"
    
    echo "${repo_url}/blob/${branch}/${filepath}"
}
