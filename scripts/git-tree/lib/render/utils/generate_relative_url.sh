#!/bin/bash

# Single responsibility: Generate relative URLs for local git-tree
# Pure function - only relative path logic, no GitHub code

generate_relative_url() {
    local filepath="$1"
    echo "$RELATIVE_PREFIX$filepath"
}
