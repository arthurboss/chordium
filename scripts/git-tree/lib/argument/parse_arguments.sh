#!/bin/bash

# Function to parse modern command line arguments
parse_arguments() {
    # Source dependencies
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    source "$SCRIPT_DIR/show_usage.sh"
    source "$SCRIPT_DIR/../git/get_current_branch.sh"
    source "$SCRIPT_DIR/../wizard/interactive_wizard.sh"
    
    base_branch=""
    target_branch=""
    output_file=""
    show_wizard=false
    
    # If no arguments provided, show wizard
    if [[ $# -eq 0 ]]; then
        show_wizard=true
    fi
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --help|-h)
                show_usage
                exit 0
                ;;
            --wizard)
                show_wizard=true
                shift
                ;;
            --base)
                base_branch="$2"
                show_wizard=false
                shift 2
                ;;
            --target)
                target_branch="$2"
                show_wizard=false
                shift 2
                ;;
            --output)
                output_file="$2"
                show_wizard=false
                shift 2
                ;;
            --*)
                # Smart flag parsing: single flags like --feat-search become base/target branch
                local flag_name="${1#--}"  # Remove -- prefix
                if [[ -z "$base_branch" ]]; then
                    base_branch="$flag_name"
                    show_wizard=false
                    echo "Smart flag detected: Using '$flag_name' as base branch"
                elif [[ -z "$target_branch" ]]; then
                    target_branch="$flag_name"
                    show_wizard=false
                    echo "Smart flag detected: Using '$flag_name' as target branch"
                else
                    echo "Error: Unknown option $1 (base branch '$base_branch' and target branch '$target_branch' already set)"
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
                show_wizard=false
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
    
    # If wizard should be shown, run it and use its results
    if [[ "$show_wizard" == true ]]; then
        run_interactive_wizard
        base_branch="$WIZARD_BASE_BRANCH"
        target_branch="$WIZARD_TARGET_BRANCH"
        output_file="$WIZARD_OUTPUT_FILE"
        # Export cleanup decision for later use
        WIZARD_SHOULD_CLEANUP="$WIZARD_CLEANUP"
    else
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
    fi
    
    # Export variables for calling script
    PARSED_BASE_BRANCH="$base_branch"
    PARSED_TARGET_BRANCH="$target_branch"
    PARSED_OUTPUT_FILE="$output_file"
}
