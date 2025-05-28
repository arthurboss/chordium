#!/bin/bash

# Utility for rendering file tree header sections
# Handles branch formatting and project information display

# Render the main file tree header
render_header() {
    local base_branch="$1"
    local target_branch="$2"
    local project_name="$3"
    local total_files="$4"
    local output_file="$5"
    
    # Source dependencies for branch formatting
    local script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    source "$script_dir/../../github/format_branch_name.sh"
    source "$script_dir/../utils/output_writer.sh"
    
    # Write file header and title
    echo "<!-- filepath: $output_file -->" > "$output_file"
    echo "## 🔄 Changed Files ($total_files total)" >> "$output_file"
    write_empty_lines "$output_file"
    
    # Format branch names with links if they exist on remote
    local formatted_target_branch=$(format_branch_name "$target_branch")
    local formatted_base_branch=$(format_branch_name "$base_branch")
    
    # Write branch comparison (base ← target)
    echo "$formatted_base_branch &#8592; $formatted_target_branch" >> "$output_file"
    write_empty_lines "$output_file"
    
    # Start main project details section
    write_blockquote_details "$output_file" "🏠 $project_name" "true"
}
