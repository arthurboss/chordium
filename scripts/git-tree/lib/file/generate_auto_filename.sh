#!/bin/bash

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
