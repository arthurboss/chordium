#!/bin/bash

# Function to resolve output file path
resolve_output_path() {
    local output_file="$1"
    local script_dir="${2:-$GIT_TREE_SCRIPT_DIR}"
    
    # If output file doesn't start with results/, add the results/ prefix
    if [[ "$output_file" != results/* ]]; then
        output_file="results/${output_file}"
    fi
    
    # Convert to absolute path
    echo "${script_dir}/${output_file}"
}
