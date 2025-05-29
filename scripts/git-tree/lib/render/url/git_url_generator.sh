#!/bin/bash

# Single responsibility: Generate git-compatible relative URLs
# Creates relative markdown links for local file system navigation

generate_git_url() {
    local filepath="$1"
    local relative_prefix="$2"
    
    echo "$relative_prefix$filepath"
}
