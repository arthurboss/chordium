#!/bin/bash

# Function to render the file tree structure
render_file_tree() {
    local base_branch="$1"
    local output_file="$2"
    local target_branch="$3"
    local project_name="$4"
    local url_generator_func="${5:-generate_git_url}"  # Default to git URL generator
    local url_generator_param="$6"
    
    # Dependencies are loaded via central loader.sh
    
    # Get all changed files and count them (comparing target against base)
    local all_files=$(git diff --name-status $base_branch...$target_branch)
    local total_files=$(echo "$all_files" | wc -l | tr -d ' ')
    
    # Handle empty result
    if [[ -z "$all_files" || "$total_files" -eq 0 ]]; then
        echo "No files changed between $target_branch and $base_branch"
        return 1
    fi
    
    # Render header section
    render_header "$base_branch" "$target_branch" "$project_name" "$total_files" "$output_file"
    
    # Calculate relative path prefix for git URL generator (when using git URLs)
    local relative_prefix=$(calculate_relative_prefix "$output_file")
    
    # Set the URL generator parameter based on the function being used
    if [[ "$url_generator_func" == "generate_git_url" ]]; then
        url_generator_param="$relative_prefix"
    fi

    # Get list of all folders that have changed files (dynamically)
    local folders_with_files=()
    local all_changed_folders=$(get_changed_folders "$all_files")

    # Add the root folder if there are any root files
    local root_files=$(get_root_files "$all_files")
    if [[ -n "$root_files" ]]; then
        folders_with_files+=(".")
    fi

    # Add all folders that have changed files
    while IFS= read -r folder; do
        if [[ -n "$folder" ]]; then
            folders_with_files+=("$folder")
        fi
    done <<< "$all_changed_folders"

    # Process files in root folder first
    render_root_files "$all_files" "$url_generator_func" "$url_generator_param" "$output_file"

    # Process each folder
    for folder in "${folders_with_files[@]}"; do
        render_folder_section "$folder" "$all_files" "$url_generator_func" "$url_generator_param" "$output_file"
    done

    echo "> </details>" >> "$output_file"
    
    # Add file summary sections
    render_file_summary "$base_branch" "$output_file" "$all_files"
    
    return 0
}
