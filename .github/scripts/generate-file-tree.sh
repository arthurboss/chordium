#!/bin/bash

set -e  # Exit on error

# Get environment variables with defaults
REPOSITORY="${REPOSITORY:-$GITHUB_REPOSITORY}"
PR_NUMBER="${PR_NUMBER:-}"
GITHUB_TOKEN="${GITHUB_TOKEN:-}"
BRANCH_NAME="${GITHUB_HEAD_REF:-main}"

# Extract repository name from REPOSITORY (format: owner/repo)
REPO_NAME="${REPOSITORY##*/}"

# Debugging info
echo "🔍 Repository: $REPOSITORY"
echo "🔍 Repository Name: $REPO_NAME"
echo "🔍 PR Number: $PR_NUMBER"
echo "🔍 Branch: $BRANCH_NAME"

# Validate required variables
if [[ -z "$REPOSITORY" || -z "$PR_NUMBER" || -z "$GITHUB_TOKEN" ]]; then
    echo "❌ Missing required environment variables"
    echo "Required: REPOSITORY, PR_NUMBER, GITHUB_TOKEN"
    exit 1
fi

# Fetch changed files from GitHub API
echo "📡 Fetching changed files from GitHub API..."
FILES=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
  "https://api.github.com/repos/$REPOSITORY/pulls/$PR_NUMBER/files" | \
  jq -r '.[] | "\(.status) \(.filename)"')

# Check if FILES is empty
if [ -z "$FILES" ]; then
  echo "⚠️ No files found in PR. Exiting..."
  exit 1
fi

echo "📂 Found files:"
echo "$FILES"

# Function to get status icon
get_status_icon() {
    case "$1" in
        "added") echo "✅" ;;
        "modified") echo "✏️" ;;
        "removed") echo "❌" ;;
        "renamed") echo "🔄" ;;
        *) echo "📄" ;;
    esac
}

# Function to generate GitHub blob URL
generate_github_url() {
    local filepath="$1"
    local status="$2"
    
    # Don't generate URLs for deleted files
    if [[ "$status" == "removed" ]]; then
        echo "$filepath"
    else
        echo "[$filepath](https://github.com/$REPOSITORY/blob/$BRANCH_NAME/$filepath)"
    fi
}

# Function to generate spacing using HTML entities
generate_spacing() {
    local level="$1"
    local spaces=$((7 + (level - 1) * 4))
    local spacing=""
    for ((i=0; i<spaces; i++)); do
        spacing+="&nbsp;"
    done
    echo "$spacing"
}

# Function to get all top-level folders that have changes
get_changed_folders() {
    local -a folders=()
    
    while IFS= read -r line; do
        [[ -z "$line" ]] && continue
        FILE=$(echo "$line" | awk '{print $2}')
        
        # Get the top-level folder
        if [[ "$FILE" == *"/"* ]]; then
            top_folder="${FILE%%/*}"
            if [[ ! " ${folders[@]} " =~ " ${top_folder} " ]]; then
                folders+=("$top_folder")
            fi
        fi
    done <<< "$FILES"
    
    printf '%s\n' "${folders[@]}" | sort
}

# Function to get root-level files (files in the root directory)
get_root_files() {
    local -a root_files=()
    
    while IFS= read -r line; do
        [[ -z "$line" ]] && continue
        STATUS=$(echo "$line" | awk '{print $1}')
        FILE=$(echo "$line" | awk '{print $2}')
        
        # Check if it's a root-level file (no slash in the path)
        if [[ "$FILE" != *"/"* ]]; then
            root_files+=("$STATUS:$FILE")
        fi
    done <<< "$FILES"
    
    printf '%s\n' "${root_files[@]}" | sort
}

# Function to process files in a folder recursively
process_folder() {
    local folder="$1"
    local level="$2"
    local -a folder_files=()
    local -a subfolders=()
    
    # Collect files and subfolders in this folder
    while IFS= read -r line; do
        [[ -z "$line" ]] && continue
        STATUS=$(echo "$line" | awk '{print $1}')
        FILE=$(echo "$line" | awk '{print $2}')
        
        # Check if file is in this folder
        if [[ "$FILE" == "$folder"/* ]]; then
            relative_path="${FILE#$folder/}"
            
            # If it's a direct child file (no more slashes)
            if [[ "$relative_path" != *"/"* ]]; then
                folder_files+=("$STATUS:$FILE:$(basename "$FILE")")
            else
                # It's in a subfolder
                subfolder_name="${relative_path%%/*}"
                if [[ ! " ${subfolders[@]} " =~ " ${subfolder_name} " ]]; then
                    subfolders+=("$subfolder_name")
                fi
            fi
        fi
    done <<< "$FILES"
    
    # Sort arrays
    IFS=$'\n' folder_files=($(sort <<<"${folder_files[*]}"))
    IFS=$'\n' subfolders=($(sort <<<"${subfolders[*]}"))
    
    # Process subfolders first
    for subfolder in "${subfolders[@]}"; do
        [[ -z "$subfolder" ]] && continue
        local spacing=$(generate_spacing $((level + 1)))
        echo "${spacing}&#9500;"
        echo "🗂️ <strong>$subfolder</strong><br>"
        process_folder "$folder/$subfolder" $((level + 1))
    done
    
    # Then process files in this folder
    local total_files=${#folder_files[@]}
    for ((i=0; i<total_files; i++)); do
        [[ -z "${folder_files[$i]}" ]] && continue
        IFS=':' read -r status filepath filename <<< "${folder_files[$i]}"
        
        # Determine tree character
        local tree_char="&#9500;"
        if [[ $i -eq $((total_files - 1)) && ${#subfolders[@]} -eq 0 ]]; then
            tree_char="&#9492;"
        fi
        
        local spacing=$(generate_spacing $((level + 1)))
        local icon=$(get_status_icon "$status")
        local url=$(generate_github_url "$filepath" "$status")
        echo "${spacing}${tree_char}"
        echo "${icon} ${url}<br>"
    done
}

# Count total changed files
total_files=$(echo "$FILES" | wc -l | tr -d ' ')

# Generate the markdown content
echo "📝 Generating PR comment..."

{
    echo "<!-- AUTO-GENERATED FILE TREE -->"
    echo "<!-- This comment will be updated automatically by the GitHub Action -->"
    echo ""
    echo "## File Tree ($total_files files changed)"
    echo ""
    echo "<!-- Root folder -->"
    echo "<div>"
    echo "&nbsp;&nbsp;"  # 2 non-breaking spaces for root
    echo "🏠 <strong>$REPO_NAME</strong>"
    echo "</div>"
    echo ""  # blank line after root
    
    # Get all changed folders
    changed_folders=($(get_changed_folders))
    
    # Process each top-level folder
    for folder in "${changed_folders[@]}"; do
        [[ -z "$folder" ]] && continue
        echo "<details open>"
        echo "<summary>"
        echo "&#9500;"
        echo "🗂️ <strong>$folder</strong>"
        echo "</summary>"
        echo ""
        process_folder "$folder" 1
        echo "</details>"
        echo ""
    done
    
    # Process root-level files if any
    root_files=($(get_root_files))
    if [[ ${#root_files[@]} -gt 0 ]]; then
        echo "<strong>Root Files:</strong><br>"
        for file_entry in "${root_files[@]}"; do
            [[ -z "$file_entry" ]] && continue
            IFS=':' read -r status filepath <<< "$file_entry"
            local icon=$(get_status_icon "$status")
            local url=$(generate_github_url "$filepath" "$status")
            echo "&#9500;"
            echo "${icon} ${url}<br>"
        done
        echo ""
    fi
    
    echo "<!-- END AUTO-GENERATED FILE TREE -->"
    
}
