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

# Get the directory of this script for relative imports
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Source all utility functions via the central loader
source "$SCRIPT_DIR/lib/loader.sh"
    
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
        target_branch=$(get_current_branch)
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
        # Ensure .md extension
        output_file=$(ensure_md_extension "$output_file")
        echo "Using specified output file: $output_file"
    fi
    
    # Ensure results directory exists and resolve full output path
    ensure_results_directory
    output_file=$(resolve_output_path "$output_file")
    
    # Verify base branch exists (unless it's HEAD~1)
    if [[ "$base_branch" != "HEAD~1" ]] && ! branch_exists_locally "$base_branch"; then
        echo "Error: Base branch '$base_branch' does not exist"
        exit 1
    fi
    
    # Verify target branch exists
    if ! branch_exists_locally "$target_branch"; then
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
