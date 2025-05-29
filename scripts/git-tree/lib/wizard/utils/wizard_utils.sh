#!/bin/bash

# Wizard utilities
# Single responsibility: Common utility functions for wizard operations

# Function to validate wizard dependencies
validate_wizard_dependencies() {
    # Check if we're in a git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        echo "Error: Not in a git repository" >&2
        return 1
    fi
    
    # Check if required environment variables are set
    if [[ -z "$GIT_TREE_SCRIPT_DIR" ]]; then
        echo "Error: GIT_TREE_SCRIPT_DIR not set" >&2
        return 1
    fi
    
    return 0
}

# Function to export wizard results for main script consumption
export_wizard_results() {
    local base_branch="$1"
    local target_branch="$2" 
    local output_file="$3"
    local cleanup="$4"
    
    # Export results for the main script
    export WIZARD_BASE_BRANCH="$base_branch"
    export WIZARD_TARGET_BRANCH="$target_branch"
    export WIZARD_OUTPUT_FILE="$output_file"
    export WIZARD_CLEANUP="$cleanup"
}
