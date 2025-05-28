#!/bin/bash

# Function to parse modern command line arguments
parse_arguments() {
    # Source dependencies
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    source "$SCRIPT_DIR/show_usage.sh"
    
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
    
    # Export variables for calling script
    PARSED_BASE_BRANCH="$base_branch"
    PARSED_TARGET_BRANCH="$target_branch"
    PARSED_OUTPUT_FILE="$output_file"
}
