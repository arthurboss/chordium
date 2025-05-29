#!/bin/bash

# Cleanup prompt
# Single responsibility: Prompt user for cleanup decision

# Function to prompt for cleanup of previous results
prompt_cleanup_results() {
    # Source color definitions
    local script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    source "$script_dir/../ui/colors.sh"
    
    local results_dir="$GIT_TREE_SCRIPT_DIR/results"
    if [ ! -d "$results_dir" ] || [ -z "$(ls -A "$results_dir" 2>/dev/null)" ]; then
        # No results directory or it's empty, nothing to clean
        echo "no"
        return
    fi
    
    echo -e "${CYAN}🗂️  Do you want to remove previous result files?${NC}" >&2
    echo -e "${YELLOW}   (Current results/ directory contains $(ls -1 "$results_dir" | wc -l | tr -d ' ') files)${NC}" >&2
    echo >&2
    echo -e "${MAGENTA}   y) Yes, clean up previous results${NC}" >&2
    echo -e "${MAGENTA}   n) No, keep previous results${NC}" >&2
    echo >&2
    read -r -p "   Remove previous results? [y/N]: " cleanup_input
    
    case "$cleanup_input" in
        [yY][eE][sS]|[yY])
            echo -e "${GREEN}   ✓ Will clean up previous results${NC}" >&2
            echo >&2
            echo "yes"
            ;;
        *)
            echo -e "${GREEN}   ✓ Will keep previous results${NC}" >&2
            echo >&2
            echo "no"
            ;;
    esac
}
