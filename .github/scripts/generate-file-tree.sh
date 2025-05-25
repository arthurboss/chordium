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

# Generate PR comment content
echo "📝 Generating comment content..."
{
  echo "## 📂 Changed Files Tree"
  echo ""
  echo "_Automatically generated file tree • Click folders to expand/collapse_"
  echo ""

  echo "### File Tree"
  for file in "${!file_data[@]}"; do
    STATUS="${file_data[$file]}"
    echo "- $STATUS $file"
  done

  echo ""
  echo "---"
  echo "_Last updated: $(date '+%Y-%m-%d %H:%M:%S UTC')_"
} > comment_content.md

# Debug: Verify final output before posting comment
echo "✅ Successfully generated PR comment content. Preview below:"
cat comment_content.md
