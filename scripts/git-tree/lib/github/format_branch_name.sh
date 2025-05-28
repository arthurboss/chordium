#!/bin/bash

# Function to format branch name with optional GitHub link
format_branch_name() {
    local branch="$1"
    
    # Source dependencies
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    source "$SCRIPT_DIR/../github/get_github_repo_info.sh"
    source "$SCRIPT_DIR/../git/branch_exists_locally.sh"
    
    local github_repo_info=$(get_github_repo_info)
    
    if [[ $? -eq 0 ]] && branch_exists_locally "$branch"; then
        # Branch exists locally (likely from remote) and we have GitHub repo, create link
        echo "**[\`$branch\`](https://github.com/$github_repo_info/tree/$branch)**"
    else
        # Branch is local only or no GitHub repo, just format with bold and code
        echo "**\`$branch\`**"
    fi
}
