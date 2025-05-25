#!/bin/bash

set -e  # Exit on any error

# Debug: Check if we can access the PR
echo "PR Number: $PR_NUMBER"
echo "Repository: $REPOSITORY"

# Fetch changed files from PR API
echo "Fetching changed files..."
FILES=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
  "https://api.github.com/repos/$REPOSITORY/pulls/$PR_NUMBER/files" | \
  jq -r '.[] | "\(.status) \(.filename)"')

# Debug: Show what we got
echo "Files fetched:"
echo "$FILES"

# Check if FILES is empty
if [ -z "$FILES" ]; then
  echo "No files found in PR"
  exit 1
fi

# Function to get file type icon based on extension
get_file_icon() {
  local file="$1"
  local ext="${file##*.}"
  local basename="${file##*/}"
  
  # Check basename first
  case "$basename" in
    "package.json"|"package-lock.json"|"yarn.lock") echo "📦"; return ;;
    "README.md") echo "📝"; return ;;
    "Dockerfile"|"docker-compose.yml") echo "🐳"; return ;;
    ".gitignore") echo "⚙️"; return ;;
    ".env"*) echo "⚙️"; return ;;
  esac
  
  # Check extension
  case "$ext" in
    "js"|"jsx") echo "🟨" ;;
    "ts"|"tsx") echo "🟦" ;;
    "py") echo "🐍" ;;
    "html") echo "🌐" ;;
    "css"|"scss"|"sass") echo "🎨" ;;
    "json") echo "📋" ;;
    "yml"|"yaml") echo "⚙️" ;;
    "md") echo "📝" ;;
    "png"|"jpg"|"jpeg"|"gif"|"svg") echo "🖼️" ;;
    *) 
      # Check for test files in filename
      if [[ "$file" =~ \.(test|spec)\.(js|ts)$ ]]; then
        echo "🧪"
      elif [[ "$file" =~ \.cy\.(js|ts)$ ]]; then
        echo "🌐"
      else
        echo "📄"
      fi
      ;;
  esac
}

# Function to get folder icon
get_folder_icon() {
  local folder="$1"
  local basename=$(basename "$folder")
  
  case "$basename" in
    "src") echo "📁" ;;
    "test"|"tests"|"__tests__") echo "🧪" ;;
    "docs"|"doc") echo "📚" ;;
    "public"|"assets"|"static") echo "🌐" ;;
    "components") echo "🧩" ;;
    "utils"|"helpers") echo "🔧" ;;
    "types") echo "📝" ;;
    "styles"|"css") echo "🎨" ;;
    "config") echo "⚙️" ;;
    "scripts") echo "📜" ;;
    ".github") echo "🔧" ;;
    "node_modules") echo "📦" ;;
    *) echo "📂" ;;
  esac
}

# Build tree structure
declare -A file_data
declare -A folders

# Parse files and organize by directory
while IFS= read -r line; do
  if [ -n "$line" ]; then
    STATUS=$(echo "$line" | awk '{print $1}')
    FILE=$(echo "$line" | awk '{print $2}')
    
    echo "Processing: $STATUS $FILE"
    
    # Store file data
    file_data["$FILE"]="$STATUS"
    
    # Extract directory path and mark all parent directories
    if [[ "$FILE" == *"/"* ]]; then
      DIR=$(dirname "$FILE")
      while [[ "$DIR" != "." && "$DIR" != "/" ]]; do
        folders["$DIR"]=1
        DIR=$(dirname "$DIR")
      done
    fi
  fi
done <<< "$FILES"

echo "Found ${#file_data[@]} files and ${#folders[@]} directories"

# Function to render tree recursively
render_tree() {
  local current_path="$1"
  local indent="$2"
  local -a files_in_dir=()
  local -a subdirs=()
  
  # Collect files at current level
  for file in $(printf '%s\n' "${!file_data[@]}" | sort); do
    if [[ -z "$current_path" ]]; then
      # Root level - files without directory separator
      if [[ "$file" != *"/"* ]]; then
        files_in_dir+=("$file")
      fi
    else
      # Check if file is directly in current directory
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
      # Root level - directories without parent
      if [[ "$folder" != *"/"* ]]; then
        subdirs+=("$folder")
      fi
    else
      # Check if folder is directly under current path
      if [[ "$folder" == "$current_path"/* ]]; then
        relative_folder="${folder#$current_path/}"
        if [[ "$relative_folder" != *"/"* ]]; then
          subdirs+=("$folder")
        fi
      fi
    fi
  done
  
  # Render subdirectories first
  for subdir in "${subdirs[@]}"; do
    local folder_name=$(basename "$subdir")
    local folder_icon=$(get_folder_icon "$subdir")
    local files_count=0
    
    # Count files in this directory recursively
    for file in "${!file_data[@]}"; do
      if [[ "$file" == "$subdir"/* ]]; then
        ((files_count++))
      fi
    done
    
    echo "${indent}<details>"
    echo "${indent}<summary>$folder_icon <strong>$folder_name/</strong> <em>($files_count files)</em></summary>"
    echo ""
    render_tree "$subdir" "$indent  "
    echo "${indent}</details>"
    echo ""
  done
  
  # Render files in current directory
  for file in "${files_in_dir[@]}"; do
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
    # Use a simple hash that's more reliable
    local hash=$(echo -n "$file" | md5sum | cut -c1-8 2>/dev/null || echo "12345678")
    
    echo "${indent}- $status_icon $file_icon [\`$filename\`]($GITHUB_SERVER_URL/$REPOSITORY/pull/$PR_NUMBER/files#diff-$hash)"
  done
}

# Generate comment content
echo "Generating comment content..."
{
  echo "## 📂 Changed Files Tree"
  echo ""
  echo "_Automatically generated file tree • Click folders to expand/collapse_"
  echo ""
  
  # Count files by status
  added_count=0
  modified_count=0
  removed_count=0
  
  for file in "${!file_data[@]}"; do
    case "${file_data[$file]}" in
      "added") ((added_count++)) ;;
      "modified") ((modified_count++)) ;;
      "removed") ((removed_count++)) ;;
    esac
  done
  
  # Summary
  echo "### Summary"
  [ $added_count -gt 0 ] && echo "- ✅ **$added_count** files added"
  [ $modified_count -gt 0 ] && echo "- ⚠️ **$modified_count** files modified"
  [ $removed_count -gt 0 ] && echo "- ❌ **$removed_count** files removed"
  echo ""
  
  echo "### File Tree"
  if [ ${#file_data[@]} -gt 0 ]; then
    render_tree "" ""
  else
    echo "No files to display"
  fi
  
  echo ""
  echo "---"
  echo "_Last updated: $(date '+%Y-%m-%d %H:%M:%S UTC')_"
} > comment_content.md

echo "Comment content generated successfully"
