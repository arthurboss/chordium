#!/bin/bash

# Utility functions for writing to output files
# Provides consistent patterns for markdown generation

# Write a details section with optional content
write_details_section() {
    local output_file="$1"
    local title="$2"
    local content="$3"
    local is_open="${4:-false}"
    
    local open_attr=""
    [[ "$is_open" == "true" ]] && open_attr=" open"
    
    echo "<details$open_attr>" >> "$output_file"
    echo "<summary>" >> "$output_file"
    echo "<strong>$title</strong>" >> "$output_file"
    echo "</summary>" >> "$output_file"
    echo "" >> "$output_file"
    
    if [[ -n "$content" ]]; then
        echo "$content" >> "$output_file"
    fi
}

# Close a details section
close_details_section() {
    local output_file="$1"
    echo "" >> "$output_file"
    echo "</details>" >> "$output_file"
}

# Write a blockquote details section (for file tree structure)
write_blockquote_details() {
    local output_file="$1"
    local title="$2"
    local is_open="${3:-false}"
    
    local open_attr=""
    [[ "$is_open" == "true" ]] && open_attr=" open"
    
    echo "> <details$open_attr>" >> "$output_file"
    echo "> <summary>" >> "$output_file"
    echo "> <strong>$title</strong>" >> "$output_file"
    echo "> </summary>" >> "$output_file"
    echo ">" >> "$output_file"
}

# Close a blockquote details section
close_blockquote_details() {
    local output_file="$1"
    echo "> </details>" >> "$output_file"
    echo ">" >> "$output_file"
}

# Write empty line(s)
write_empty_lines() {
    local output_file="$1"
    local count="${2:-1}"
    
    for ((i=1; i<=count; i++)); do
        echo "" >> "$output_file"
    done
}
