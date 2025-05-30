#!/bin/bash

# Single responsibility: Create markdown links from provided URLs
# Pure function that only formats markdown links without URL generation

create_markdown_link() {
    local filepath="$1" 
    local url="$2"
    local filename=$(basename "$filepath")
    
    echo "[$filename]($url)"
}
