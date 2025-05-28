#!/bin/bash

# Git utility functions for file tree generation
# Common git operations and branch detection logic

# Function to detect the best base branch for comparison
detect_base_branch() {
    # First check if main exists
    if git show-ref --verify --quiet refs/heads/main; then
        local main_distance=$(git rev-list --count HEAD...main 2>/dev/null)
        if [[ -n "$main_distance" && "$main_distance" -gt 0 ]]; then
            echo "main"
            return
        fi
    fi
    
    # If main doesn't exist or has no difference, check master
    if git show-ref --verify --quiet refs/heads/master; then
        local master_distance=$(git rev-list --count HEAD...master 2>/dev/null)
        if [[ -n "$master_distance" && "$master_distance" -gt 0 ]]; then
            echo "master"
            return
        fi
    fi
    
    # Find the best branch by looking at merge history and commit distance
    local current_branch=$(git branch --show-current)
    local best_branch=""
    local best_distance=999999
    
    # Get all branches except current, sorted by most recent commits
    while IFS= read -r branch; do
        # Skip current branch, remote branches, and detached HEAD
        if [[ "$branch" == "$current_branch" || "$branch" =~ ^remotes/ || "$branch" == "(HEAD detached"* ]]; then
            continue
        fi
        
        # Calculate how many commits this branch is behind HEAD
        local distance=$(git rev-list --count HEAD...$branch 2>/dev/null)
        
        # If this branch is an ancestor and has reasonable distance, consider it
        if [[ -n "$distance" && "$distance" -gt 0 && "$distance" -lt "$best_distance" ]]; then
            # Additional check: make sure this branch has actually diverged meaningfully
            local reverse_distance=$(git rev-list --count HEAD..$branch 2>/dev/null)
            if [[ -n "$reverse_distance" && "$reverse_distance" -gt 0 ]]; then
                best_branch="$branch"
                best_distance="$distance"
            fi
        fi
    done <<< "$(git branch --sort=-committerdate)"
    
    # If we found a good candidate, use it; otherwise default to main
    if [[ -n "$best_branch" ]]; then
        echo "$best_branch"
    else
        echo "main"
    fi
}

# Function to get the current git branch
get_current_branch() {
    git branch --show-current
}

# Function to check if a branch exists
branch_exists() {
    local branch="$1"
    git show-ref --verify --quiet "refs/heads/$branch" 2>/dev/null
}
