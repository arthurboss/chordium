#!/bin/bash

# GitHub utility functions for file tree generation
# Handles GitHub repository information and branch link formatting

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

# Function to check if branch exists locally (indicating it was fetched from remote)
branch_exists_locally() {
    local branch="$1"
    git show-ref --verify --quiet "refs/heads/$branch" 2>/dev/null
}

# Function to format branch name with optional GitHub link
format_branch_name() {
    local branch="$1"
    local github_repo_info=$(get_github_repo_info)
    
    if [[ $? -eq 0 ]] && branch_exists_locally "$branch"; then
        # Branch exists locally (likely from remote) and we have GitHub repo, create link
        echo "**[\`$branch\`](https://github.com/$github_repo_info/tree/$branch)**"
    else
        # Branch is local only or no GitHub repo, just format with bold and code
        echo "**\`$branch\`**"
    fi
}
