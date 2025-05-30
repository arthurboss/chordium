#!/bin/bash

# Target branch prompt
# Single responsibility: Prompt user for target branch selection

# Function to prompt for target branch
prompt_target_branch() {
    # Source color definitions and dependencies
    local script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    source "$script_dir/../ui/colors.sh"
    source "$script_dir/../../git/get_current_branch.sh"
    
    local current_branch=$(get_current_branch)
    echo -e "${CYAN}🎯 What is the target branch you want to compare?${NC}" >&2
    echo -e "${YELLOW}   (The branch you want to see changes TO)${NC}" >&2
    echo >&2
    echo -e "${MAGENTA}   Press Enter to use current branch: ${GREEN}$current_branch${NC}" >&2
    read -r -p "   Target branch: " target_input
    
    if [[ -z "$target_input" ]]; then
        echo -e "${GREEN}   ✓ Using current branch: $current_branch${NC}" >&2
        echo >&2
        echo "$current_branch"
    else
        echo -e "${GREEN}   ✓ Using specified target: $target_input${NC}" >&2
        echo >&2
        echo "$target_input"
    fi
}
