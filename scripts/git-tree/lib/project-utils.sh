#!/bin/bash

# Project utility functions for file tree generation
# Handles project information and status icons

# Function to get status icon
get_status_icon() {
    case "$1" in
        "A") echo "✅" ;;
        "M") echo "✏️" ;;
        "D") echo "❌" ;;
        *) echo "📄" ;;
    esac
}

# Function to get project name dynamically
get_project_name() {
    # First try to get project name from git remote URL
    local remote_url=$(git remote get-url origin 2>/dev/null)
    if [[ -n "$remote_url" ]]; then
        # Extract project name from various URL formats
        # For GitHub: https://github.com/user/repo.git or git@github.com:user/repo.git
        # For GitLab: https://gitlab.com/user/repo.git or git@gitlab.com:user/repo.git
        local project_name=$(echo "$remote_url" | sed -E 's|.*[/:]([^/]+)\.git$|\1|' | sed -E 's|.*[/:]([^/]+)$|\1|')
        if [[ -n "$project_name" && "$project_name" != "$remote_url" ]]; then
            echo "$project_name"
            return
        fi
    fi
    
    # Fall back to current directory name
    basename "$PWD"
}
