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

# Generate tree from GitHub API file data using exact git-tree rendering format
generate_tree_from_api_data() {
    local changed_files="$1"
    local base_branch="$2"
    local target_branch="$3"
    local output_file="$4"
    
    # Source URL generator utility
    local script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    source "$script_dir/lib/url_generator.sh"
    
    # Get repository URL and name
    local repo_url="https://github.com/$GITHUB_REPOSITORY"
    local repo_name="${GITHUB_REPOSITORY##*/}"
    local total_files=$(echo "$changed_files" | wc -l | tr -d ' ')
    
    log_info "Generating tree structure for $total_files files using exact git-tree format"
    
    # Create file with exact git-tree format but using GitHub URLs
    {
        echo "<!-- filepath: $output_file -->"
        echo "## 🔄 Changed Files ($total_files total)"
        echo ""
        echo "**[\`$base_branch\`]($repo_url/tree/$base_branch)** &#8592; **[\`$target_branch\`]($repo_url/tree/$target_branch)**"
        echo ""
        echo "> <details open>"
        echo "> <summary>"
        echo "> <strong>🏠 $repo_name</strong>"
        echo "> </summary>"
        echo ">"
        
        # Collect all files by folder for proper tree structure
        # Use arrays and string processing instead of associative arrays for compatibility
        local all_folders_list=""
        local root_files_list=""
        
        # First pass: collect folders and root files
        while IFS= read -r line; do
            [[ -z "$line" ]] && continue
            local status=$(echo "$line" | awk '{print $1}')
            local filepath=$(echo "$line" | awk '{print $2}')
            
            if [[ "$filepath" == *"/"* ]]; then
                # File is in a folder
                local folder_path=$(dirname "$filepath")
                # Add folder to list if not already present
                if [[ ! "$all_folders_list" == *"$folder_path"$'\n'* && ! "$all_folders_list" == "$folder_path" ]]; then
                    all_folders_list="${all_folders_list}${folder_path}"$'\n'
                fi
            else
                # Root file
                root_files_list="${root_files_list}${status} ${filepath}"$'\n'
            fi
        done <<< "$changed_files"
        
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
        
        # Function to get files for a specific folder
        get_folder_files() {
            local target_folder="$1"
            local result=""
            while IFS= read -r line; do
                [[ -z "$line" ]] && continue
                local status=$(echo "$line" | awk '{print $1}')
                local filepath=$(echo "$line" | awk '{print $2}')
                
                if [[ "$filepath" == *"/"* ]]; then
                    local folder_path=$(dirname "$filepath")
                    if [[ "$folder_path" == "$target_folder" ]]; then
                        result="${result}${status} ${filepath}"$'\n'
                    fi
                fi
            done <<< "$changed_files"
            echo "$result"
        }
        
        # Sort and render root files first
        if [[ -n "$root_files_list" ]]; then
            local root_files_sorted
            root_files_sorted=$(echo "$root_files_list" | grep -v '^$' | sort)
            
            local root_files_array=()
            while IFS= read -r file_line; do
                [[ -n "$file_line" ]] && root_files_array+=("$file_line")
            done <<< "$root_files_sorted"
            
            local all_folders_count
            all_folders_count=$(echo "$all_folders_list" | grep -v '^$' | wc -l | tr -d ' ')
            
            for ((i=0; i<${#root_files_array[@]}; i++)); do
                local file_line="${root_files_array[$i]}"
                local status=$(echo "$file_line" | awk '{print $1}')
                local filepath=$(echo "$file_line" | awk '{print $2}')
                local icon=$(get_status_icon "$status")
                local file_link=$(create_markdown_link "$filepath" "github" "$repo_url" "$target_branch")
                
                # Use different connector for last file if no folders follow
                if [[ $i -eq $((${#root_files_array[@]} - 1)) && $all_folders_count -eq 0 ]]; then
                    echo "> &emsp;&#9493;$icon $file_link"
                else
                    echo "> &emsp;&#9501;$icon $file_link<br>"
                fi
            done
        fi
        
        # Sort and render folders
        if [[ -n "$all_folders_list" ]]; then
            local sorted_folders
            sorted_folders=$(echo "$all_folders_list" | grep -v '^$' | sort)
            
            local folders_array=()
            while IFS= read -r folder; do
                [[ -n "$folder" ]] && folders_array+=("$folder")
            done <<< "$sorted_folders"
            
            for ((folder_idx=0; folder_idx<${#folders_array[@]}; folder_idx++)); do
                local folder="${folders_array[$folder_idx]}"
                local is_last_folder=$((folder_idx == ${#folders_array[@]} - 1))
                
                echo "> <!-- $folder folder -->"
                echo "> <details>"
                echo "> <summary>"
                echo "> &#9492;<strong>🗂️ $folder</strong>"
                echo "> </summary>"
                echo ">"
                
                # Get files for this folder and sort them
                local folder_files_raw
                folder_files_raw=$(get_folder_files "$folder")
                
                local folder_files_array=()
                while IFS= read -r file_line; do
                    [[ -n "$file_line" ]] && folder_files_array+=("$file_line")
                done <<< "$(echo "$folder_files_raw" | grep -v '^$' | sort)"
                
                # Render files in folder
                for ((file_idx=0; file_idx<${#folder_files_array[@]}; file_idx++)); do
                    local file_line="${folder_files_array[$file_idx]}"
                    local status=$(echo "$file_line" | awk '{print $1}')
                    local filepath=$(echo "$file_line" | awk '{print $2}')
                    local icon=$(get_status_icon "$status")
                    local file_link=$(create_markdown_link "$filepath" "github" "$repo_url" "$target_branch")
                    
                    # Use different connector for last file
                    if [[ $file_idx -eq $((${#folder_files_array[@]} - 1)) ]]; then
                        echo "> &emsp;&emsp;&#9493;$icon $file_link"
                    else
                        echo "> &emsp;&emsp;&#9501;$icon $file_link<br>"
                    fi
                done
                
                echo "> </details>"
                echo ">"
            done
        fi
        
        echo "> </details>"
        
    } > "$output_file"
    
    log_success "Generated exact git-tree structure with $total_files files and GitHub URLs"
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
