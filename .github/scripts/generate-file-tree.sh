#!/bin/bash

set -e  # Exit on any error

# Enable error handling but allow debugging steps to run
trap 'echo "⚠️ An error occurred. Debugging enabled..."' ERR

# Debug: Check if PR number and repository are set
echo "🔍 Debugging PR Info..."
echo "PR Number: $PR_NUMBER"
echo "Repository: $REPOSITORY"

# Fetch changed files from GitHub API
echo "📡 Fetching changed files from PR..."
FILES=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
  "https://api.github.com/repos/$REPOSITORY/pulls/$PR_NUMBER/files" | \
  jq -r '.[] | "\(.status) \(.filename)"')

# Debug: Show fetched files
echo "📁 Files fetched:"
echo "$FILES"

# Check if FILES is empty
if [ -z "$FILES" ]; then
  echo "⚠️ No files found in PR. Debugging now..."
  exit 1
fi

# Organizing files into directories
declare -A file_data
declare -A folders

# Debug: Processing files
echo "🛠️ Processing files..."

while IFS= read -r line; do
  if [ -n "$line" ]; then
    STATUS=$(echo "$line" | awk '{print $1}')
    FILE=$(echo "$line" | awk '{print $2}')
    
    echo "📝 Processing: $STATUS $FILE"
    
    file_data["$FILE"]="$STATUS"

    # Store parent directories
    if [[ "$FILE" == *"/"* ]]; then
      DIR=$(dirname "$FILE")
      while [[ "$DIR" != "." && "$DIR" != "/" ]]; do
        folders["$DIR"]=1
        DIR=$(dirname "$DIR")
      done
    fi
  fi
done <<< "$FILES"

echo "🔍 Found ${#file_data[@]} files and ${#folders[@]} directories."

# Function to render a markdown tree recursively
render_tree() {
  local current_path="$1"
  local prefix="$2"
  local is_last_child="$3"
  local -a files_in_dir=()
  local -a subdirs=()

  # Collect files at current level
  for file in $(printf '%s\n' "${!file_data[@]}" | sort); do
    if [[ -z "$current_path" ]]; then
      if [[ "$file" != *"/"* ]]; then
        files_in_dir+=("$file")
      fi
    else
      if [[ "$file" == "$current_path"/* ]]; then
        relative_path="${file#$current_path/}"
        if [[ "$relative_path" != *"/"* ]]; then
          files_in_dir+=("$file")
        fi
      fi
    fi
  done

  # Collect subdirectories at current level
  for folder in $(printf '%s\n' "${!folders[@]}" | sort); do
    if [[ -z "$current_path" ]]; then
      if [[ "$folder" != *"/"* ]]; then
        subdirs+=("$folder")
      fi
    else
      if [[ "$folder" == "$current_path"/* ]]; then
        relative_folder="${folder#$current_path/}"
        if [[ "$relative_folder" != *"/"* ]]; then
          subdirs+=("$folder")
        fi
      fi
    fi
  done

  local total_items=$((${#subdirs[@]} + ${#files_in_dir[@]}))
  local idx=0

  # Render subdirectories first
  for subdir in "${subdirs[@]}"; do
    idx=$((idx+1))
    local folder_name=$(basename "$subdir")
    local folder_icon=$(get_folder_icon "$subdir")
    local is_last=$([[ $idx -eq $total_items ]] && echo "true" || echo "false")
    local branch="├── "
    local next_prefix="$prefix│   "
    if [[ "$is_last" == "true" && ${#files_in_dir[@]} -eq 0 ]]; then
      branch="└── "
      next_prefix="$prefix    "
    fi
    echo "${prefix}${branch}${folder_icon} **${folder_name}/**"
    render_tree "$subdir" "$next_prefix" "false"
  done

  # Render files in current directory
  for file in "${files_in_dir[@]}"; do
    idx=$((idx+1))
    local filename=$(basename "$file")
    local status="${file_data[$file]}"
    local status_icon
    case "$status" in
      "added") status_icon="✅" ;;
      "removed") status_icon="❌" ;;
      "modified") status_icon="⚠️" ;;
      "renamed") status_icon="🔄" ;;
      *) status_icon="📝" ;;
    esac
    local file_icon=$(get_file_icon "$file")
    local hash=$(echo -n "$file" | md5sum | cut -c1-8 2>/dev/null || echo "12345678")
    local branch="├── "
    if [[ $idx -eq $total_items ]]; then
      branch="└── "
    fi
    echo "${prefix}${branch}${status_icon} ${file_icon} [\`$filename\`]($GITHUB_SERVER_URL/$REPOSITORY/pull/$PR_NUMBER/files#diff-$hash)"
  done
}

# Generate PR comment content
echo "📝 Generating comment content..."
{
  echo "## 📂 Changed Files Tree"
  echo ""
  echo "_Automatically generated file tree • Click folders to expand/collapse_"
  echo ""
  echo "### File Tree"
  echo '\`\`\`'
  render_tree "" "" "false"
  echo '\`\`\`'
  echo ""
  echo "---"
  echo "_Last updated: $(TZ=Europe/Berlin date '+%Y-%m-%d %H:%M:%S %Z')_"
} > comment_content.md

# Debug: Verify final output before posting comment
echo "✅ Successfully generated PR comment content. Preview below:"
cat comment_content.md
