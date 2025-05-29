#!/bin/bash

# Single responsibility: Format branch name with GitHub links
# GitHub Actions specific - creates branch tree links

# Source required dependencies
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/repo_url.sh"

format_github_branch_name() {
    local branch="$1"
    local repo_url="${2:-$(get_repo_url)}"
    
    # Remove .git suffix if present
    repo_url="${repo_url%.git}"
    
    # Create GitHub tree link
    echo "[**\`$branch\`**]($repo_url/tree/$branch)"
}
