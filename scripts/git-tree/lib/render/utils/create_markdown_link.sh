#!/bin/bash

# Single responsibility: Create markdown links using configurable URL provider
# Pure function - no environment detection, URL generation delegated to provider

create_markdown_link() {
    local filepath="$1" 
    local relative_prefix="$2"
    local filename=$(basename "$filepath")
    
    # Use the relative prefix to create local relative URLs
    # This function is now pure and only handles relative paths
    echo "[$filename]($relative_prefix$filepath)"
}
