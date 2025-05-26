#!/bin/bash

set -e  # Exit on error

# Get environment variables with defaults
REPOSITORY="${REPOSITORY:-$GITHUB_REPOSITORY}"
PR_NUMBER="${PR_NUMBER:-}"
GITHUB_TOKEN="${GITHUB_TOKEN:-}"
BRANCH_NAME="${GITHUB_HEAD_REF:-main}"

# Debugging info
echo "🔍 Repository: $REPOSITORY"
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

# Function to process files in a folder
process_folder_files() {
    local folder="$1"
    local level="$2"
    local -a added_files=()
    local -a modified_files=()
    local -a removed_files=()
    
    # Collect files by status
    while IFS= read -r line; do
        [[ -z "$line" ]] && continue
        STATUS=$(echo "$line" | awk '{print $1}')
        FILE=$(echo "$line" | awk '{print $2}')
        
        # Check if file belongs to this folder
        if [[ "$FILE" == "$folder"/* ]]; then
            # Check if it's a direct child (not in a subfolder)
            relative_path="${FILE#$folder/}"
            if [[ "$relative_path" != *"/"* ]]; then
                filename=$(basename "$FILE")
                case "$STATUS" in
                    "added") added_files+=("$filename:$FILE:$STATUS") ;;
                    "modified") modified_files+=("$filename:$FILE:$STATUS") ;;
                    "removed") removed_files+=("$filename:$FILE:$STATUS") ;;
                esac
            fi
        fi
    done <<< "$FILES"
    
    # Sort files alphabetically
    IFS=$'\n' added_files=($(sort <<<"${added_files[*]}"))
    IFS=$'\n' modified_files=($(sort <<<"${modified_files[*]}"))
    IFS=$'\n' removed_files=($(sort <<<"${removed_files[*]}"))
    
    # Combine all files in order: added, modified, removed
    local all_files=("${added_files[@]}" "${modified_files[@]}" "${removed_files[@]}")
    local total_files=${#all_files[@]}
    
    # Output files
    for ((i=0; i<total_files; i++)); do
        [[ -z "${all_files[$i]}" ]] && continue
        IFS=':' read -r filename filepath status <<< "${all_files[$i]}"
        
        # Determine if this is the last file
        local is_last="false"
        if [[ $i -eq $((total_files - 1)) ]]; then
            is_last="true"
        fi
        
        # Generate tree character
        local tree_char="&#9500;"
        if [[ "$is_last" == "true" ]]; then
            tree_char="&#9492;"
        fi
        
        local spacing=$(generate_spacing $level)
        local icon=$(get_status_icon "$status")
        local url=$(generate_github_url "$filepath" "$status")
        echo "${spacing}${tree_char}${icon} ${url}<br>"
    done
}

# Function to check if folder has any changed files
folder_has_files() {
    local folder="$1"
    while IFS= read -r line; do
        [[ -z "$line" ]] && continue
        FILE=$(echo "$line" | awk '{print $2}')
        if [[ "$FILE" == "$folder"/* ]]; then
            return 0
        fi
    done <<< "$FILES"
    return 1
}

# Function to get subfolders
get_subfolders() {
    local parent_folder="$1"
    local -a subfolders=()
    
    while IFS= read -r line; do
        [[ -z "$line" ]] && continue
        FILE=$(echo "$line" | awk '{print $2}')
        
        if [[ "$FILE" == "$parent_folder"/* ]]; then
            relative_path="${FILE#$parent_folder/}"
            if [[ "$relative_path" == *"/"* ]]; then
                subfolder="${relative_path%%/*}"
                if [[ ! " ${subfolders[@]} " =~ " ${subfolder} " ]]; then
                    subfolders+=("$subfolder")
                fi
            fi
        fi
    done <<< "$FILES"
    
    printf '%s\n' "${subfolders[@]}" | sort
}

# Generate the markdown content
echo "📝 Generating PR comment..."

{
    echo "## 📁 Changed Files in \`src/\`"
    echo ""
    echo "<details open>"
    echo "<summary>"
    echo "<strong>🗂️ src</strong>"
    echo "</summary>"
    echo ""
    
    # Process src folder and its subfolders
    src_subfolders=($(get_subfolders "src"))
    total_src_folders=${#src_subfolders[@]}
    current_folder_count=0
    
    for subfolder in "${src_subfolders[@]}"; do
        current_folder_count=$((current_folder_count + 1))
        full_folder_path="src/$subfolder"
        
        if folder_has_files "$full_folder_path"; then
            echo "<!-- src/$subfolder folder -->"
            echo "<details>"
            echo "<summary>"
            
            if [[ $current_folder_count -eq $total_src_folders ]]; then
                echo "&#9492;<strong>🗂️ $subfolder</strong>"
            else
                echo "&#9500;<strong>🗂️ $subfolder</strong>"
            fi
            
            echo "</summary>"
            echo ""
            echo "<div>"
            process_folder_files "$full_folder_path" 2
            echo "</div>"
            echo "</details>"
            echo ""
        fi
    done
    
    echo "</details>"
    echo ""
    echo "_Last updated: $(TZ=Europe/Berlin date '+%Y-%m-%d %H:%M:%S %Z')_"
    
} > comment_content.md

echo "✅ PR comment content generated successfully!"
echo "📄 Content saved to: comment_content.md"
