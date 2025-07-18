#!/bin/bash

# Function to ensure results directory exists
ensure_results_directory() {
    local script_dir="${GIT_TREE_SCRIPT_DIR:-$(pwd)}"
    local results_dir="${script_dir}/results"
    
    if [[ ! -d "$results_dir" ]]; then
        mkdir -p "$results_dir"
        echo "📁 Created results directory: $results_dir"
    fi
}
