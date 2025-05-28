#!/bin/bash
# Utility: Prompt user to clean up results directory and perform cleanup if confirmed
# Usage: prompt_and_cleanup_results

prompt_and_cleanup_results() {
    local results_dir="$GIT_TREE_SCRIPT_DIR/results"
    if [ ! -d "$results_dir" ]; then
        # No results directory, nothing to clean
        return
    fi
    echo -e "\033[0;36mDo you want to clean up previous results in the results/ folder? (y/n)\033[0m"
    read -r -p "[y/n]: " response
    echo
    case "$response" in
        [yY][eE][sS]|[yY])
            rm -rf "$results_dir"/*
            echo -e "\033[0;35mCleaned up previous results in results/\033[0m"
            echo
            ;;
        *)
            echo -e "\033[0;36mKeeping previous results in results/\033[0m"
            echo
            ;;
    esac
}
