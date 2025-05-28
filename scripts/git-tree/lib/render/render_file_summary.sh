#!/bin/bash

# Function to render file summary sections
render_file_summary() {
    local base_branch="$1"
    local output_file="$2"
    local all_files="$3"
    
    # Source dependencies
    local script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    source "$script_dir/utils/output_writer.sh"
    source "$script_dir/utils/file_processor.sh"
    
    write_empty_lines "$output_file"
    echo "## 📊 File Summary" >> "$output_file"
    write_empty_lines "$output_file"
    
    # Count files by status
    local added_count=$(count_files_by_status "$all_files" "A")
    local modified_count=$(count_files_by_status "$all_files" "M")
    local deleted_count=$(count_files_by_status "$all_files" "D")
    
    # Added files section
    write_details_section "$output_file" "✅ Added Files ($added_count)"
    
    if [[ "$added_count" -gt 0 ]]; then
        get_files_by_status "$all_files" "A" | awk '{print "- `" $2 "`"}' >> "$output_file"
    else
        echo "No files were added." >> "$output_file"
    fi
    
    close_details_section "$output_file"
    
    # Modified files section
    write_details_section "$output_file" "✏️ Modified Files ($modified_count)"
    
    if [[ "$modified_count" -gt 0 ]]; then
        get_files_by_status "$all_files" "M" | awk '{print "- `" $2 "`"}' >> "$output_file"
    else
        echo "No files were modified." >> "$output_file"
    fi
    
    close_details_section "$output_file"
    
    # Deleted files section
    write_details_section "$output_file" "❌ Deleted Files ($deleted_count)"
    
    if [[ "$deleted_count" -gt 0 ]]; then
        get_files_by_status "$all_files" "D" | awk '{print "- `" $2 "`"}' >> "$output_file"
    else
        echo "No files were deleted." >> "$output_file"
    fi
    
    close_details_section "$output_file"
}
