#!/bin/bash

# Argument parsing utility functions for file tree generation
# Handles command line argument parsing and validation

# Function to show usage information for main script
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

# Function to show usage information for standalone script
show_standalone_usage() {
    echo "Git File Tree Generator (Standalone) - Generate markdown file trees for git changes"
    echo ""
    echo "USAGE:"
    echo "  $0 [base_branch] [output_file]"
    echo ""
    echo "ARGUMENTS:"
    echo "  base_branch   Base branch to compare against (auto-detected if not specified)"
    echo "  output_file   Output markdown file (auto-generated if not specified)"
    echo ""
    echo "EXAMPLES:"
    echo "  $0                    # Auto-detect base branch and generate filename"
    echo "  $0 main               # Compare current branch vs main"
    echo "  $0 main compare.md    # Compare current vs main, output to file"
    echo ""
    echo "AUTO-GENERATED FILENAME FORMAT:"
    echo "  file-tree_<current>-vs-<base>_YYYY-MM-DD_HH-MM-SS.md"
    echo ""
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
                output_file="$2"
                shift 2
                ;;
            --help|-h)
                show_usage
                exit 0
                ;;
            -*)
                echo "Error: Unknown option $1"
                show_usage
                exit 1
                ;;
            *)
                # Positional arguments - legacy format
                if [[ -z "$base_branch" ]]; then
                    base_branch="$1"
                elif [[ -z "$target_branch" ]] && [[ "$1" != *.md ]]; then
                    target_branch="$1"
                elif [[ -z "$output_file" ]]; then
                    output_file="$1"
                else
                    echo "Error: Too many arguments"
                    show_usage
                    exit 1
                fi
                shift
                ;;
        esac
    done
}

# Function to parse legacy command line arguments (for standalone script)
parse_legacy_arguments() {
    local base_branch=""
    local output_file=""
    
    # Process arguments
    while [[ $# -gt 0 ]]; do
        if [[ -z "$base_branch" ]]; then
            base_branch="$1"
        elif [[ -z "$output_file" ]]; then
            output_file="$1"
        fi
        shift
    done
    
    # Export variables for calling script
    PARSED_BASE_BRANCH="$base_branch"
    PARSED_OUTPUT_FILE="$output_file"
}
