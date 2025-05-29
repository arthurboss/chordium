#!/bin/bash

# GitHub Action Adapter for Git Tree PR Comments - Main Orchestrator
# 
# This is the main entry point that orchestrates the modular components
# to generate git-tree PR comments using GitHub API.
#
# Dependencies: 
# - curl and jq (for GitHub API calls)
# - GitHub Action environment variables
#
# Environment Variables Required:
# - GITHUB_REPOSITORY: Repository in format "owner/repo"
# - PR_NUMBER: Pull request number
# - GITHUB_TOKEN: GitHub API token
# - GITHUB_HEAD_REF: PR head branch name
# - GITHUB_BASE_REF: PR base branch name

set -e  # Exit on error

# Get the script directory for relative imports
readonly SCRIPT_DIR="$(dirname "${BASH_SOURCE[0]}")"

# Import modular components
source "$SCRIPT_DIR/utils/logger.sh"
source "$SCRIPT_DIR/core/environment.sh"
source "$SCRIPT_DIR/core/github_api.sh"
source "$SCRIPT_DIR/core/git_tree_generator.sh"
source "$SCRIPT_DIR/formatters/github_comment.sh"

# Main execution function
main() {
    log_info "Starting Git-Tree PR Comment Generation (Modular Version)" >&2
    
    # Validate environment
    validate_environment
    show_environment_info
    
    # Set up file paths
    local git_tree_output="temp_git_tree.md"
    local github_comment_output="pr_comment.md"
    
    # Generate git-tree
    if ! generate_git_tree "$GITHUB_BASE_REF" "$GITHUB_HEAD_REF" "$git_tree_output"; then
        log_error "Failed to generate git-tree" >&2
        exit 1
    fi
    
    # Format for GitHub comment
    format_for_github_comment "$git_tree_output" "$github_comment_output"
    
    # Cleanup temporary file
    rm -f "$git_tree_output"
    
    log_success "PR comment file generated: $github_comment_output" >&2
    log_info "Content preview:" >&2
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2
    head -20 "$github_comment_output" >&2
    echo "..." >&2
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2
}

# Run main function
main "$@"
