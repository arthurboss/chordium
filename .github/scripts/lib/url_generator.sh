#!/bin/bash

# URL Generation Utility
# Provides functions for generating both relative git paths and GitHub blob URLs
# Follows DRY principle and single responsibility pattern

# Generate GitHub blob URL for a file in a specific branch
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

# Generate relative path URL (for local git contexts)
# Args: relative_prefix, filepath
generate_relative_url() {
    local relative_prefix="$1"
    local filepath="$2"
    
    echo "${relative_prefix}${filepath}"
}

# Create a markdown link with appropriate URL based on context
# Args: filepath, context_type (git|github), context_data...
# For git context: relative_prefix
# For github context: repo_url, branch
generate_file_url() {
    local filepath="$1"
    local context_type="$2"
    
    case "$context_type" in
        "git")
            local relative_prefix="$3"
            generate_relative_url "$relative_prefix" "$filepath"
            ;;
        "github")
            local repo_url="$3"
            local branch="$4"
            generate_github_url "$repo_url" "$branch" "$filepath"
            ;;
        *)
            echo "Error: Invalid context_type '$context_type'. Use 'git' or 'github'." >&2
            return 1
            ;;
    esac
}

# Create a markdown link for a file with context-aware URL generation
# Args: filepath, context_type (git|github), context_data...
create_markdown_link() {
    local filepath="$1"
    local context_type="$2"
    local filename=$(basename "$filepath")
    
    local url
    case "$context_type" in
        "git")
            local relative_prefix="$3"
            url=$(generate_file_url "$filepath" "$context_type" "$relative_prefix")
            ;;
        "github")
            local repo_url="$3"
            local branch="$4"
            url=$(generate_file_url "$filepath" "$context_type" "$repo_url" "$branch")
            ;;
        *)
            echo "Error: Invalid context_type '$context_type'. Use 'git' or 'github'." >&2
            return 1
            ;;
    esac
    
    echo "[$filename]($url)"
}

# Extract repository URL from git remote
get_repo_url() {
    local remote_name="${1:-origin}"
    
    # Try to get remote URL
    local remote_url=$(git remote get-url "$remote_name" 2>/dev/null)
    
    if [[ -z "$remote_url" ]]; then
        echo "Error: Could not get remote URL for '$remote_name'" >&2
        return 1
    fi
    
    # Convert SSH to HTTPS if needed
    if [[ "$remote_url" =~ ^git@github\.com:(.+)$ ]]; then
        remote_url="https://github.com/${BASH_REMATCH[1]}"
    fi
    
    # Remove .git suffix if present
    remote_url="${remote_url%.git}"
    
    echo "$remote_url"
}
