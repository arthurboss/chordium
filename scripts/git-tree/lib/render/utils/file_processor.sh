#!/bin/bash

# Utility functions for processing git diff file lists
# Provides consistent file filtering and counting

# Count files by status
count_files_by_status() {
    local all_files="$1"
    local status="$2"
    
    echo "$all_files" | grep "^$status" | wc -l | tr -d ' '
}

# Get files by status
get_files_by_status() {
    local all_files="$1"
    local status="$2"
    
    echo "$all_files" | grep "^$status"
}

# Extract filepath from git diff line
extract_filepath() {
    local file_line="$1"
    echo "$file_line" | awk '{print $2}'
}

# Extract status from git diff line
extract_status() {
    local file_line="$1"
    echo "$file_line" | awk '{print $1}'
}

# Get root files (files in project root directory)
get_root_files() {
    local all_files="$1"
    echo "$all_files" | grep "^[AMD][[:space:]]*[^/]*$"
}

# Get all folders that contain changed files
get_changed_folders() {
    local all_files="$1"
    echo "$all_files" | grep -v "^[AMD][[:space:]]*[^/]*$" | sed 's|^[AMD][[:space:]]*\([^/]*\)/.*|\1|' | sort -u
}

# Get files for a specific folder
get_folder_files() {
    local all_files="$1"
    local folder="$2"
    echo "$all_files" | sort -k2 | grep "^[AMD][[:space:]]*$folder/"
}
