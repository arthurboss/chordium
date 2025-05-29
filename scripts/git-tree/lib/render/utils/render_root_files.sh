#!/bin/bash

# Utility for rendering root directory files in the file tree
# Handles files that exist in the project root

# Render files in the root directory
render_root_files() {
    local all_files="$1"
    local url_generator_func="$2"
    local url_generator_param="$3"
    local output_file="$4"
    
    # Source dependencies
    local script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    source "$script_dir/../../project/get_status_icon.sh"
    source "$script_dir/file_processor.sh"
    source "$script_dir/create_markdown_link.sh"
    
    # Get root files
    local root_files=$(get_root_files "$all_files")
    [[ -z "$root_files" ]] && return
    
    # Convert to array to check for last file
    local root_files_array=()
    while IFS= read -r file_line; do
        if [[ -n "$file_line" ]]; then
            root_files_array+=("$file_line")
        fi
    done <<< "$(echo "$root_files" | sort -k2)"
    
    # Process each root file
    for i in "${!root_files_array[@]}"; do
        local file_line="${root_files_array[$i]}"
        local status=$(extract_status "$file_line")
        local filepath=$(extract_filepath "$file_line")
        local icon=$(get_status_icon "$status")
        local url=$($url_generator_func "$filepath" "$url_generator_param")
        local file_link=$(create_markdown_link "$filepath" "$url")
        
        # Use different connector for last file (no <br> tag for last file)
        if [[ $i -eq $((${#root_files_array[@]} - 1)) ]]; then
            echo "> &emsp;&#9493;$icon $file_link" >> "$output_file"
        else
            echo "> &emsp;&#9501;$icon $file_link<br>" >> "$output_file"
        fi
    done
}
