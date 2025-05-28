#!/bin/bash

# Function to show usage information for main script
show_usage() {
    echo "Git File Tree Generator - Generate markdown file trees for git changes"
    echo ""
    echo "USAGE:"
    echo "  $0 [--base BASE_BRANCH] [--target TARGET_BRANCH] [--output OUTPUT_FILE]"
    echo "  $0 [base_branch] [target_branch] [output_file]  # Legacy format"
    echo ""
    echo "FLAGS:"
    echo "  --base BRANCH     Base branch to compare against (auto-detected if not specified)"
    echo "  --target BRANCH   Target branch to compare (defaults to current branch)"
    echo "  --output FILE     Output markdown file (auto-generated if not specified)"
    echo "  --help, -h        Show this help message"
    echo ""
    echo "EXAMPLES:"
    echo "  $0                                    # Auto-detect everything"
    echo "  $0 --base main                       # Compare current branch vs main"
    echo "  $0 --base main --target feat/search  # Compare specific branches"
    echo "  $0 --output my-tree.md               # Custom output filename"
    echo "  $0 main feat/search                  # Legacy: compare main vs feat/search"
    echo "  $0 main compare.md                   # Legacy: compare current vs main, output to file"
    echo ""
    echo "AUTO-GENERATED FILENAME FORMAT:"
    echo "  file-tree_<target>-vs-<base>_YYYY-MM-DD_HH-MM-SS.md"
    echo ""
}
