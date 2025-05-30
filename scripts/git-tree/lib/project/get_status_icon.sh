#!/bin/bash

# Function to get status icon
get_status_icon() {
    case "$1" in
        "A") echo "✅" ;;
        "M") echo "✏️" ;;
        "D") echo "❌" ;;
        *) echo "📄" ;;
    esac
}
