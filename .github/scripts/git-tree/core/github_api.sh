#!/bin/bash

# Single responsibility: GitHub API client with pagination support
# Fetches changed files from GitHub PR API with proper pagination handling

# Source logging utilities
source "$(dirname "${BASH_SOURCE[0]}")/../utils/logger.sh"

# Fetch changed files from GitHub API with pagination support
fetch_changed_files_from_api() {
    log_info "Fetching changed files from GitHub API..."
    
    local all_files=""
    local page=1
    local per_page=100
    
    while true; do
        # Fetch changed files from GitHub API with pagination
        local files_response
        local api_url="https://api.github.com/repos/$GITHUB_REPOSITORY/pulls/$PR_NUMBER/files?page=$page&per_page=$per_page"
        
        files_response=$(curl -s -H "Authorization: token $GITHUB_TOKEN" "$api_url")
        local curl_exit_code=$?
        
        # Check curl exit code
        if [[ $curl_exit_code -ne 0 ]]; then
            log_error "Failed to fetch files from GitHub API (curl exit code: $curl_exit_code)"
            return 1
        fi
        
        # Check if response is empty
        if [[ -z "$files_response" ]]; then
            log_error "Empty response from GitHub API"
            return 1
        fi
        
        # Check if response contains an error
        if echo "$files_response" | jq -e '.message' > /dev/null 2>&1; then
            local error_message=$(echo "$files_response" | jq -r '.message')
            log_error "GitHub API error: $error_message"
            return 1
        fi
        
        # Check if this page has any files
        local files_count=$(echo "$files_response" | jq '. | length' 2>/dev/null)
        local jq_exit_code=$?
        
        if [[ $jq_exit_code -ne 0 ]]; then
            log_error "Failed to parse JSON response from GitHub API"
            return 1
        fi
        
        if [[ "$files_count" == "0" ]] || [[ "$files_count" == "null" ]]; then
            break
        fi
        
        # Parse the response to get file status and names for this page
        local page_files
        page_files=$(echo "$files_response" | jq -r '.[] | "\(.status) \(.filename)"' 2>/dev/null)
        
        # Check jq parsing success
        if [[ $? -ne 0 ]]; then
            log_error "Failed to parse GitHub API response with jq"
            return 1
        fi
        
        # Add this page's files to our collection
        if [[ -n "$page_files" ]]; then
            if [[ -n "$all_files" ]]; then
                all_files="$all_files"$'\n'"$page_files"
            else
                all_files="$page_files"
            fi
        fi
        
        # If we got fewer files than per_page, we've reached the end
        if [[ "$files_count" -lt "$per_page" ]]; then
            break
        fi
        
        # Move to next page
        ((page++))
        
        # Safety check to prevent infinite loops
        if [[ $page -gt 50 ]]; then
            log_warning "Reached maximum page limit (50), stopping pagination"
            break
        fi
    done
    
    if [[ -z "$all_files" ]]; then
        log_warning "No files found in PR #$PR_NUMBER"
        return 1
    fi
    
    local total_files=$(echo "$all_files" | wc -l | tr -d ' ')
    log_success "Successfully fetched $total_files changed files"
    
    echo "$all_files"
    return 0
}
