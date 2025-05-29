#!/bin/bash

# Single responsibility: Git-tree generation using GitHub API data
# Integrates API data with existing git-tree rendering functions

# Source required utilities
source "$(dirname "${BASH_SOURCE[0]}")/../utils/logger.sh"
source "$(dirname "${BASH_SOURCE[0]}")/github_api.sh"

# Generate git-tree using GitHub API data and existing render functions
generate_git_tree() {
    local base_branch="$1" 
    local target_branch="$2"
    local output_file="$3"
    
    log_info "Generating git-tree for $target_branch vs $base_branch"
    
    # Fetch changed files from GitHub API
    local changed_files
    if ! changed_files=$(fetch_changed_files_from_api); then
        log_error "Failed to fetch changed files from GitHub API"
        
        # Fallback: try to use local git diff if API fails
        log_warning "Attempting fallback to local git diff..."
        if command -v git >/dev/null 2>&1; then
            local local_diff
            local_diff=$(git diff --name-status "origin/$base_branch...HEAD" 2>/dev/null || echo "")
            if [[ -n "$local_diff" ]]; then
                log_success "Using local git diff as fallback"
                changed_files="$local_diff"
            else
                log_error "Local git diff fallback also failed"
                return 1
            fi
        else
            log_error "Git command not available for fallback"
            return 1
        fi
    fi
    
    # Convert GitHub API data to git diff format
    source "$(dirname "${BASH_SOURCE[0]}")/../utils/api_converter.sh"
    local git_diff_data
    git_diff_data=$(convert_github_api_to_git_diff "$changed_files")
    
    # Create a temporary function that returns our API data instead of calling git diff
    mock_git_diff() {
        echo "$git_diff_data"
    }
    
    # Override git command temporarily
    git() {
        if [[ "$1" == "diff" && "$2" == "--name-status" ]]; then
            mock_git_diff
        else
            command git "$@"
        fi
    }
    
    # Source the git-tree library (loads all dependencies including render functions and URL generators)
    source "$(dirname "${BASH_SOURCE[0]}")/../../../../scripts/git-tree/lib/loader.sh"
    
    # Get repository name for project name
    local repo_name="${GITHUB_REPOSITORY##*/}"
    
    # Call the existing render function with GitHub URL generator
    render_file_tree "$base_branch" "$output_file" "$target_branch" "$repo_name" "generate_github_url" ""
    
    # Restore git command
    unset -f git
    
    if [[ -f "$output_file" ]]; then
        log_success "Git-tree generated successfully"
        return 0
    else
        log_error "Failed to generate git-tree file"
        return 1
    fi
}

# Main execution - only run if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    generate_git_tree "$@"
fi
