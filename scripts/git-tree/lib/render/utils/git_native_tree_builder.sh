#!/bin/bash

# Git-native tree builder using optimized algorithms for performance
# This replaces the recursive approach with efficient processing

# Build a hierarchical tree structure with optimized performance
build_file_tree_native() {
    local all_files="$1"
    local url_generator_func="$2"
    local url_generator_param="$3"
    local output_file="$4"
    local base_path="${5:-.}"  # Current path level (default to root)
    local indent_level="${6:-1}"  # Indentation level for nested folders
    
    # Use regular arrays for better compatibility
    local directories_found=()
    local files_at_level=()
    
    # Parse the git diff input to extract files and directories at this level
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
            
            # Check if directory is already in our list
            local dir_exists=false
            for existing_dir in "${directories_found[@]}"; do
                if [[ "$existing_dir" == "$immediate_dir" ]]; then
                    dir_exists=true
                    break
                fi
            done
            
            if [[ "$dir_exists" == false ]]; then
                directories_found+=("$immediate_dir")
            fi
        else
            # This is a direct file
            files_at_level+=("$status $filepath")
        fi
    done <<< "$all_files"
    
    # Create indentation based on level
    local indent=""
    for ((i=0; i<indent_level; i++)); do
        indent+="&emsp;"
    done
    
    # Render files first (sorted alphabetically)
    if [[ ${#files_at_level[@]} -gt 0 ]]; then
        IFS=$'\n' sorted_files=($(sort <<<"${files_at_level[*]}"))
        unset IFS
        
        for ((i=0; i<${#sorted_files[@]}; i++)); do
            local file_entry="${sorted_files[i]}"
            local status=$(echo "$file_entry" | cut -d' ' -f1)
            local filename=$(echo "$file_entry" | cut -d' ' -f2-)
            
            local file_path
            if [[ "$base_path" == "." ]]; then
                file_path="$filename"
            else
                file_path="$base_path/$filename"
            fi
            
            # Generate URL using the provided function
            local file_url
            if [[ -n "$url_generator_param" ]]; then
                file_url=$("$url_generator_func" "$file_path" "$url_generator_param")
            else
                file_url=$("$url_generator_func" "$file_path")
            fi
            
            # Determine the appropriate connector
            local connector
            if [[ $i -eq $((${#sorted_files[@]} - 1)) && ${#directories_found[@]} -eq 0 ]]; then
                connector="&#9493;" # Last item
            else
                connector="&#9501;" # Middle item
            fi
            
            # Get status emoji
            local status_emoji
            case "$status" in
                "A") status_emoji="✅" ;;
                "M") status_emoji="📝" ;;
                "D") status_emoji="❌" ;;
                "R") status_emoji="🔄" ;;
                *) status_emoji="📄" ;;
            esac
            
            echo "${indent}${connector}${status_emoji} [$filename]($file_url)<br>" >> "$output_file"
        done
    fi
    
    # Render directories (sorted alphabetically)
    if [[ ${#directories_found[@]} -gt 0 ]]; then
        IFS=$'\n' sorted_dirs=($(sort <<<"${directories_found[*]}"))
        unset IFS
        
        for ((i=0; i<${#sorted_dirs[@]}; i++)); do
            local dir_name="${sorted_dirs[i]}"
            local is_last_dir=$([[ $i -eq $((${#sorted_dirs[@]} - 1)) ]] && echo "true" || echo "false")
            
            # Create proper connector for directory
            local dir_connector
            if [[ "$is_last_dir" == "true" ]]; then
                dir_connector="&#9492;" # Last directory
            else
                dir_connector="&#9500;" # Middle directory (when multiple dirs)
            fi
            
            # Write directory header
            echo "" >> "$output_file"
            echo "<!-- $dir_name folder -->" >> "$output_file"
            echo "<details>" >> "$output_file"
            echo "<summary>" >> "$output_file"
            echo "${indent}${dir_connector}<strong>🗂️ $dir_name</strong>" >> "$output_file"
            echo "</summary>" >> "$output_file"
            echo "" >> "$output_file"
            
            # Recursively process this directory
            local new_base_path
            if [[ "$base_path" == "." ]]; then
                new_base_path="$dir_name"
            else
                new_base_path="$base_path/$dir_name"
            fi
            
            build_file_tree_native "$all_files" "$url_generator_func" "$url_generator_param" "$output_file" "$new_base_path" $((indent_level + 1))
            
            echo "</details>" >> "$output_file"
        done
    fi
}
