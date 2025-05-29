#!/bin/bash

# Single responsibility: Store and retrieve GitHub blob URLs for files
# Maintains a mapping between file paths and their GitHub blob URLs using a temp file

# Temporary file to store file path -> blob URL mappings
BLOB_URL_STORE_FILE="/tmp/github_blob_urls_$$"

# Store a blob URL for a file path
store_blob_url() {
    local filepath="$1"
    local blob_url="$2"
    
    # Create store file if it doesn't exist
    touch "$BLOB_URL_STORE_FILE"
    
    # Remove any existing entry for this filepath
    if [[ -f "$BLOB_URL_STORE_FILE" ]]; then
        grep -v "^$filepath|" "$BLOB_URL_STORE_FILE" > "${BLOB_URL_STORE_FILE}.tmp" 2>/dev/null || true
        mv "${BLOB_URL_STORE_FILE}.tmp" "$BLOB_URL_STORE_FILE" 2>/dev/null || true
    fi
    
    # Add new entry
    echo "$filepath|$blob_url" >> "$BLOB_URL_STORE_FILE"
}

# Retrieve a blob URL for a file path
get_blob_url() {
    local filepath="$1"
    
    if [[ -f "$BLOB_URL_STORE_FILE" ]]; then
        grep "^$filepath|" "$BLOB_URL_STORE_FILE" | cut -d'|' -f2- | head -n1
    fi
}

# Clear all stored blob URLs
clear_blob_urls() {
    rm -f "$BLOB_URL_STORE_FILE" 2>/dev/null || true
}
