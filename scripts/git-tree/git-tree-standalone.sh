#!/bin/bash

# Standalone script for generating file tree structure based on real git changes
# Self-contained version with all required functions included
# 
# Usage: 
#   ./git-tree-standalone.sh [base_branch] [output_file]
# 
# Examples:
#   ./git-tree-standalone.sh
#   ./git-tree-standalone.sh main
#   ./git-tree-standalone.sh main compare-output.md

# Get the directory of this script for relative imports
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Source all utility functions via the central loader
source "$SCRIPT_DIR/lib/loader.sh"

# Colors
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Main standalone script logic
main() {
    # Check for help flag first
    if [[ "$1" == "--help" || "$1" == "-h" ]]; then
        show_standalone_usage
        exit 0
    fi
    
    # Check if we're in a git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        echo "Error: Not in a git repository"
        exit 1
    fi
    
    # Parse legacy arguments
    parse_legacy_arguments "$@"
    local base_branch="$PARSED_BASE_BRANCH"
    local output_file="$PARSED_OUTPUT_FILE"
    
    # Auto-detect base branch if not provided
    if [[ -z "$base_branch" ]]; then
        base_branch=$(detect_base_branch)
        echo -e "${CYAN}Auto-detected base branch:${NC} ${MAGENTA}$base_branch${NC}"
        echo
    else
        echo -e "${CYAN}Using specified base branch:${NC} ${MAGENTA}$base_branch${NC}"
        echo
    fi
    
    # Auto-generate output file if not provided
    if [[ -z "$output_file" ]]; then
        local current_branch=$(get_current_branch)
        output_file=$(generate_auto_filename "$current_branch" "$base_branch")
        echo -e "${CYAN}Auto-generated output file:${NC} ${MAGENTA}$output_file${NC}"
        echo
    else
        # Ensure .md extension
        output_file=$(ensure_md_extension "$output_file")
        echo -e "${CYAN}Using specified output file:${NC} ${MAGENTA}$output_file${NC}"
        echo
    fi
    
    # Ensure results directory exists and resolve full output path
    ensure_results_directory
    output_file=$(resolve_output_path "$output_file")
    
    local current_branch=$(get_current_branch)
    local project_name=$(get_project_name)
    
    echo -e "${CYAN}Comparing current branch against:${NC} ${MAGENTA}$base_branch${NC}"
    echo
    echo -e "${CYAN}Output file:${NC} ${MAGENTA}$output_file${NC}"
    echo
    # Get all changed files and count them (comparing current against base)
    local all_files=$(git diff --name-status $base_branch...HEAD)
    local total_files=$(echo "$all_files" | wc -l | tr -d ' ')
    
    # Handle empty result
    if [[ -z "$all_files" || "$total_files" -eq 0 ]]; then
        echo -e "${CYAN}No files changed between HEAD and ${MAGENTA}$base_branch${NC}"
        echo
        return 1
    fi
    
    echo "<!-- filepath: $output_file -->" > "$output_file"
    echo "## 🔄 Changed Files ($total_files total)" >> "$output_file"
    echo "" >> "$output_file"
    
    # Format branch names with links if they exist on remote
    local formatted_current_branch=$(format_branch_name "$current_branch")
    local formatted_base_branch=$(format_branch_name "$base_branch")
    echo "$formatted_current_branch vs $formatted_base_branch" >> "$output_file"
    echo "" >> "$output_file"
    echo "> <details open>" >> "$output_file"
    echo "> <summary>" >> "$output_file"
    echo "> <strong>🏠 $project_name</strong>" >> "$output_file"
    echo "> </summary>" >> "$output_file"
    echo ">" >> "$output_file"

    # Get list of all folders that have changed files (dynamically)
    local folders_with_files=()
    local all_changed_folders=$(echo "$all_files" | grep -v "^[AMD][[:space:]]*[^/]*$" | sed 's|^[AMD][[:space:]]*\([^/]*\)/.*|\1|' | sort -u)

    # Add the root folder if there are any root files
    local root_files=$(echo "$all_files" | grep "^[AMD][[:space:]]*[^/]*$")
    if [[ -n "$root_files" ]]; then
        folders_with_files+=(".")
    fi

    # Add all folders that have changed files
    while IFS= read -r folder; do
        if [[ -n "$folder" ]]; then
            folders_with_files+=("$folder")
        fi
    done <<< "$all_changed_folders"

    echo "> <div>" >> "$output_file"

    # Process files in root folder first
    if [[ " ${folders_with_files[@]} " =~ " . " ]]; then
        # Get root files and convert to array to check last file
        local root_files_array=()
        while IFS= read -r file_line; do
            if [[ -n "$file_line" ]]; then
                root_files_array+=("$file_line")
            fi
        done <<< "$(echo "$all_files" | sort -k2 | grep "^[AMD][[:space:]]*[^/]*$")"
        
        # Process each root file
        for i in "${!root_files_array[@]}"; do
            local file_line="${root_files_array[$i]}"
            local status=$(echo "$file_line" | awk '{print $1}')
            local filename=$(echo "$file_line" | awk '{print $2}')
            local icon=$(get_status_icon "$status")
            
            # Check if this is the last root file
            if [[ $i -eq $((${#root_files_array[@]} - 1)) ]]; then
                echo "> &emsp;&#9493;$icon $filename" >> "$output_file"
            else
                echo "> &emsp;&#9501;$icon $filename<br>" >> "$output_file"
            fi
        done
    fi

    echo "> </div>" >> "$output_file"
    echo ">" >> "$output_file"

    # Process each folder
    for folder in "${folders_with_files[@]}"; do
        if [[ "$folder" == "." ]]; then
            continue  # Skip root folder as it's already processed
        fi
        
        echo "> <!-- $folder folder -->" >> "$output_file"
        echo "> <details>" >> "$output_file"
        echo "> <summary>" >> "$output_file"
        echo "> &#9492;<strong>🗂️ $folder</strong>" >> "$output_file"
        echo "> </summary>" >> "$output_file"
        echo ">" >> "$output_file"
        echo "> <div>" >> "$output_file"
        
        # Get files for this folder, sorted alphabetically by filename
        local folder_files=$(echo "$all_files" | sort -k2 | grep "^[AMD][[:space:]]*$folder/")
        
        # Convert to array to check last file
        local files_array=()
        while IFS= read -r file_line; do
            if [[ -n "$file_line" ]]; then
                files_array+=("$file_line")
            fi
        done <<< "$folder_files"
        
        # Process each file
        for i in "${!files_array[@]}"; do
            local file_line="${files_array[$i]}"
            local status=$(echo "$file_line" | awk '{print $1}')
            local filepath=$(echo "$file_line" | awk '{print $2}')
            local filename=$(basename "$filepath")
            local icon=$(get_status_icon "$status")
            
            # Check if this is the last file
            if [[ $i -eq $((${#files_array[@]} - 1)) ]]; then
                echo "> &emsp;&emsp;&#9493;$icon $filename" >> "$output_file"
            else
                echo "> &emsp;&emsp;&#9501;$icon $filename<br>" >> "$output_file"
            fi
        done
        
        echo "> </div>" >> "$output_file"
        echo "> </details>" >> "$output_file"
        echo ">" >> "$output_file"
    done

    echo "> </details>" >> "$output_file"
    
    # Add file summary sections
    render_file_summary "$base_branch" "$output_file" "$all_files"
    
    echo -e "${CYAN}File tree generated successfully in${NC} ${MAGENTA}$output_file${NC}"
    echo
    echo -e "${CYAN}Total files:${NC} ${MAGENTA}$total_files${NC}"
    echo
    echo -e "${CYAN}Comparison:${NC} ${MAGENTA}$current_branch${NC} ${CYAN}vs${NC} ${MAGENTA}$base_branch${NC}"
    echo
    return 0
}

# Run main function with all arguments
main "$@"
