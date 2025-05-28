#!/bin/bash

# File and path utility functions for file tree generation
# Handles output file generation, directory management, and path resolution

# Function to generate auto filename
generate_auto_filename() {
    local target_branch="$1"
    local base_branch="$2"
    local timestamp=$(date +"%Y-%m-%d_%H-%M-%S")
    
    # Sanitize branch names for filename (replace / with -)
    local safe_target=$(echo "$target_branch" | sed 's/[\/:]/-/g')
    local safe_base=$(echo "$base_branch" | sed 's/[\/:]/-/g')
    
    echo "results/file-tree_${safe_target}-vs-${safe_base}_${timestamp}.md"
}

# Function to ensure results directory exists
ensure_results_directory() {
    local script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    local results_dir="${script_dir}/results"
    
    if [[ ! -d "$results_dir" ]]; then
        mkdir -p "$results_dir"
        echo "📁 Created results directory: $results_dir"
    fi
}

# Function to resolve output file path
resolve_output_path() {
    local output_file="$1"
    local script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    
    # If output file doesn't start with results/, add the results/ prefix
    if [[ "$output_file" != results/* ]]; then
        output_file="results/${output_file}"
    fi
    
    # Convert to absolute path
    echo "${script_dir}/${output_file}"
}

# Function to add .md extension if missing
ensure_md_extension() {
    local filename="$1"
    if [[ "$filename" != *.md ]]; then
        echo "${filename}.md"
    else
        echo "$filename"
    fi
}
