#!/bin/bash

# Script for generating file tree structure based on real git changes
# Automatically detects the base branch or allows manual specification
# Supports modern flag-based usage with auto-generated filenames
# 
# Usage: 
#   ./git-file-tree.sh [--base BASE_BRANCH] [--target TARGET_BRANCH] [--output OUTPUT_FILE]
#   ./git-file-tree.sh [--BRANCH_NAME]                               # Smart flag usage
#   ./git-file-tree.sh [base_branch] [output_file]                   # Legacy support
# 
# Examples:
#   ./git-file-tree.sh --base main --target feat/search
#   ./git-file-tree.sh --feat-search                                 # Smart flag: base branch
#   ./git-file-tree.sh --target current --base main                  # Use "current" keyword
#   ./git-file-tree.sh --output my-comparison.md
#   ./git-file-tree.sh feat--search compare-output.md              # Legacy
#
# Auto-generated filename pattern: git-tree_<target>-vs-<base>_YYYYMMDD-HHMMSS.md

# Get the directory of this script for relative imports
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Source all utility functions via the central loader
source "$SCRIPT_DIR/lib/loader.sh"

# Source the prompt_and_cleanup_results utility (ensure it's loaded for all entry scripts)
source "$SCRIPT_DIR/lib/file/prompt_and_cleanup_results.sh"
    
# Colors (only define if not already defined)
if [[ -z "${MAIN_COLORS_LOADED:-}" ]]; then
    export MAIN_COLORS_LOADED=1
    CYAN='\033[0;36m'
    MAGENTA='\033[0;35m'
    NC='\033[0m' # No Color
fi

# Main script logic
main() {
    # Parse command line arguments first (this handles --help and exits early if needed)
    parse_arguments "$@"
    
    # Use parsed variables from parse_arguments
    local base_branch="$PARSED_BASE_BRANCH"
    local target_branch="$PARSED_TARGET_BRANCH"
    local output_file="$PARSED_OUTPUT_FILE"
    local cleanup_flag="$PARSED_CLEANUP_FLAG"
    local auto_mode="$PARSED_AUTO_MODE"
    
    # Handle cleanup - from wizard, flags, auto mode, or traditional prompt
    if [[ -n "$WIZARD_SHOULD_CLEANUP" ]]; then
        # Wizard was used, use its cleanup decision
        if [[ "$WIZARD_SHOULD_CLEANUP" == "yes" ]]; then
            local results_dir="$GIT_TREE_SCRIPT_DIR/results"
            if [ -d "$results_dir" ]; then
                rm -rf "$results_dir"/*
                echo -e "${MAGENTA}🗑️  Cleaned up previous results${NC}"
                echo
            fi
        fi
    elif [[ -n "$cleanup_flag" ]]; then
        # Cleanup flag was used (--n or --y)
        if [[ "$cleanup_flag" == "yes" ]]; then
            local results_dir="$GIT_TREE_SCRIPT_DIR/results"
            if [ -d "$results_dir" ]; then
                rm -rf "$results_dir"/*
                echo -e "${MAGENTA}🗑️  Cleaned up previous results${NC}"
                echo
            fi
        fi
    elif [[ "$auto_mode" == "true" ]]; then
        # Auto mode: skip cleanup prompt (default behavior is no cleanup)
        :  # Do nothing - no cleanup prompt, no cleanup
    else
        # Traditional mode - prompt user for cleanup
        prompt_and_cleanup_results
    fi
    
    # Check if we're in a git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        echo -e "${CYAN}Error: Not in a git repository${NC}"
        exit 1
    fi
    
    # Set defaults for target branch (current branch if not specified)
    if [[ -z "$target_branch" ]]; then
        target_branch=$(get_current_branch)
        if [[ -z "$target_branch" ]]; then
            echo -e "${CYAN}Error: Could not determine current branch${NC}"
            exit 1
        fi
    fi
    
    # Auto-detect base branch if not provided
    if [[ -z "$base_branch" ]]; then
        base_branch=$(detect_base_branch "$target_branch")
        echo -e "${CYAN}Auto-detected base branch:${NC} ${MAGENTA}$base_branch${NC}"
    else
        echo -e "${CYAN}Using specified base branch:${NC} ${MAGENTA}$base_branch${NC}"
    fi
    
    # Auto-generate output file name if not provided as a flag
    if [[ -z "$output_file" ]]; then
        output_file=$(generate_auto_filename "$target_branch" "$base_branch")
        echo -e "${CYAN}The file name will be auto-generated!"
        echo
    else
        # Ensure .md extension
        output_file=$(ensure_md_extension "$output_file")
        echo -e "${CYAN}Using specified output filename:${NC} ${MAGENTA}$output_file${NC}"
        echo
    fi
    
    # Ensure results directory exists and resolve full output path
    ensure_results_directory
    output_file=$(resolve_output_path "$output_file")
    
    # Verify base branch exists (unless it's HEAD~1)
    if [[ "$base_branch" != "HEAD~1" ]] && ! branch_exists_locally "$base_branch"; then
        echo -e "${CYAN}Error: Base branch '${MAGENTA}$base_branch${CYAN}' does not exist${NC}"
        echo
        exit 1
    fi
    
    # Verify target branch exists
    if ! branch_exists_locally "$target_branch"; then
        echo -e "${CYAN}Error: Target branch '${MAGENTA}$target_branch${CYAN}' does not exist${NC}"
        echo
        exit 1
    fi
    
    local project_name=$(get_project_name)
    
    echo
    echo -e "${CYAN}🔍 Git File Tree Generation${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}📁 Project:${NC} ${MAGENTA}$project_name${NC}"
    echo -e "${CYAN}🎯 Target:${NC} ${MAGENTA}$target_branch${NC}"
    echo -e "${CYAN}📍 Base:${NC} ${MAGENTA}$base_branch${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo
    
    # Render the file tree using target vs base comparison
    if render_file_tree "$base_branch" "$output_file" "$target_branch" "$project_name"; then
        echo -e "${CYAN}✅ File tree generated successfully!${NC}"
        echo
        # Display relative path from current working directory so it's clickable
        local current_dir=$(pwd)
        local relative_output_file=$(python3 -c "import os; print(os.path.relpath('$output_file', '$current_dir'))" 2>/dev/null)
        if [[ -z "$relative_output_file" ]]; then
            # Fallback if Python fails
            relative_output_file="${output_file#$PWD/}"
        fi
        echo -e "${CYAN}📄 Output:${NC} ${MAGENTA}$relative_output_file${NC}"
        echo
    else
        echo -e "${CYAN}❌ No changes found between ${MAGENTA}$target_branch${CYAN} and ${MAGENTA}$base_branch${NC}"
        echo
        echo -e "${CYAN}ℹ️  Both branches appear to be identical${NC}"
        echo
        exit 1
    fi
}

# Run the main function
main "$@"
