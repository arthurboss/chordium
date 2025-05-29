#!/bin/bash

# Single responsibility: Generate GitHub URLs for GitHub Actions environment
# Pure function - only GitHub URL logic

# Source required dependencies
GEN_SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$GEN_SCRIPT_DIR/repo_url.sh"
source "$GEN_SCRIPT_DIR/url_generator.sh"

generate_github_file_url() {
    local filepath="$1"
    local branch="${2:-$GITHUB_HEAD_REF}"
    
    # Use the GitHub utilities
    local repo_url=$(get_repo_url)
    local github_url=$(generate_github_url "$repo_url" "$branch" "$filepath")
    echo "$github_url"
}
