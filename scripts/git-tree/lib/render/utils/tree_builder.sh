#!/bin/bash

# Tree builder utility for creating proper hierarchical file tree structure
# This replaces the flattened folder approach with proper recursive nesting

# Build a hierarchical tree structure from git diff output
build_file_tree() {
    local all_files="$1"
    local url_generator_func="$2"
    local url_generator_param="$3"
    local output_file="$4"
    local base_path="${5:-.}"  # Current path level (default to root)
    local indent_level="${6:-1}"  # Indentation level for nested folders
    
    # Create indentation based on level
    local indent=""
    for ((i=0; i<indent_level; i++)); do
        indent+="&emsp;"
    done
    
    # Get all paths at this level (immediate children only)
    local paths_at_level=()
    local files_at_level=()
    
    while IFS= read -r line; do
        if [[ -z "$line" ]]; then continue; fi
        
        local status=$(echo "$line" | cut -c1)
        local filepath=$(echo "$line" | cut -c3-)
        
        # Skip if not in current base path
        if [[ "$base_path" != "." ]]; then
            if [[ ! "$filepath" =~ ^"$base_path"/ ]]; then
                continue
            fi
            # Remove base path prefix
            filepath="${filepath#$base_path/}"
        fi
        
        # Check if this is a direct child (no more slashes) or a nested path
        if [[ "$filepath" == */* ]]; then
            # This is a nested path - extract the immediate directory
            local immediate_dir="${filepath%%/*}"
            if [[ ! " ${paths_at_level[@]} " =~ " $immediate_dir " ]]; then
                paths_at_level+=("$immediate_dir")
            fi
        else
            # This is a direct file
            files_at_level+=("$status $filepath")
        fi
    done <<< "$all_files"
    
    # Sort directories and files separately
    IFS=$'\n' paths_at_level=($(sort <<< "${paths_at_level[*]}")); unset IFS
    IFS=$'\n' files_at_level=($(sort <<< "${files_at_level[*]}")); unset IFS
    
    # Render directories first
    for dir in "${paths_at_level[@]}"; do
        if [[ -z "$dir" ]]; then continue; fi
        
        local full_dir_path
        if [[ "$base_path" == "." ]]; then
            full_dir_path="$dir"
        else
            full_dir_path="$base_path/$dir"
        fi
        
        # Start directory section
        echo "> <!-- $dir folder -->" >> "$output_file"
        echo "> <details>" >> "$output_file"
        echo "> <summary>" >> "$output_file"
        echo "> ${indent}&#9492;<strong>🗂️ $dir</strong>" >> "$output_file"
        echo "> </summary>" >> "$output_file"
        echo ">" >> "$output_file"
        
        # Recursively build subtree
        build_file_tree "$all_files" "$url_generator_func" "$url_generator_param" "$output_file" "$full_dir_path" $((indent_level + 1))
        
        echo "> </details>" >> "$output_file"
        echo ">" >> "$output_file"
    done
    
    # Then render files at this level
    local file_count=${#files_at_level[@]}
    for i in "${!files_at_level[@]}"; do
        local file_entry="${files_at_level[$i]}"
        local status="${file_entry%% *}"
        local filename="${file_entry#* }"
        
        local full_filepath
        if [[ "$base_path" == "." ]]; then
            full_filepath="$filename"
        else
            full_filepath="$base_path/$filename"
        fi
        
        # Get status icon and URL
        local icon=$(get_status_icon "$status")
        local url=$($url_generator_func "$full_filepath" "$url_generator_param")
        local file_link=$(create_markdown_link "$full_filepath" "$url")
        
        # Determine connector (last file gets different connector)
        local connector="&#9501;"  # ├
        if [[ $i -eq $((file_count - 1)) ]] && [[ ${#paths_at_level[@]} -eq 0 ]]; then
            connector="&#9493;"  # └
        fi
        
        echo "> ${indent}${connector}${icon} ${file_link}<br>" >> "$output_file"
    done
}
