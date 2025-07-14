#!/bin/bash

# Wizard header display
# Single responsibility: Show the main wizard welcome header

# Function to show the wizard header
show_wizard_header() {
    # Source color definitions
    local script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    source "$script_dir/colors.sh"
    
    echo >&2
    echo -e "${CYAN}╔══════════════════════════════════════════════════════════════════╗${NC}" >&2
    echo -e "${CYAN}║                    🧙 Git Tree Wizard                            ║${NC}" >&2
    echo -e "${CYAN}║               Generate file trees for git changes                ║${NC}" >&2
    echo -e "${CYAN}╚══════════════════════════════════════════════════════════════════╝${NC}" >&2
    echo >&2
}
