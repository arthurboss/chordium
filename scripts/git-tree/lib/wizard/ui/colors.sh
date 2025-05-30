#!/bin/bash

# Color definitions for wizard UI
# Single responsibility: Define color constants for consistent theming

# Only define colors if not already defined (avoid readonly variable warnings)
if [[ -z "${WIZARD_COLORS_LOADED:-}" ]]; then
    export WIZARD_COLORS_LOADED=1
    
    # Colors for better UX
    export CYAN='\033[0;36m'
    export MAGENTA='\033[0;35m'
    export GREEN='\033[0;32m'
    export YELLOW='\033[1;33m'
    export NC='\033[0m' # No Color
fi
