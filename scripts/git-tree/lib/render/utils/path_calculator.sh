#!/bin/bash

# Single responsibility: Calculate relative paths for git-tree output
# Pure function - no GitHub logic, no environment detection

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
