#!/bin/bash

# Single responsibility: Environment validation for GitHub Actions
# Validates required environment variables and displays debug info

# Source logging utilities
source "$(dirname "${BASH_SOURCE[0]}")/../utils/logger.sh"

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
        log_error "Missing required environment variables:"
        printf '  - %s\n' "${missing_vars[@]}" >&2
        exit 1
    fi
    
    log_success "All required environment variables are present"
}

# Display environment information for debugging
show_environment_info() {
    log_info "GitHub Action Environment:"
    echo "  Repository: $GITHUB_REPOSITORY" >&2
    echo "  PR Number: $PR_NUMBER" >&2
    echo "  Head Branch: $GITHUB_HEAD_REF" >&2
    echo "  Base Branch: $GITHUB_BASE_REF" >&2
}
