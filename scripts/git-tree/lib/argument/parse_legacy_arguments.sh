#!/bin/bash

# Function to parse legacy command line arguments (for standalone script)
parse_legacy_arguments() {
    local base_branch=""
    local output_file=""
    
    # Process arguments
    while [[ $# -gt 0 ]]; do
        if [[ -z "$base_branch" ]]; then
            base_branch="$1"
        elif [[ -z "$output_file" ]]; then
            output_file="$1"
        fi
        shift
    done
    
    # Export variables for calling script
    PARSED_BASE_BRANCH="$base_branch"
    PARSED_OUTPUT_FILE="$output_file"
}
