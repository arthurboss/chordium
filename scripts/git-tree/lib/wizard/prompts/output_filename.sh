#!/bin/bash

# Output filename prompt
# Single responsibility: Prompt user for output filename

# Function to prompt for output filename
prompt_output_filename() {
    local base_branch="$1"
    local target_branch="$2"
    
    # Source color definitions and dependencies
    local script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    source "$script_dir/../ui/colors.sh"
    source "$script_dir/../../file/generate_auto_filename.sh"
    source "$script_dir/../../file/ensure_md_extension.sh"
    
    local auto_filename=$(generate_auto_filename "$target_branch" "$base_branch")
    # Extract just the filename without the results/ prefix for display
    local display_filename=$(basename "$auto_filename")
    
    echo -e "${CYAN}📄 What should the output file be named?${NC}" >&2
    echo -e "${YELLOW}   (File will be saved in the results/ directory)${NC}" >&2
    echo >&2
    echo -e "${MAGENTA}   Press Enter to auto-generate: ${GREEN}$display_filename${NC}" >&2
    read -r -p "   Output filename: " filename_input
    
    if [[ -z "$filename_input" ]]; then
        echo -e "${GREEN}   ✓ Using auto-generated filename: $display_filename${NC}" >&2
        echo >&2
        echo "$auto_filename"
    else
        # Ensure .md extension and add results/ prefix if not present
        local final_filename=$(ensure_md_extension "$filename_input")
        if [[ "$final_filename" != results/* ]]; then
            final_filename="results/$final_filename"
        fi
        echo -e "${GREEN}   ✓ Using specified filename: $(basename "$final_filename")${NC}" >&2
        echo >&2
        echo "$final_filename"
    fi
}
