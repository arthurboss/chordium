#!/bin/bash

# Function to show usage information for standalone script
show_standalone_usage() {
    echo "Git File Tree Generator (Standalone) - Generate markdown file trees for git changes"
    echo ""
    echo "USAGE:"
    echo "  $0 [base_branch] [output_file]"
    echo ""
    echo "ARGUMENTS:"
    echo "  base_branch   Base branch to compare against (auto-detected if not specified)"
    echo "  output_file   Output markdown file (auto-generated if not specified)"
    echo ""
    echo "EXAMPLES:"
    echo "  $0                    # Auto-detect base branch and generate filename"
    echo "  $0 main               # Compare current branch vs main"
    echo "  $0 main compare.md    # Compare current vs main, output to file"
    echo ""
    echo "AUTO-GENERATED FILENAME FORMAT:"
    echo "  git-tree_<current>-vs-<base>_YYYY-MM-DD_HH-MM-SS.md"
    echo ""
}
