#!/bin/bash

# Single responsibility: Format branch name for display
# Pure function - no GitHub links, no environment detection

format_branch_name() {
    local branch="$1"
    
    # Simple formatting - bold and code style only
    echo "**\`$branch\`**"
}
