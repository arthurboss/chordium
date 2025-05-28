#!/bin/bash

# Single responsibility: Convert GitHub API file data to git diff format
# Input: GitHub API files response (status filename pairs)
# Output: git diff --name-status compatible format

convert_github_api_to_git_diff() {
    local github_files="$1"
    
    while IFS= read -r line; do
        [[ -z "$line" ]] && continue
        
        local status=$(echo "$line" | awk '{print $1}')
        local filepath=$(echo "$line" | awk '{print $2}')
        
        # Convert GitHub API status to git diff status
        case "$status" in
            "added") echo "A	$filepath" ;;
            "modified") echo "M	$filepath" ;;
            "removed") echo "D	$filepath" ;;
            "renamed") echo "R	$filepath" ;;
            *) echo "M	$filepath" ;;  # Default to modified
        esac
    done <<< "$github_files"
}
