#!/bin/bash

# Render functions for file tree generation
# This file contains all the rendering logic separated from the main script

# Function to get status icon
get_status_icon() {
    case "$1" in
        "A") echo "✅" ;;
        "M") echo "✏️" ;;
        "D") echo "❌" ;;
        *) echo "📄" ;;
    esac
}

# Function to get project name dynamically
get_project_name() {
    # First try to get project name from git remote URL
    local remote_url=$(git remote get-url origin 2>/dev/null)
    if [[ -n "$remote_url" ]]; then
        # Extract project name from various URL formats
        # For GitHub: https://github.com/user/repo.git or git@github.com:user/repo.git
        # For GitLab: https://gitlab.com/user/repo.git or git@gitlab.com:user/repo.git
        local project_name=$(echo "$remote_url" | sed -E 's|.*[/:]([^/]+)\.git$|\1|' | sed -E 's|.*[/:]([^/]+)$|\1|')
        if [[ -n "$project_name" && "$project_name" != "$remote_url" ]]; then
            echo "$project_name"
            return
        fi
    fi
    
    # Fall back to current directory name
    basename "$PWD"
}

# Function to get GitHub repository info
get_github_repo_info() {
    local remote_url=$(git config --get remote.origin.url 2>/dev/null)
    if [[ -n "$remote_url" ]]; then
        # Extract owner/repo from GitHub URL (both HTTPS and SSH formats)
        local repo_path=$(echo "$remote_url" | sed 's/.*github\.com[/:]//' | sed 's/\.git$//')
        if [[ -n "$repo_path" && "$repo_path" =~ ^[^/]+/[^/]+$ ]]; then
            echo "$repo_path"
            return 0
        fi
    fi
    return 1
}

# Function to check if branch exists locally (indicating it was fetched from remote)
branch_exists_locally() {
    local branch="$1"
    git show-ref --verify --quiet "refs/heads/$branch" 2>/dev/null
}

# Function to format branch name with optional GitHub link
format_branch_name() {
    local branch="$1"
    local github_repo_info=$(get_github_repo_info)
    
    if [[ $? -eq 0 ]] && branch_exists_locally "$branch"; then
        # Branch exists locally (likely from remote) and we have GitHub repo, create link
        echo "**[\`$branch\`](https://github.com/$github_repo_info/tree/$branch)**"
    else
        # Branch is local only or no GitHub repo, just format with bold and code
        echo "**\`$branch\`**"
    fi
}

# Function to render the file tree structure
render_file_tree() {
    local base_branch="$1"
    local output_file="$2"
    local target_branch="$3"
    local project_name="$4"
    
    # Get all changed files and count them (comparing target against base)
    local all_files=$(git diff --name-status $base_branch...$target_branch)
    local total_files=$(echo "$all_files" | wc -l | tr -d ' ')
    
    # Handle empty result
    if [[ -z "$all_files" || "$total_files" -eq 0 ]]; then
        echo "No files changed between $target_branch and $base_branch"
        return 1
    fi
    
    echo "<!-- filepath: $PWD/$output_file -->" > "$output_file"
    echo "## 🔄 Changed Files ($total_files total)" >> "$output_file"
    echo "" >> "$output_file"
    
    # Format branch names with links if they exist on remote
    local formatted_target_branch=$(format_branch_name "$target_branch")
    local formatted_base_branch=$(format_branch_name "$base_branch")
    echo "$formatted_target_branch vs $formatted_base_branch" >> "$output_file"
    echo "" >> "$output_file"
    echo "<details open>" >> "$output_file"
    echo "<summary>" >> "$output_file"
    echo "<strong>🏠 $project_name</strong>" >> "$output_file"
    echo "</summary>" >> "$output_file"
    echo "" >> "$output_file"

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

    echo "<div>" >> "$output_file"

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
                echo "&emsp;&#9493;$icon $filename" >> "$output_file"
            else
                echo "&emsp;&#9501;$icon $filename<br>" >> "$output_file"
            fi
        done
    fi

    echo "</div>" >> "$output_file"
    echo "" >> "$output_file"

    # Process each folder
    for folder in "${folders_with_files[@]}"; do
        if [[ "$folder" == "." ]]; then
            continue  # Skip root folder as it's already processed
        fi
        
        echo "<!-- $folder folder -->" >> "$output_file"
        echo "<details>" >> "$output_file"
        echo "<summary>" >> "$output_file"
        echo "&#9492;<strong>🗂️ $folder</strong>" >> "$output_file"
        echo "</summary>" >> "$output_file"
        echo "" >> "$output_file"
        echo "<div>" >> "$output_file"
        
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
                echo "&emsp;&emsp;&#9493;$icon $filename" >> "$output_file"
            else
                echo "&emsp;&emsp;&#9501;$icon $filename<br>" >> "$output_file"
            fi
        done
        
        echo "</div>" >> "$output_file"
        echo "</details>" >> "$output_file"
        echo "" >> "$output_file"
    done

    echo "</details>" >> "$output_file"
    
    # Add file summary sections
    render_file_summary "$base_branch" "$output_file" "$all_files"
    
    return 0
}

# Function to render file summary sections
render_file_summary() {
    local base_branch="$1"
    local output_file="$2"
    local all_files="$3"
    
    echo "" >> "$output_file"
    echo "## 📊 File Summary" >> "$output_file"
    echo "" >> "$output_file"
    
    # Count files by status
    local added_count=$(echo "$all_files" | grep "^A" | wc -l | tr -d ' ')
    local modified_count=$(echo "$all_files" | grep "^M" | wc -l | tr -d ' ')
    local deleted_count=$(echo "$all_files" | grep "^D" | wc -l | tr -d ' ')
    
    # Added files section
    echo "<details>" >> "$output_file"
    echo "<summary>" >> "$output_file"
    echo "<strong>✅ Added Files ($added_count)</strong>" >> "$output_file"
    echo "</summary>" >> "$output_file"
    echo "" >> "$output_file"
    
    if [[ "$added_count" -gt 0 ]]; then
        echo "$all_files" | grep "^A" | awk '{print "- `" $2 "`"}' >> "$output_file"
    else
        echo "No files were added." >> "$output_file"
    fi
    
    echo "" >> "$output_file"
    echo "</details>" >> "$output_file"
    echo "" >> "$output_file"
    
    # Modified files section
    echo "<details>" >> "$output_file"
    echo "<summary>" >> "$output_file"
    echo "<strong>✏️ Modified Files ($modified_count)</strong>" >> "$output_file"
    echo "</summary>" >> "$output_file"
    echo "" >> "$output_file"
    
    if [[ "$modified_count" -gt 0 ]]; then
        echo "$all_files" | grep "^M" | awk '{print "- `" $2 "`"}' >> "$output_file"
    else
        echo "No files were modified." >> "$output_file"
    fi
    
    echo "" >> "$output_file"
    echo "</details>" >> "$output_file"
    echo "" >> "$output_file"
    
    # Deleted files section
    echo "<details>" >> "$output_file"
    echo "<summary>" >> "$output_file"
    echo "<strong>❌ Deleted Files ($deleted_count)</strong>" >> "$output_file"
    echo "</summary>" >> "$output_file"
    echo "" >> "$output_file"
    
    if [[ "$deleted_count" -gt 0 ]]; then
        echo "$all_files" | grep "^D" | awk '{print "- `" $2 "`"}' >> "$output_file"
    else
        echo "No files were deleted." >> "$output_file"
    fi
    
    echo "" >> "$output_file"
    echo "</details>" >> "$output_file"
}
