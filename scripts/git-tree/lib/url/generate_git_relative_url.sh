#!/bin/bash

# Single responsibility: Generate git-compatible relative URLs
# Pure function that creates relative paths for local file system navigation

generate_git_relative_url() {
    local relative_prefix="$1"
    local filepath="$2"
    
    echo "$relative_prefix$filepath"
}
