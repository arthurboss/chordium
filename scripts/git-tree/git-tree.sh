#!/bin/bash

# Script for generating file tree structure based on real git changes
# Automatically detects the base branch or allows manual specification
# Supports modern flag-based usage with auto-generated filenames
# 
# Usage: 
#   ./git-file-tree.sh [--base BASE_BRANCH] [--target TARGET_BRANCH] [--output OUTPUT_FILE]
#   ./git-file-tree.sh [base_branch] [output_file]  # Legacy support
# 
# Examples:
#   ./git-file-tree.sh --base main --target feat/search
#   ./git-file-tree.sh --output my-comparison.md
#   ./git-file-tree.sh feat--search compare-output.md  # Legacy
#
# Auto-generated filename pattern: tree-<target>-vs-<base>-YYYYMMDD-HHMMSS.md

# Source the render functions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/git-tree-render.sh"

# Function to show usage information
show_usage() {
    echo "Git File Tree Generator - Generate markdown file trees for git changes"
    echo ""
    echo "USAGE:"
    echo "  $0 [--base BASE_BRANCH] [--target TARGET_BRANCH] [--output OUTPUT_FILE]"
    echo "  $0 [base_branch] [target_branch] [output_file]  # Legacy format"
    echo ""
    echo "FLAGS:"
    echo "  --base BRANCH     Base branch to compare against (auto-detected if not specified)"
    echo "  --target BRANCH   Target branch to compare (defaults to current branch)"
    echo "  --output FILE     Output markdown file (auto-generated if not specified)"
    echo "  --help, -h        Show this help message"
    echo ""
    echo "EXAMPLES:"
    echo "  $0                                    # Auto-detect everything"
    echo "  $0 --base main                       # Compare current branch vs main"
    echo "  $0 --base main --target feat/search  # Compare specific branches"
    echo "  $0 --output my-tree.md               # Custom output filename"
    echo "  $0 main feat/search                  # Legacy: compare main vs feat/search"
    echo "  $0 main compare.md                   # Legacy: compare current vs main, output to file"
    echo ""
    echo "AUTO-GENERATED FILENAME FORMAT:"
    echo "  file-tree_<target>-vs-<base>_YYYY-MM-DD_HH-MM-SS.md"
    echo ""
}

# Function to generate auto filename
generate_auto_filename() {
    local target_branch="$1"
    local base_branch="$2"
    local timestamp=$(date +"%Y-%m-%d_%H-%M-%S")
    
    # Sanitize branch names for filename (replace / with -)
    local safe_target=$(echo "$target_branch" | sed 's/[\/:]/-/g')
    local safe_base=$(echo "$base_branch" | sed 's/[\/:]/-/g')
    
    echo "file-tree_${safe_target}-vs-${safe_base}_${timestamp}.md"
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

# Function to parse modern command line arguments
parse_arguments() {
    base_branch=""
    target_branch=""
    output_file=""
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --base)
                base_branch="$2"
                shift 2
                ;;
            --target)
                target_branch="$2"
                shift 2
                ;;
            --output)
                output_file=$(ensure_md_extension "$2")
                shift 2
                ;;
            --help|-h)
                show_usage
                exit 0
                ;;
            --*)
                echo "Error: Unknown flag '$1'"
                echo "Use --help for usage information"
                exit 1
                ;;
            *)
                # Legacy positional arguments
                if [[ -z "$base_branch" ]]; then
                    base_branch="$1"
                elif [[ -z "$target_branch" ]]; then
                    # Check if this looks like a filename (ends in .md)
                    if [[ "$1" == *.md ]]; then
                        output_file=$(ensure_md_extension "$1")
                    else
                        target_branch="$1"
                    fi
                elif [[ -z "$output_file" ]]; then
                    output_file=$(ensure_md_extension "$1")
                else
                    echo "Error: Too many arguments"
                    echo "Use --help for usage information"
                    exit 1
                fi
                shift
                ;;
        esac
    done
}
# Function to automatically detect the base branch
detect_base_branch() {
    local target_branch="${1:-$(git branch --show-current)}"
    
    # If target is main/master, there's nothing to compare
    if [[ "$target_branch" == "main" || "$target_branch" == "master" ]]; then
        echo "main"
        return
    fi
    
    # Look for "Merge branch" patterns in recent commits of the target branch
    local merge_pattern=$(git log --oneline -20 "$target_branch" 2>/dev/null | grep "Merge branch" | head -1)
    if [[ -n "$merge_pattern" ]]; then
        # Extract the branch name from merge commit message
        # Pattern: "Merge branch 'source-branch' into target-branch"
        local source_branch=$(echo "$merge_pattern" | sed -n "s/.*Merge branch '\([^']*\)'.*/\1/p")
        if [[ -n "$source_branch" && "$source_branch" != "$target_branch" ]]; then
            # Check if this branch exists and is different from target
            if git show-ref --verify --quiet "refs/heads/$source_branch"; then
                echo "$source_branch"
                return
            fi
        fi
    fi
    
    # Strategy: Find branches that are ancestors of the target branch
    local best_branch=""
    local best_distance=999999
    
    while IFS= read -r branch; do
        branch=$(echo "$branch" | sed 's/^[* ] *//' | sed 's/ .*//')
        
        # Skip target branch, main, master, remote branches, and cache branches
        if [[ "$branch" == "$target_branch" || "$branch" == "main" || "$branch" == "master" || "$branch" =~ ^remotes/ || "$branch" =~ cache ]]; then
            continue
        fi
        
        # Skip if branch doesn't exist
        if ! git show-ref --verify --quiet "refs/heads/$branch"; then
            continue
        fi
        
        # Check if this branch is an ancestor of target branch
        if git merge-base --is-ancestor "$branch" "$target_branch" 2>/dev/null; then
            # Calculate distance (number of commits) from this branch to target
            local distance=$(git rev-list --count "$branch".."$target_branch" 2>/dev/null)
            if [[ -n "$distance" && "$distance" -lt "$best_distance" && "$distance" -gt 0 ]]; then
                best_distance="$distance"
                best_branch="$branch"
            fi
        fi
    done <<< "$(git branch 2>/dev/null)"
    
    # If we found a good candidate, use it
    if [[ -n "$best_branch" ]]; then
        echo "$best_branch"
        return
    fi
    
    # Fallback to main/master
    if git show-ref --verify --quiet refs/heads/main; then
        echo "main"
    elif git show-ref --verify --quiet refs/heads/master; then
        echo "master"
    else
        echo "HEAD~1"  # Compare with previous commit
    fi
}

# Main script logic
main() {
    # Check if we're in a git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        echo "Error: Not in a git repository"
        exit 1
    fi
    
    # Parse command line arguments (sets global variables: base_branch, target_branch, output_file)
    parse_arguments "$@"
    
    # Set defaults for target branch (current branch if not specified)
    if [[ -z "$target_branch" ]]; then
        target_branch=$(git branch --show-current)
        if [[ -z "$target_branch" ]]; then
            echo "Error: Could not determine current branch"
            exit 1
        fi
    fi
    
    # Auto-detect base branch if not provided
    if [[ -z "$base_branch" ]]; then
        base_branch=$(detect_base_branch "$target_branch")
        echo "Auto-detected base branch: $base_branch"
    else
        echo "Using specified base branch: $base_branch"
    fi
    
    # Generate auto filename if not provided
    if [[ -z "$output_file" ]]; then
        output_file=$(generate_auto_filename "$target_branch" "$base_branch")
        echo "Auto-generated output file: $output_file"
    else
        echo "Using specified output file: $output_file"
    fi
    
    # Verify base branch exists (unless it's HEAD~1)
    if [[ "$base_branch" != "HEAD~1" ]] && ! git show-ref --verify --quiet "refs/heads/$base_branch"; then
        echo "Error: Base branch '$base_branch' does not exist"
        exit 1
    fi
    
    # Verify target branch exists
    if ! git show-ref --verify --quiet "refs/heads/$target_branch"; then
        echo "Error: Target branch '$target_branch' does not exist"
        exit 1
    fi
    
    local project_name=$(get_project_name)
    
    echo ""
    echo "🔍 Git File Tree Generation"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📁 Project: $project_name"
    echo "🎯 Target:  $target_branch"
    echo "📍 Base:    $base_branch"
    echo "📄 Output:  $output_file"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    # Render the file tree using target vs base comparison
    if render_file_tree "$base_branch" "$output_file" "$target_branch" "$project_name"; then
        echo "✅ File tree generated successfully!"
        echo "📄 Output: $output_file"
        
        local total_files=$(git diff --name-status $base_branch...$target_branch | wc -l | tr -d ' ')
        echo "📊 Total files changed: $total_files"
        echo "🔄 Comparison: $target_branch vs $base_branch"
        echo ""
        echo "🎉 Ready for PR comments or documentation!"
    else
        echo "❌ No changes found between $target_branch and $base_branch"
        echo "ℹ️  Both branches appear to be identical"
        exit 1
    fi
}

# Run the main function
main "$@"
