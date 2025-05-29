#!/bin/bash

# Single responsibility: Logging utilities for GitHub Actions
# Provides consistent colored logging functions

# Color codes for logging (use existing values if already set)
CYAN="${CYAN:-\033[0;36m}"
GREEN="${GREEN:-\033[0;32m}"
YELLOW="${YELLOW:-\033[1;33m}"
RED="${RED:-\033[0;31m}"
NC="${NC:-\033[0m}" # No Color

# Logging functions
log_info() {
    echo -e "${CYAN}ℹ️  $1${NC}" >&2
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}" >&2
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}" >&2
}

log_error() {
    echo -e "${RED}❌ $1${NC}" >&2
}
