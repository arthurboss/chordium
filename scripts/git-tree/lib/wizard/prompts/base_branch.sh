#!/bin/bash

# Base branch prompt
# Single responsibility: Prompt user for base branch selection

# Function to prompt for base branch
prompt_base_branch() {
    # Source color definitions and dependencies
    local script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    source "$script_dir/../ui/colors.sh"
    source "$script_dir/../../git/detect_base_branch.sh"
    
    local detected_base=$(detect_base_branch)
    echo -e "${CYAN}📍 What is the base branch you want to compare against?${NC}" >&2
    echo -e "${YELLOW}   (The branch you want to see changes FROM)${NC}" >&2
    echo >&2
    echo -e "${MAGENTA}   Press Enter to use auto-detected: ${GREEN}$detected_base${NC}" >&2
    read -r -p "   Base branch: " base_input
    
    if [[ -z "$base_input" ]]; then
        echo -e "${GREEN}   ✓ Using auto-detected base: $detected_base${NC}" >&2
        echo >&2
        echo "$detected_base"
    else
        echo -e "${GREEN}   ✓ Using specified base: $base_input${NC}" >&2
        echo >&2
        echo "$base_input"
    fi
}
