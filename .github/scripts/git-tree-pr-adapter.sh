#!/bin/bash

# GitHub Action Adapter for Git Tree PR Comments
# 
# This script adapts our git-tree script for use in GitHub Actions.
# It uses GitHub API to fetch file changes (compatible with Actions environment)
# and generates PR comments using our modern git-tree rendering format.
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

# Color codes for logging
readonly CYAN='\033[0;36m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly RED='\033[0;31m'
readonly NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Validate required environment variables
validate_environment() {
    local required_vars=("GITHUB_REPOSITORY" "PR_NUMBER" "GITHUB_TOKEN" "GITHUB_HEAD_REF" "GITHUB_BASE_REF")
    local missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var}" ]]; then
            missing_vars+=("$var")
        fi
    done
    
    if [[ ${#missing_vars[@]} -gt 0 ]]; then
        log_error "Missing required environment variables:" >&2
        printf '  - %s\n' "${missing_vars[@]}" >&2
        exit 1
    fi
    
    log_success "All required environment variables are present" >&2
}

# Display environment information for debugging
show_environment_info() {
    log_info "GitHub Action Environment:" >&2
    echo "  Repository: $GITHUB_REPOSITORY" >&2
    echo "  PR Number: $PR_NUMBER" >&2
    echo "  Head Branch: $GITHUB_HEAD_REF" >&2
    echo "  Base Branch: $GITHUB_BASE_REF" >&2
}

# Fetch changed files from GitHub API (GitHub Actions compatible)
fetch_changed_files_from_api() {
    # Send log messages to stderr to avoid mixing with output
    log_info "Fetching changed files from GitHub API..." >&2
    log_info "API Endpoint: https://api.github.com/repos/$GITHUB_REPOSITORY/pulls/$PR_NUMBER/files" >&2
    
    local all_files=""
    local page=1
    local per_page=100
    local total_pages=0
    
    while true; do
        log_info "Fetching page $page (up to $per_page files per page)..." >&2
        
        # Fetch changed files from GitHub API with pagination
        local files_response
        local api_url="https://api.github.com/repos/$GITHUB_REPOSITORY/pulls/$PR_NUMBER/files?page=$page&per_page=$per_page"
        log_info "Calling: $api_url" >&2
        
        files_response=$(curl -s -H "Authorization: token $GITHUB_TOKEN" "$api_url")
        local curl_exit_code=$?
        
        # Check curl exit code
        if [[ $curl_exit_code -ne 0 ]]; then
            log_error "Failed to fetch files from GitHub API (curl exit code: $curl_exit_code)" >&2
            return 1
        fi
        
        # Check if response is empty
        if [[ -z "$files_response" ]]; then
            log_error "Empty response from GitHub API" >&2
            return 1
        fi
        
        # Check if response contains an error
        if echo "$files_response" | jq -e '.message' > /dev/null 2>&1; then
            local error_message=$(echo "$files_response" | jq -r '.message')
            log_error "GitHub API error: $error_message" >&2
            log_info "Full API response: $files_response" >&2
            return 1
        fi
        
        # Check if this page has any files
        local files_count=$(echo "$files_response" | jq '. | length' 2>/dev/null)
        local jq_exit_code=$?
        
        if [[ $jq_exit_code -ne 0 ]]; then
            log_error "Failed to parse JSON response from GitHub API" >&2
            log_info "Raw response (first 500 chars): $(echo "$files_response" | head -c 500)" >&2
            return 1
        fi
        
        if [[ "$files_count" == "0" ]] || [[ "$files_count" == "null" ]]; then
            log_info "No more files on page $page, pagination complete" >&2
            break
        fi
        
        log_info "Found $files_count files on page $page" >&2
        
        # Parse the response to get file status and names for this page
        local page_files
        page_files=$(echo "$files_response" | jq -r '.[] | "\(.status) \(.filename)"' 2>/dev/null)
        
        # Check jq parsing success
        if [[ $? -ne 0 ]]; then
            log_error "Failed to parse GitHub API response with jq" >&2
            log_info "API Response preview: $(echo "$files_response" | head -c 200)" >&2
            return 1
        fi
        
        # Add this page's files to our collection
        if [[ -n "$page_files" ]]; then
            if [[ -n "$all_files" ]]; then
                all_files="$all_files"$'\n'"$page_files"
            else
                all_files="$page_files"
            fi
            log_success "Added $files_count files from page $page to collection" >&2
        fi
        
        # If we got fewer files than per_page, we've reached the end
        if [[ "$files_count" -lt "$per_page" ]]; then
            log_info "Reached end of pages (got $files_count < $per_page files)" >&2
            break
        fi
        
        # Move to next page
        ((page++))
        
        # Safety check to prevent infinite loops
        if [[ $page -gt 50 ]]; then
            log_warning "Reached maximum page limit (50), stopping pagination" >&2
            break
        fi
    done
    
    if [[ -z "$all_files" ]]; then
        log_warning "No files found in PR #$PR_NUMBER" >&2
        return 1
    fi
    
    local total_files=$(echo "$all_files" | wc -l | tr -d ' ')
    local total_pages_fetched=$((page - 1))
    log_success "Successfully fetched $total_files changed files across $total_pages_fetched pages" >&2
    
    # Additional debugging: show file status breakdown
    local added_count=$(echo "$all_files" | grep "^added " | wc -l | tr -d ' ')
    local modified_count=$(echo "$all_files" | grep "^modified " | wc -l | tr -d ' ')
    local removed_count=$(echo "$all_files" | grep "^removed " | wc -l | tr -d ' ')
    local renamed_count=$(echo "$all_files" | grep "^renamed " | wc -l | tr -d ' ')
    
    log_info "File status breakdown: Added($added_count) Modified($modified_count) Removed($removed_count) Renamed($renamed_count)" >&2
    
    echo "$all_files"
    return 0
}

# Generate git-tree using GitHub API data and existing render functions
generate_git_tree() {
    local base_branch="$1" 
    local target_branch="$2"
    local output_file="$3"
    
    log_info "Generating git-tree for $target_branch vs $base_branch using existing render functions" >&2
    
    # First, let's check what git diff shows locally for comparison
    local local_diff_count=0
    if command -v git >/dev/null 2>&1; then
        local_diff_count=$(git diff --name-status "origin/$base_branch...HEAD" 2>/dev/null | wc -l | tr -d ' ' || echo "0")
        log_info "Local git diff shows $local_diff_count changed files for comparison" >&2
    fi
    
    # Fetch changed files from GitHub API
    local changed_files
    if ! changed_files=$(fetch_changed_files_from_api); then
        log_error "Failed to fetch changed files from GitHub API" >&2
        
        # Fallback: try to use local git diff if API fails
        log_warning "Attempting fallback to local git diff..." >&2
        if command -v git >/dev/null 2>&1; then
            local local_diff
            local_diff=$(git diff --name-status "origin/$base_branch...HEAD" 2>/dev/null || echo "")
            if [[ -n "$local_diff" ]]; then
                log_success "Using local git diff as fallback ($local_diff_count files)" >&2
                changed_files="$local_diff"
            else
                log_error "Local git diff fallback also failed" >&2
                return 1
            fi
        else
            log_error "Git command not available for fallback" >&2
            return 1
        fi
    fi
    
    local api_file_count=$(echo "$changed_files" | wc -l | tr -d ' ')
    log_info "Using $api_file_count changed files for git-tree generation" >&2
    if [[ "$local_diff_count" -gt 0 ]] && [[ "$api_file_count" != "$local_diff_count" ]]; then
        log_warning "File count mismatch: API($api_file_count) vs Local($local_diff_count)" >&2
    fi
    
    # Convert GitHub API data to git diff format
    source "$(dirname "${BASH_SOURCE[0]}")/lib/api_converter.sh"
    local git_diff_data
    git_diff_data=$(convert_github_api_to_git_diff "$changed_files")
    
    # Source GitHub adapters to override git-tree functions with GitHub URL support
    source "$(dirname "${BASH_SOURCE[0]}")/lib/github_link_adapter.sh"
    source "$(dirname "${BASH_SOURCE[0]}")/lib/github_branch_adapter.sh"
    
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
    
    # Source and use the existing git-tree render function
    source "$(dirname "${BASH_SOURCE[0]}")/../../scripts/git-tree/lib/render/render_file_tree.sh"
    
    # Get repository name for project name
    local repo_name="${GITHUB_REPOSITORY##*/}"
    
    # Call the existing render function
    render_file_tree "$base_branch" "$output_file" "$target_branch" "$repo_name"
    
    # Restore git command
    unset -f git
    
    if [[ -f "$output_file" ]]; then
        log_success "Git-tree generated successfully using existing render functions" >&2
        return 0
    else
        log_error "Failed to generate git-tree file" >&2
        return 1
    fi
}

# Convert git-tree markdown to GitHub PR comment format
format_for_github_comment() {
    local git_tree_file="$1"
    local output_file="$2"
    
    log_info "Formatting git-tree output for GitHub comment" >&2
    
    if [[ ! -f "$git_tree_file" ]]; then
        log_error "Git-tree file not found: $git_tree_file" >&2
        exit 1
    fi
    
    # Source the GitHub markdown cleaner utility
    source "$(dirname "${BASH_SOURCE[0]}")/lib/github_markdown_cleaner.sh"
    
    # Create temporary file for content processing
    local temp_content="$(mktemp)"
    
    # Extract content (skip filepath comment, preserve original git-tree header)
    tail -n +2 "$git_tree_file" | grep -v "^<!-- filepath:" > "$temp_content"
    
    # Create GitHub comment with proper markers
    {
        echo "<!-- AUTO-GENERATED FILE TREE -->"
        echo "<!-- This comment will be updated automatically by the GitHub Action -->"
        echo ""
        
        # Clean the content for GitHub rendering (removes <br> tags)
        clean_markdown_for_github_stdin < "$temp_content"
        
        echo ""
        echo "---"
        echo "_Generated by [git-tree script](./scripts/git-tree/) for PR #${PR_NUMBER}_"
        echo "_🤖 This comment is automatically updated when the PR changes_"
        echo ""
        echo "<!-- END AUTO-GENERATED FILE TREE -->"
        
    } > "$output_file"
    
    # Clean up temporary file
    rm -f "$temp_content"
    
    log_success "GitHub comment formatted and saved to: $output_file" >&2
}

# Main execution function
main() {
    log_info "Starting Git-Tree PR Comment Generation (Enhanced Version with Pagination Fix)" >&2
    
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
