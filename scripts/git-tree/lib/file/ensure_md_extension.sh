#!/bin/bash

# Function to add .md extension if missing
ensure_md_extension() {
    local filename="$1"
    if [[ "$filename" != *.md ]]; then
        echo "${filename}.md"
    else
        echo "$filename"
    fi
}
