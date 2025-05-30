#!/bin/bash

# Interactive wizard orchestrator
# Single responsibility: Coordinate the wizard flow and collect user inputs

# Main wizard function
run_interactive_wizard() {
    # Get the directory of this script for relative imports
    local script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    
    # Source all wizard components
    source "$script_dir/ui/header.sh"
    source "$script_dir/ui/summary.sh"
    source "$script_dir/prompts/base_branch.sh"
    source "$script_dir/prompts/target_branch.sh"
    source "$script_dir/prompts/output_filename.sh"
    source "$script_dir/prompts/cleanup.sh"
    source "$script_dir/utils/wizard_utils.sh"
    
    # Validate that we can run the wizard
    if ! validate_wizard_dependencies; then
        return 1
    fi
    
    # Step 1: Show welcome header
    show_wizard_header
    
    # Step 2: Get base branch
    local base_branch=$(prompt_base_branch)
    
    # Step 3: Get target branch
    local target_branch=$(prompt_target_branch)
    
    # Step 4: Get output filename
    local output_file=$(prompt_output_filename "$base_branch" "$target_branch")
    
    # Step 5: Ask about cleanup
    local cleanup=$(prompt_cleanup_results)
    
    # Step 6: Show summary and confirm
    show_wizard_summary "$base_branch" "$target_branch" "$output_file" "$cleanup"
    
    # Step 7: Export results for main script consumption
    export_wizard_results "$base_branch" "$target_branch" "$output_file" "$cleanup"
}
