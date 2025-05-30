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
    
    # Count files by status
    local added_count=$(count_files_by_status "$all_files" "A")
    local modified_count=$(count_files_by_status "$all_files" "M")
    local deleted_count=$(count_files_by_status "$all_files" "D")
    
    # Calculate total changed files
    local total_changed=$((added_count + modified_count + deleted_count))
    
    write_empty_lines "$output_file"
    echo "## 📊 File Summary ($total_changed total files changed)" >> "$output_file"
    write_empty_lines "$output_file"
    
    # Added files section
    write_details_section "$output_file" "✅ Added Files ($added_count)"
    if [[ "$added_count" -gt 0 ]]; then
        echo "<ul>" >> "$output_file"
        get_files_by_status "$all_files" "A" | awk '
        {
            path=$2;
            n=split(path, parts, "/");
            fname=parts[n];
            dir="";
            for(i=1;i<n;i++){dir=dir parts[i] "/"}
            group=dir;
            files_by_group[group]=files_by_group[group] "<li>" dir "<strong>" fname "</strong></li>\n";
            group_order[group]=1;
        }
        END {
            first=1;
            for(g in group_order) {
                if (!first) printf("<br>\n");
                first=0;
                printf("%s", files_by_group[g]);
            }
        }' >> "$output_file"
        echo "</ul>" >> "$output_file"
    else
        echo "No files were added." >> "$output_file"
    fi
    close_details_section "$output_file"
    echo "" >> "$output_file"  # Add extra blank line after section
    
    # Modified files section
    write_details_section "$output_file" "✏️ Modified Files ($modified_count)"
    if [[ "$modified_count" -gt 0 ]]; then
        echo "<ul>" >> "$output_file"
        get_files_by_status "$all_files" "M" | awk '
        {
            path=$2;
            n=split(path, parts, "/");
            fname=parts[n];
            dir="";
            for(i=1;i<n;i++){dir=dir parts[i] "/"}
            group=dir;
            files_by_group[group]=files_by_group[group] "<li>" dir "<strong>" fname "</strong></li>\n";
            group_order[group]=1;
        }
        END {
            first=1;
            for(g in group_order) {
                if (!first) printf("<br>\n");
                first=0;
                printf("%s", files_by_group[g]);
            }
        }' >> "$output_file"
        echo "</ul>" >> "$output_file"
    else
        echo "No files were modified." >> "$output_file"
    fi
    close_details_section "$output_file"
    echo "" >> "$output_file"  # Add extra blank line after section
    
    # Deleted files section
    write_details_section "$output_file" "❌ Deleted Files ($deleted_count)"
    if [[ "$deleted_count" -gt 0 ]]; then
        echo "<ul>" >> "$output_file"
        get_files_by_status "$all_files" "D" | awk '
        {
            path=$2;
            n=split(path, parts, "/");
            fname=parts[n];
            dir="";
            for(i=1;i<n;i++){dir=dir parts[i] "/"}
            group=dir;
            files_by_group[group]=files_by_group[group] "<li>" dir "<strong>" fname "</strong></li>\n";
            group_order[group]=1;
        }
        END {
            first=1;
            for(g in group_order) {
                if (!first) printf("<br>\n");
                first=0;
                printf("%s", files_by_group[g]);
            }
        }' >> "$output_file"
        echo "</ul>" >> "$output_file"
    else
        echo "No files were deleted." >> "$output_file"
    fi
    close_details_section "$output_file"
    echo "" >> "$output_file"  # Add extra blank line after section
}
