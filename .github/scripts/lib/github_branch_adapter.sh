#!/bin/bash

# GitHub Actions adapter for branch name formatting  
# Injects GitHub branch links into the git-tree rendering pipeline

# Source required GitHub utilities
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/format_github_branch_name.sh"
source "$SCRIPT_DIR/repo_url.sh"

# Override the format_branch_name function to use GitHub links
format_branch_name() {
    local branch="$1"
    
    # Generate GitHub branch link
    local repo_url=$(get_repo_url)
    format_github_branch_name "$branch" "$repo_url"
}
