#!/bin/bash

# GitHub Markdown Cleaner Utility
# 
# This utility cleans markdown content specifically for GitHub rendering.
# GitHub automatically injects line breaks in certain contexts, so we need
# to remove manual <br> tags to prevent double line breaks.
#
# Single Responsibility: Clean markdown content for GitHub-specific rendering

# Clean markdown content for GitHub rendering
clean_markdown_for_github() {
    local input_file="$1"
    local output_file="$2"
    
    if [[ ! -f "$input_file" ]]; then
        echo "Error: Input file '$input_file' not found" >&2
        return 1
    fi
    
    # Remove all <br> tags since GitHub automatically handles line breaks
    # Also clean up any potential double spaces that might remain
    sed 's/<br>//g' "$input_file" | sed 's/  / /g' > "$output_file"
    
    return 0
}

# Clean markdown content from stdin for GitHub rendering
clean_markdown_for_github_stdin() {
    # Remove all <br> tags and clean up spacing
    sed 's/<br>//g' | sed 's/  / /g'
}

# Validate that the cleaning was successful
validate_github_markdown() {
    local file="$1"
    
    if [[ ! -f "$file" ]]; then
        echo "Error: File '$file' not found for validation" >&2
        return 1
    fi
    
    # Check if any <br> tags remain (should be none for GitHub)
    local br_count=$(grep -c "<br>" "$file" 2>/dev/null || echo "0")
    
    if [[ "$br_count" -gt 0 ]]; then
        echo "Warning: Found $br_count remaining <br> tags in GitHub markdown" >&2
        return 1
    fi
    
    return 0
}

# Simple test function
test_markdown_cleaner() {
    echo "Testing GitHub markdown cleaner..."
    
    # Test 1: Remove <br> tags
    local test_input="> test line with<br> tag"
    local expected="> test line with tag"
    local result=$(echo "$test_input" | clean_markdown_for_github_stdin)
    
    if [[ "$result" == "$expected" ]]; then
        echo "✅ Test 1 passed: <br> tag removal"
    else
        echo "❌ Test 1 failed: Expected '$expected', got '$result'"
        return 1
    fi
    
    # Test 2: Multiple <br> tags
    local test_input2="line1<br>line2<br>line3"
    local expected2="line1line2line3"
    local result2=$(echo "$test_input2" | clean_markdown_for_github_stdin)
    
    if [[ "$result2" == "$expected2" ]]; then
        echo "✅ Test 2 passed: Multiple <br> tag removal"
    else
        echo "❌ Test 2 failed: Expected '$expected2', got '$result2'"
        return 1
    fi
    
    echo "✅ All tests passed!"
    return 0
}

# If script is run directly with --test, run tests
if [[ "${BASH_SOURCE[0]}" == "${0}" && "$1" == "--test" ]]; then
    test_markdown_cleaner
fi
