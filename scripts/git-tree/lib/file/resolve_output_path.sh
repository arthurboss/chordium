#!/bin/bash

# Function to resolve output file path
resolve_output_path() {
    local output_file="$1"
    local script_dir="${GIT_TREE_SCRIPT_DIR:-$(pwd)}"
    
    # Always use the top-level results/ folder
    if [[ "$output_file" != results/* ]]; then
        output_file="results/${output_file}"
    fi
    
    # Convert to absolute path
    echo "${script_dir}/${output_file}"
}
