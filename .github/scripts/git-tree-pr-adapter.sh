#!/bin/bash

# GitHub Action Adapter for Git Tree PR Comments
# 
# This script adapts our git-tree script for use in GitHub Actions.
# It uses GitHub API to fetch file changes (compatible with Actions environment)
# and generates PR comments using our modern git-tree rendering format.
#
# Dependencies: 
# - curl and jq (for GitHub API calls)
# - GitHub Action environment variables
#
# Environment Variables Required:
# - GITHUB_REPOSITORY: Repository in format "owner/repo"
# - PR_NUMBER: Pull request number
# - GITHUB_TOKEN: GitHub API token
# - GITHUB_HEAD_REF: PR head branch name
# - GITHUB_BASE_REF: PR base branch name

set -e  # Exit on error

# Color codes for logging
readonly CYAN='\033[0;36m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly RED='\033[0;31m'
readonly NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Validate required environment variables
validate_environment() {
    local required_vars=("GITHUB_REPOSITORY" "PR_NUMBER" "GITHUB_TOKEN" "GITHUB_HEAD_REF" "GITHUB_BASE_REF")
    local missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var}" ]]; then
            missing_vars+=("$var")
        fi
    done
    
    if [[ ${#missing_vars[@]} -gt 0 ]]; then
        log_error "Missing required environment variables:"
        printf '  - %s\n' "${missing_vars[@]}"
        exit 1
    fi
    
    log_success "All required environment variables are present"
}

# Display environment information for debugging
show_environment_info() {
    log_info "GitHub Action Environment:"
    echo "  Repository: $GITHUB_REPOSITORY"
    echo "  PR Number: $PR_NUMBER"
    echo "  Head Branch: $GITHUB_HEAD_REF"
    echo "  Base Branch: $GITHUB_BASE_REF"
}

# Fetch changed files from GitHub API (GitHub Actions compatible)
fetch_changed_files_from_api() {
    log_info "Fetching changed files from GitHub API..."
    
    # Fetch changed files from GitHub API
    local files_response
    files_response=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
        "https://api.github.com/repos/$GITHUB_REPOSITORY/pulls/$PR_NUMBER/files")
    
    # Check curl exit code
    if [[ $? -ne 0 ]]; then
        log_error "Failed to fetch files from GitHub API (curl error)"
        return 1
    fi
    
    # Check if response is empty
    if [[ -z "$files_response" ]]; then
        log_error "Empty response from GitHub API"
        return 1
    fi
    
    # Check if response contains an error
    if echo "$files_response" | jq -e '.message' > /dev/null 2>&1; then
        local error_message=$(echo "$files_response" | jq -r '.message')
        log_error "GitHub API error: $error_message"
        return 1
    fi
    
    # Parse the response to get file status and names
    local changed_files
    changed_files=$(echo "$files_response" | jq -r '.[] | "\(.status) \(.filename)"' 2>/dev/null)
    
    # Check jq parsing success
    if [[ $? -ne 0 ]]; then
        log_error "Failed to parse GitHub API response with jq"
        log_info "API Response preview: $(echo "$files_response" | head -c 200)"
        return 1
    fi
    
    if [[ -z "$changed_files" ]]; then
        log_warning "No files found in PR"
        return 1
    fi
    
    log_success "Successfully fetched $(echo "$changed_files" | wc -l | tr -d ' ') changed files"
    echo "$changed_files"
    return 0
}

# Generate git-tree using GitHub API data (GitHub Actions compatible)
generate_git_tree() {
    local base_branch="$1" 
    local target_branch="$2"
    local output_file="$3"
    
    log_info "Generating git-tree for $target_branch vs $base_branch using GitHub API"
    
    # Fetch changed files from GitHub API
    local changed_files
    if ! changed_files=$(fetch_changed_files_from_api); then
        log_error "Failed to fetch changed files"
        return 1
    fi
    
    log_info "Found $(echo "$changed_files" | wc -l | tr -d ' ') changed files"
    
    # Generate the tree using direct API data (no local git dependencies)
    generate_tree_from_api_data "$changed_files" "$base_branch" "$target_branch" "$output_file"
    
    if [[ -f "$output_file" ]]; then
        log_success "Git-tree generated successfully from API data"
        return 0
    else
        log_error "Failed to generate git-tree file"
        return 1
    fi
}

# Generate tree from GitHub API file data using modern git-tree rendering logic
generate_tree_from_api_data() {
    local changed_files="$1"
    local base_branch="$2"
    local target_branch="$3"
    local output_file="$4"
    
    # Get repository name for display
    local repo_name="${GITHUB_REPOSITORY##*/}"
    local total_files=$(echo "$changed_files" | wc -l | tr -d ' ')
    
    log_info "Generating tree structure for $total_files files using modern git-tree format"
    
    # Create file with modern git-tree format but using API data
    {
        echo "<!-- filepath: $output_file -->"
        echo ""
        echo "# Git Tree: $target_branch vs $base_branch"
        echo ""
        echo "**Repository:** [$repo_name](https://github.com/$GITHUB_REPOSITORY)"
        echo "**Branch:** [$target_branch](https://github.com/$GITHUB_REPOSITORY/tree/$target_branch) vs [$base_branch](https://github.com/$GITHUB_REPOSITORY/tree/$base_branch)"
        echo "**Files Changed:** $total_files"
        echo ""
        echo "---"
        echo ""
        
        # Generate the file tree using blockquote format (modern git-tree style)
        echo "> ## 📁 File Tree"
        echo ">"
        echo "> \`\`\`"
        echo "> $repo_name/"
        
        # Get all unique folders, sorted
        local folders
        folders=$(echo "$changed_files" | awk '{print $2}' | grep '/' | sed 's|/[^/]*$||' | sort -u)
        
        # First pass: collect all files by folder for proper tree structure
        declare -A folder_files
        declare -A root_files_array
        
        # Process each file and organize by folder
        while IFS= read -r line; do
            [[ -z "$line" ]] && continue
            local status=$(echo "$line" | awk '{print $1}')
            local filepath=$(echo "$line" | awk '{print $2}')
            local filename=$(basename "$filepath")
            
            # Get status icon
            local icon
            case "$status" in
                "added") icon="✅" ;;
                "modified") icon="✏️" ;;
                "removed") icon="❌" ;;
                "renamed") icon="🔄" ;;
                *) icon="📄" ;;
            esac
            
            if [[ "$filepath" == *"/"* ]]; then
                # File is in a folder
                local folder_path=$(dirname "$filepath")
                folder_files["$folder_path"]+="$icon $filename"$'\n'
            else
                # Root file
                root_files_array["$filepath"]="$icon $filepath"
            fi
        done <<< "$changed_files"
        
        # Generate tree structure for folders
        if [[ -n "$folders" ]]; then
            local folder_array=()
            while IFS= read -r folder; do
                [[ -n "$folder" ]] && folder_array+=("$folder")
            done <<< "$folders"
            
            # Sort folders for consistent output
            IFS=$'\n' sorted_folders=($(sort <<<"${folder_array[*]}"))
            
            for ((i=0; i<${#sorted_folders[@]}; i++)); do
                local folder="${sorted_folders[$i]}"
                local is_last_folder=$((i == ${#sorted_folders[@]} - 1))
                
                # Determine tree character for folder
                local folder_char="├──"
                if [[ $is_last_folder == 1 && ${#root_files_array[@]} == 0 ]]; then
                    folder_char="└──"
                fi
                
                echo "> $folder_char 📁 $folder/"
                
                # Show files in this folder
                if [[ -n "${folder_files[$folder]}" ]]; then
                    local files_in_folder="${folder_files[$folder]}"
                    local file_lines=()
                    while IFS= read -r file_line; do
                        [[ -n "$file_line" ]] && file_lines+=("$file_line")
                    done <<< "$files_in_folder"
                    
                    for ((j=0; j<${#file_lines[@]}; j++)); do
                        local file_entry="${file_lines[$j]}"
                        local is_last_file=$((j == ${#file_lines[@]} - 1))
                        
                        # Determine tree character for file
                        local file_char="├──"
                        if [[ $is_last_file == 1 ]]; then
                            file_char="└──"
                        fi
                        
                        if [[ $is_last_folder == 1 && ${#root_files_array[@]} == 0 ]]; then
                            # Last folder and no root files
                            echo "> │   $file_char $file_entry"
                        else
                            # More folders or root files coming
                            echo "> │   $file_char $file_entry"
                        fi
                    done
                fi
            done
        fi
        
        # Show root files
        if [[ ${#root_files_array[@]} -gt 0 ]]; then
            local root_files_sorted=()
            for filepath in "${!root_files_array[@]}"; do
                root_files_sorted+=("$filepath")
            done
            IFS=$'\n' root_files_sorted=($(sort <<<"${root_files_sorted[*]}"))
            
            for ((i=0; i<${#root_files_sorted[@]}; i++)); do
                local filepath="${root_files_sorted[$i]}"
                local file_entry="${root_files_array[$filepath]}"
                local is_last=$((i == ${#root_files_sorted[@]} - 1))
                
                local char="├──"
                if [[ $is_last == 1 ]]; then
                    char="└──"
                fi
                
                echo "> $char $file_entry"
            done
        fi
        
        echo "> \`\`\`"
        echo ">"
        echo "> **Legend:** ✅ Added • ✏️ Modified • ❌ Deleted • 🔄 Renamed"
        
    } > "$output_file"
    
    log_success "Generated modern git-tree structure with $total_files files"
}

# Convert git-tree markdown to GitHub PR comment format
format_for_github_comment() {
    local git_tree_file="$1"
    local output_file="$2"
    
    log_info "Formatting git-tree output for GitHub comment"
    
    if [[ ! -f "$git_tree_file" ]]; then
        log_error "Git-tree file not found: $git_tree_file"
        exit 1
    fi
    
    # Create GitHub comment with proper markers
    {
        echo "<!-- AUTO-GENERATED FILE TREE -->"
        echo "<!-- This comment will be updated automatically by the GitHub Action -->"
        echo ""
        echo "## 📁 File Tree Changes"
        echo ""
        echo "_Generated by [git-tree script](./scripts/git-tree/) for PR #${PR_NUMBER}_"
        echo ""
        
        # Include the git-tree content, but skip the header and filepath comment
        # since we're adding our own
        tail -n +3 "$git_tree_file" | grep -v "^<!-- filepath:"
        
        echo ""
        echo "---"
        echo "_🤖 This comment is automatically updated when the PR changes_"
        echo ""
        echo "<!-- END AUTO-GENERATED FILE TREE -->"
        
    } > "$output_file"
    
    log_success "GitHub comment formatted and saved to: $output_file"
}

# Main execution function
main() {
    log_info "Starting Git-Tree PR Comment Generation"
    
    # Validate environment
    validate_environment
    show_environment_info
    
    # Set up file paths
    local git_tree_output="temp_git_tree.md"
    local github_comment_output="pr_comment.md"
    
    # Generate git-tree
    if ! generate_git_tree "$GITHUB_BASE_REF" "$GITHUB_HEAD_REF" "$git_tree_output"; then
        log_error "Failed to generate git-tree"
        exit 1
    fi
    
    # Format for GitHub comment
    format_for_github_comment "$git_tree_output" "$github_comment_output"
    
    # Cleanup temporary file
    rm -f "$git_tree_output"
    
    log_success "PR comment file generated: $github_comment_output"
    log_info "Content preview:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    head -20 "$github_comment_output"
    echo "..."
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

# Run main function
main "$@"
