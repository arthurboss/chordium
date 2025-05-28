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

# Source the prompt_and_cleanup_results utility (ensure it's loaded for all entry scripts)
source "$SCRIPT_DIR/lib/file/prompt_and_cleanup_results.sh"

# Prompt user to clean up previous results
prompt_and_cleanup_results
    
# Colors
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Main script logic
main() {
    # Check if we're in a git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        echo -e "${CYAN}Error: Not in a git repository${NC}"
        exit 1
    fi
    
    # Parse command line arguments (sets global variables: base_branch, target_branch, output_file)
    parse_arguments "$@"
    
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
        echo
    else
        echo -e "${CYAN}Using specified base branch:${NC} ${MAGENTA}$base_branch${NC}"
        echo
    fi
    
    # Auto-generate output file name if not provided as a flag
    if [[ -z "$output_file" ]]; then
        output_file=$(generate_auto_filename "$target_branch" "$base_branch")
        echo -e "${CYAN}Auto-generated output filename:${NC} ${MAGENTA}$output_file${NC}"
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
        echo -e "${CYAN}📄 Output:${NC} ${MAGENTA}$output_file${NC}"
        echo
        local total_files=$(git diff --name-status $base_branch...$target_branch | wc -l | tr -d ' ')
        echo -e "${CYAN}📊 Total files changed:${NC} ${MAGENTA}$total_files${NC}"
        echo
        echo -e "${CYAN}🔄 Comparison:${NC} ${MAGENTA}$target_branch${NC} ${CYAN}vs${NC} ${MAGENTA}$base_branch${NC}"
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
