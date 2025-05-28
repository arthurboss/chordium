#!/bin/bash

# Utility functions for calculating relative paths
# Handles path resolution for markdown links

# Calculate relative path from output file location to git root
calculate_relative_prefix() {
    local output_file="$1"
    
    local git_root=$(git rev-parse --show-toplevel)
    local output_dir=$(dirname "$output_file")
    
    # Use Python to calculate the relative path from output directory to git root
    local relative_prefix=$(python3 -c "import os; print(os.path.relpath('$git_root', '$output_dir'))" 2>/dev/null)
    
    # Fallback if Python fails or returns empty
    if [[ -z "$relative_prefix" || "$relative_prefix" == "." ]]; then
        echo ""
    else
        echo "$relative_prefix/"
    fi
}

# Create a markdown link for a file
create_markdown_link() {
    local filepath="$1"
    local relative_prefix="$2"
    local filename=$(basename "$filepath")
    
    echo "[$filename]($relative_prefix$filepath)"
}
