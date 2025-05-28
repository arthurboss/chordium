#!/bin/bash

# Script for generating file tree structure based on real git changes (compared to a specified branch)
# Enhanced version with intelligent branch detection and comprehensive file summaries
# Usage: ./test-final-structure-compare.sh [base_branch] [output_file]
# Example: ./test-final-structure-compare.sh feat--search compare-output.md

# Function to automatically detect the base branch
detect_base_branch() {
    local current_branch=$(git branch --show-current)
    
    # If we're on main/master, there's nothing to compare
    if [[ "$current_branch" == "main" || "$current_branch" == "master" ]]; then
        echo "main"
        return
    fi
    
    # Look for "Merge branch" patterns in recent commits to understand branch relationships
    local merge_pattern=$(git log --oneline -20 | grep "Merge branch" | head -1)
    if [[ -n "$merge_pattern" ]]; then
        # Extract the branch name from merge commit message
        local source_branch=$(echo "$merge_pattern" | sed -n "s/.*Merge branch '\([^']*\)'.*/\1/p")
        if [[ -n "$source_branch" && "$source_branch" != "$current_branch" ]]; then
            # Check if this branch exists and is different from current
            if git show-ref --verify --quiet "refs/heads/$source_branch"; then
                echo "$source_branch"
                return
            fi
        fi
    fi
    
    # Strategy: Find branches that are ancestors but exclude very recent merges
    local best_branch=""
    local best_distance=999999
    
    while IFS= read -r branch; do
        branch=$(echo "$branch" | sed 's/^[* ] *//' | sed 's/ .*//')
        
        # Skip current branch, main, master, remote branches, and cache branches
        if [[ "$branch" == "$current_branch" || "$branch" == "main" || "$branch" == "master" || "$branch" =~ ^remotes/ || "$branch" =~ cache ]]; then
            continue
        fi
        
        # Skip if branch doesn't exist
        if ! git show-ref --verify --quiet "refs/heads/$branch"; then
            continue
        fi
        
        # Calculate distance (number of commits) from current branch to this branch
        local distance=$(git rev-list --count $branch..HEAD 2>/dev/null)
        
        # If this branch is an ancestor and has reasonable distance, consider it
        if [[ -n "$distance" && "$distance" -gt 0 && "$distance" -lt "$best_distance" ]]; then
            # Additional check: make sure this branch has actually diverged meaningfully
            local reverse_distance=$(git rev-list --count HEAD..$branch 2>/dev/null)
            if [[ -n "$reverse_distance" && "$reverse_distance" -gt 0 ]]; then
                best_branch="$branch"
                best_distance="$distance"
            fi
        fi
    done <<< "$(git branch --sort=-committerdate)"
    
    # If we found a good candidate, use it; otherwise default to main
    if [[ -n "$best_branch" ]]; then
        echo "$best_branch"
    else
        echo "main"
    fi
}

# Function to ensure output file has .md extension
ensure_md_extension() {
    local filename="$1"
    if [[ "$filename" != *.md ]]; then
        echo "${filename}.md"
    else
        echo "$filename"
    fi
}

# Function to generate auto filename
generate_auto_filename() {
    local current_branch=$(git branch --show-current)
    local base_branch="$1"
    local timestamp=$(date +"%Y-%m-%d_%H-%M-%S")
    
    # Sanitize branch names for filename (replace / with -)
    local safe_current=$(echo "$current_branch" | sed 's/[\/:]/-/g')
    local safe_base=$(echo "$base_branch" | sed 's/[\/:]/-/g')
    
    echo "file-tree_${safe_current}-vs-${safe_base}_${timestamp}.md"
}

# Parse arguments
BASE_BRANCH=""
OUTPUT_FILE=""

# Process arguments
while [[ $# -gt 0 ]]; do
    if [[ -z "$BASE_BRANCH" ]]; then
        BASE_BRANCH="$1"
    elif [[ -z "$OUTPUT_FILE" ]]; then
        OUTPUT_FILE=$(ensure_md_extension "$1")
    fi
    shift
done

# Auto-detect base branch if not provided
if [[ -z "$BASE_BRANCH" ]]; then
    BASE_BRANCH=$(detect_base_branch)
    echo "Auto-detected base branch: $BASE_BRANCH"
else
    echo "Using specified base branch: $BASE_BRANCH"
fi

# Auto-generate output file if not provided
if [[ -z "$OUTPUT_FILE" ]]; then
    OUTPUT_FILE=$(generate_auto_filename "$BASE_BRANCH")
    echo "Auto-generated output file: $OUTPUT_FILE"
else
    echo "Using specified output file: $OUTPUT_FILE"
fi

echo "Comparing current branch against: $BASE_BRANCH"
echo "Output file: $OUTPUT_FILE"

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

PROJECT_NAME=$(get_project_name)
CURRENT_BRANCH=$(git branch --show-current)

# Get all changed files and validate
ALL_FILES=$(git diff --name-status $BASE_BRANCH...HEAD)
TOTAL_FILES=$(echo "$ALL_FILES" | wc -l | tr -d ' ')

# Handle empty result
if [[ -z "$ALL_FILES" || "$TOTAL_FILES" -eq 0 ]]; then
    echo "No files changed between $CURRENT_BRANCH and $BASE_BRANCH"
    exit 1
fi

echo "<!-- filepath: $PWD/$OUTPUT_FILE -->" > "$OUTPUT_FILE"
echo "## 🔄 Changed Files ($TOTAL_FILES total)" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Format branch names with links if they exist on remote
FORMATTED_CURRENT_BRANCH=$(format_branch_name "$CURRENT_BRANCH")
FORMATTED_BASE_BRANCH=$(format_branch_name "$BASE_BRANCH")
echo "$FORMATTED_CURRENT_BRANCH vs $FORMATTED_BASE_BRANCH" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "<details open>" >> "$OUTPUT_FILE"
echo "<summary>" >> "$OUTPUT_FILE"
echo "<strong>🏠 $PROJECT_NAME</strong>" >> "$OUTPUT_FILE"
echo "</summary>" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Get list of all folders that have changed files (dynamically)
folders_with_files=()
all_changed_folders=$(echo "$ALL_FILES" | grep -v "^[AMD][[:space:]]*[^/]*$" | sed 's|^[AMD][[:space:]]*\([^/]*\)/.*|\1|' | sort -u)

# Add the root folder if there are any root files
root_files=$(echo "$ALL_FILES" | grep "^[AMD][[:space:]]*[^/]*$")
if [[ -n "$root_files" ]]; then
    folders_with_files+=(".")
fi

# Add all folders that have changed files
while IFS= read -r folder; do
    if [[ -n "$folder" ]]; then
        folders_with_files+=("$folder")
    fi
done <<< "$all_changed_folders"

echo "<div>" >> "$OUTPUT_FILE"

# Process files in root folder first
if [[ " ${folders_with_files[@]} " =~ " . " ]]; then
    # Get root files and convert to array to check last file
    root_files_array=()
    while IFS= read -r file_line; do
        if [[ -n "$file_line" ]]; then
            root_files_array+=("$file_line")
        fi
    done <<< "$(echo "$ALL_FILES" | sort -k2 | grep "^[AMD][[:space:]]*[^/]*$")"
    
    # Process each root file
    for i in "${!root_files_array[@]}"; do
        file_line="${root_files_array[$i]}"
        status=$(echo "$file_line" | awk '{print $1}')
        filename=$(echo "$file_line" | awk '{print $2}')
        icon=$(get_status_icon "$status")
        
        # Check if this is the last root file
        if [[ $i -eq $((${#root_files_array[@]} - 1)) ]]; then
            echo "&emsp;&#9493;$icon $filename" >> "$OUTPUT_FILE"
        else
            echo "&emsp;&#9501;$icon $filename<br>" >> "$OUTPUT_FILE"
        fi
    done
fi

echo "</div>" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Process each folder
for folder in "${folders_with_files[@]}"; do
    if [[ "$folder" == "." ]]; then
        continue  # Skip root folder as it's already processed
    fi
    
    echo "<!-- $folder folder -->" >> "$OUTPUT_FILE"
    echo "<details>" >> "$OUTPUT_FILE"
    echo "<summary>" >> "$OUTPUT_FILE"
    echo "&#9492;<strong>🗂️ $folder</strong>" >> "$OUTPUT_FILE"
    echo "</summary>" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
    echo "<div>" >> "$OUTPUT_FILE"
    
    # Get files for this folder, sorted alphabetically by filename
    folder_files=$(echo "$ALL_FILES" | sort -k2 | grep "^[AMD][[:space:]]*$folder/")
    
    # Convert to array to check last file
    files_array=()
    while IFS= read -r file_line; do
        if [[ -n "$file_line" ]]; then
            files_array+=("$file_line")
        fi
    done <<< "$folder_files"
    
    # Process each file
    for i in "${!files_array[@]}"; do
        file_line="${files_array[$i]}"
        status=$(echo "$file_line" | awk '{print $1}')
        filepath=$(echo "$file_line" | awk '{print $2}')
        filename=$(basename "$filepath")
        icon=$(get_status_icon "$status")
        
        # Check if this is the last file
        if [[ $i -eq $((${#files_array[@]} - 1)) ]]; then
            echo "&emsp;&emsp;&#9493;$icon $filename" >> "$OUTPUT_FILE"
        else
            echo "&emsp;&emsp;&#9501;$icon $filename<br>" >> "$OUTPUT_FILE"
        fi
    done
    
    echo "</div>" >> "$OUTPUT_FILE"
    echo "</details>" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
done

echo "</details>" >> "$OUTPUT_FILE"

# Add file summary sections
render_file_summary "$BASE_BRANCH" "$OUTPUT_FILE" "$ALL_FILES"

echo "File tree generated successfully in $OUTPUT_FILE"
echo "Total files: $TOTAL_FILES"
echo "Comparison: $CURRENT_BRANCH vs $BASE_BRANCH"
