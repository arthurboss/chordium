#!/bin/bash

# Function to render the file tree structure
render_file_tree() {
    local base_branch="$1"
    local output_file="$2"
    local target_branch="$3"
    local project_name="$4"
    
    # Source dependencies
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    source "$SCRIPT_DIR/../project/get_status_icon.sh"
    source "$SCRIPT_DIR/../github/format_branch_name.sh"
    source "$SCRIPT_DIR/render_file_summary.sh"
    
    # Get all changed files and count them (comparing target against base)
    local all_files=$(git diff --name-status $base_branch...$target_branch)
    local total_files=$(echo "$all_files" | wc -l | tr -d ' ')
    
    # Handle empty result
    if [[ -z "$all_files" || "$total_files" -eq 0 ]]; then
        echo "No files changed between $target_branch and $base_branch"
        return 1
    fi
    
    echo "<!-- filepath: $output_file -->" > "$output_file"
    echo "## 🔄 Changed Files ($total_files total)" >> "$output_file"
    echo "" >> "$output_file"
    
    # Format branch names with links if they exist on remote
    local formatted_target_branch=$(format_branch_name "$target_branch")
    local formatted_base_branch=$(format_branch_name "$base_branch")
    echo "$formatted_target_branch vs $formatted_base_branch" >> "$output_file"
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
    
    return 0
}
