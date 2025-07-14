#!/bin/bash

# Utility for rendering individual folder sections in the file tree
# Handles collapsible folder structures with files

# Render a single folder and its files
render_folder_section() {
    local folder="$1"
    local all_files="$2"
    local url_generator_func="$3"
    local url_generator_param="$4"
    local output_file="$5"
    
    # Source dependencies
    local script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    source "$script_dir/../../project/get_status_icon.sh"
    source "$script_dir/file_processor.sh"
    source "$script_dir/create_markdown_link.sh"
    source "$script_dir/output_writer.sh"
    
    # Skip root folder (handled separately)
    [[ "$folder" == "." ]] && return
    
    # Get files for this folder to determine the full path
    local folder_files=$(get_folder_files "$all_files" "$folder")
    
    # Debug output
    echo "DEBUG: folder=$folder" >> /tmp/git_tree_folder_debug.log
    echo "DEBUG: folder_files=$folder_files" >> /tmp/git_tree_folder_debug.log
    
    # Extract the full folder path from the first file in this folder
    local full_folder_path=""
    if [[ -n "$folder_files" ]]; then
        local first_file=$(echo "$folder_files" | head -n1)
        local first_filepath=$(extract_filepath "$first_file")
        # Extract the directory path and remove trailing slash if present
        full_folder_path=$(dirname "$first_filepath")
        full_folder_path="${full_folder_path%/}"
        echo "DEBUG: first_file=$first_file" >> /tmp/git_tree_folder_debug.log
        echo "DEBUG: first_filepath=$first_filepath" >> /tmp/git_tree_folder_debug.log
        echo "DEBUG: full_folder_path=$full_folder_path" >> /tmp/git_tree_folder_debug.log
    fi
    
    # Use full path for comment, fallback to folder name if path extraction fails
    local comment_path="${full_folder_path:-$folder}"
    echo "DEBUG: comment_path=$comment_path" >> /tmp/git_tree_folder_debug.log
    
    # Start folder section with full relative path in comment
    echo "> <!-- $comment_path/ folder -->" >> "$output_file"
    echo "> <details>" >> "$output_file"
    echo "> <summary>" >> "$output_file"
    
    # Calculate the depth of the current folder (excluding root level)
    local depth=0
    if [[ "$comment_path" != "$folder" ]]; then
        # Count the number of path segments to determine the depth
        IFS='/' read -ra path_parts <<< "$comment_path"
        depth=${#path_parts[@]}
    fi
    
    # Create indentation based on depth (one less than depth for root level)
    local indent=""
    for ((i=1; i<depth; i++)); do  # Start from 1 to exclude root level
        indent+="&emsp;"
    done
    
    # Output the folder entry with proper indentation
    echo "> ${indent}&#9492;<strong>🗂️ $folder</strong>" >> "$output_file"
    echo "> </summary>" >> "$output_file"
    echo ">" >> "$output_file"
    
    # Use the same folder_files we already retrieved
    # (don't call get_folder_files again)
    
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
        local url=$($url_generator_func "$filepath" "$url_generator_param")
        local file_link=$(create_markdown_link "$filepath" "$url")
        
        # Use different connector for last file (no <br> tag for last file)
        if [[ $i -eq $((${#files_array[@]} - 1)) ]]; then
            echo "> &emsp;&#9493;$icon $file_link" >> "$output_file"
        else
            echo "> &emsp;&#9501;$icon $file_link<br>" >> "$output_file"
        fi
    done
    
    # Close folder section
    close_blockquote_details "$output_file"
}
