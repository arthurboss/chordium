#!/bin/bash

# Function to render file summary sections
render_file_summary() {
    local base_branch="$1"
    local output_file="$2"
    local all_files="$3"
    
    echo "" >> "$output_file"
    echo "## 📊 File Summary" >> "$output_file"
    echo "" >> "$output_file"
    
    # Count files by status
    local added_count=$(echo "$all_files" | grep "^A" | wc -l | tr -d ' ')
    local modified_count=$(echo "$all_files" | grep "^M" | wc -l | tr -d ' ')
    local deleted_count=$(echo "$all_files" | grep "^D" | wc -l | tr -d ' ')
    
    # Added files section
    echo "<details>" >> "$output_file"
    echo "<summary>" >> "$output_file"
    echo "<strong>✅ Added Files ($added_count)</strong>" >> "$output_file"
    echo "</summary>" >> "$output_file"
    echo "" >> "$output_file"
    
    if [[ "$added_count" -gt 0 ]]; then
        echo "$all_files" | grep "^A" | awk '{print "- `" $2 "`"}' >> "$output_file"
    else
        echo "No files were added." >> "$output_file"
    fi
    
    echo "" >> "$output_file"
    echo "</details>" >> "$output_file"
    echo "" >> "$output_file"
    
    # Modified files section
    echo "<details>" >> "$output_file"
    echo "<summary>" >> "$output_file"
    echo "<strong>✏️ Modified Files ($modified_count)</strong>" >> "$output_file"
    echo "</summary>" >> "$output_file"
    echo "" >> "$output_file"
    
    if [[ "$modified_count" -gt 0 ]]; then
        echo "$all_files" | grep "^M" | awk '{print "- `" $2 "`"}' >> "$output_file"
    else
        echo "No files were modified." >> "$output_file"
    fi
    
    echo "" >> "$output_file"
    echo "</details>" >> "$output_file"
    echo "" >> "$output_file"
    
    # Deleted files section
    echo "<details>" >> "$output_file"
    echo "<summary>" >> "$output_file"
    echo "<strong>❌ Deleted Files ($deleted_count)</strong>" >> "$output_file"
    echo "</summary>" >> "$output_file"
    echo "" >> "$output_file"
    
    if [[ "$deleted_count" -gt 0 ]]; then
        echo "$all_files" | grep "^D" | awk '{print "- `" $2 "`"}' >> "$output_file"
    else
        echo "No files were deleted." >> "$output_file"
    fi
    
    echo "" >> "$output_file"
    echo "</details>" >> "$output_file"
}
