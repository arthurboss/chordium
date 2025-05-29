#!/bin/bash

# Single responsibility: Create markdown links based on context
# Requires: github_url.sh for GitHub context

create_markdown_link() {
    local filepath="$1"
    local context="$2"  # "github" or "relative"
    local filename=$(basename "$filepath")
    
    case "$context" in
        "github")
            local repo_url="$3"
            local branch="$4"
            # Source the GitHub URL generator
            source "$(dirname "${BASH_SOURCE[0]}")/github_url.sh"
            local url=$(generate_github_url "$repo_url" "$branch" "$filepath")
            echo "[$filename]($url)"
            ;;
        "relative")
            local relative_prefix="$3"
            echo "[$filename]($relative_prefix$filepath)"
            ;;
        *)
            echo "Error: Invalid context '$context'. Use 'github' or 'relative'." >&2
            return 1
            ;;
    esac
}
