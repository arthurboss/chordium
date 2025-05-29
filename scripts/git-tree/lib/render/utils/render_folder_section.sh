#!/bin/bash

# Utility for rendering individual folder sections in the file tree
# Handles collapsible folder structures with files

# Render a single folder and its files
render_folder_section() {
    local folder="$1"
    local all_files="$2"
    local relative_prefix="$3"
    local output_file="$4"
    
    # Source dependencies
    local script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    source "$script_dir/../../project/get_status_icon.sh"
    source "$script_dir/file_processor.sh"
    source "$script_dir/create_markdown_link.sh"
    source "$script_dir/output_writer.sh"
    
    # Skip root folder (handled separately)
    [[ "$folder" == "." ]] && return
    
    # Start folder section
    echo "> <!-- $folder folder -->" >> "$output_file"
    echo "> <details>" >> "$output_file"
    echo "> <summary>" >> "$output_file"
    echo "> &#9492;<strong>🗂️ $folder</strong>" >> "$output_file"
    echo "> </summary>" >> "$output_file"
    echo ">" >> "$output_file"
    
    # Get files for this folder
    local folder_files=$(get_folder_files "$all_files" "$folder")
    
    # Convert to array to check for last file
    local files_array=()
    while IFS= read -r file_line; do
        if [[ -n "$file_line" ]]; then
            files_array+=("$file_line")
        fi
    done <<< "$folder_files"
    
    # Process each file in the folder
    for i in "${!files_array[@]}"; do
        local file_line="${files_array[$i]}"
        local status=$(extract_status "$file_line")
        local filepath=$(extract_filepath "$file_line")
        local icon=$(get_status_icon "$status")
        local file_link=$(create_markdown_link "$filepath" "$relative_prefix")
        
        # Use different connector for last file
        if [[ $i -eq $((${#files_array[@]} - 1)) ]]; then
            echo "> &emsp;&emsp;&#9493;$icon $file_link" >> "$output_file"
        else
            echo "> &emsp;&emsp;&#9501;$icon $file_link" >> "$output_file"
        fi
    done
    
    # Close folder section
    close_blockquote_details "$output_file"
}
