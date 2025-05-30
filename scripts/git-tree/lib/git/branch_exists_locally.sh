#!/bin/bash

# Function to check if branch exists locally (indicating it was fetched from remote)
branch_exists_locally() {
    local branch="$1"
    git show-ref --verify --quiet "refs/heads/$branch" 2>/dev/null
}
