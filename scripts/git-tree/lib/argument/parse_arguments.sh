#!/bin/bash

# Function to parse modern command line arguments
parse_arguments() {
    # Source dependencies
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    source "$SCRIPT_DIR/show_usage.sh"
    source "$SCRIPT_DIR/../git/get_current_branch.sh"
    
    base_branch=""
    target_branch=""
    output_file=""
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --help|-h)
                show_usage
                exit 0
                ;;
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
            --*)
                # Smart flag parsing: single flags like --feat-search become base branch
                local flag_name="${1#--}"  # Remove -- prefix
                if [[ -z "$base_branch" ]]; then
                    base_branch="$flag_name"
                    echo "Smart flag detected: Using '$flag_name' as base branch"
                else
                    echo "Error: Unknown option $1 (base branch already set to '$base_branch')"
                    show_usage
                    exit 1
                fi
                shift
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
    
    # Handle "current" keyword for target branch
    if [[ "$target_branch" == "current" ]]; then
        target_branch=$(get_current_branch)
        if [[ -z "$target_branch" ]]; then
            echo "Error: Could not determine current branch"
            exit 1
        fi
        echo "Resolved 'current' to: $target_branch"
    fi
    
    # Handle "current" keyword for base branch
    if [[ "$base_branch" == "current" ]]; then
        base_branch=$(get_current_branch)
        if [[ -z "$base_branch" ]]; then
            echo "Error: Could not determine current branch"
            exit 1
        fi
        echo "Resolved 'current' to: $base_branch"
    fi
    
    # Export variables for calling script
    PARSED_BASE_BRANCH="$base_branch"
    PARSED_TARGET_BRANCH="$target_branch"
    PARSED_OUTPUT_FILE="$output_file"
}
