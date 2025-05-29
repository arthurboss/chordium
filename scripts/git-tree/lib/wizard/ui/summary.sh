#!/bin/bash

# Wizard summary display
# Single responsibility: Show configuration summary before execution

# Function to show the summary before execution
show_wizard_summary() {
    local base_branch="$1"
    local target_branch="$2"
    local output_file="$3"
    local cleanup="$4"
    
    # Source color definitions
    local script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    source "$script_dir/colors.sh"
    
    echo -e "${CYAN}╔══════════════════════════════════════════════════════════════════╗${NC}" >&2
    echo -e "${CYAN}║                         📋 Summary                               ║${NC}" >&2
    echo -e "${CYAN}╚══════════════════════════════════════════════════════════════════╝${NC}" >&2
    echo >&2
    echo -e "${CYAN}   Base branch:    ${MAGENTA}$base_branch${NC}" >&2
    echo -e "${CYAN}   Target branch:  ${MAGENTA}$target_branch${NC}" >&2
    echo -e "${CYAN}   Output file:    ${MAGENTA}$(basename "$output_file")${NC}" >&2
    if [[ "$cleanup" == "yes" ]]; then
        echo -e "${CYAN}   Cleanup:        ${MAGENTA}Will remove previous results${NC}" >&2
    else
        echo -e "${CYAN}   Cleanup:        ${MAGENTA}Will keep previous results${NC}" >&2
    fi
    echo >&2
    echo -e "${CYAN}Press Enter to continue or Ctrl+C to cancel...${NC}" >&2
    read -r
    echo >&2
}
