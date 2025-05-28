#!/bin/bash

# Single responsibility: Create markdown file links
# Pure function - no GitHub logic, takes URL provider as parameter

create_file_link() {
    local filepath="$1"
    local url_provider_function="$2"  # Function name to call for URL generation
    local filename=$(basename "$filepath")
    
    # Call the provided URL provider function
    local url=$($url_provider_function "$filepath")
    echo "[$filename]($url)"
}
