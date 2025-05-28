# Git Tree Scripts

A collection of scripts for generating markdown file trees showing git changes between branches.

## What It Does

Generates visual file tree representations of git changes between branches, perfect for:
- PR comments and documentation
- Code review preparation
- Change summaries and project documentation

## Scripts Overview

- **git-tree.sh** - Main script with modern flag support and intelligent branch auto-detection
- **git-tree-render.sh** - Shared rendering functions with GitHub branch links and Unicode formatting
- **git-tree-standalone.sh** - Self-contained version requiring no external dependencies

## Quick Start

```bash
# Auto-detect everything (current branch vs detected base)
./scripts/git-tree/git-tree.sh

# Compare specific branches with modern flags
./scripts/git-tree/git-tree.sh --base main --target feat/search

# Custom output file (auto-adds .md extension)
./scripts/git-tree/git-tree.sh --output my-comparison

# Legacy positional arguments (backward compatible)
./scripts/git-tree/git-tree.sh main my-output

# Standalone version (simple usage)
./scripts/git-tree/git-tree-standalone.sh main output
```

## Output

Generates markdown files with standardized names:
```
file-tree_<target>-vs-<base>_YYYY-MM-DD_HH-MM-SS.md
```

Example: file-tree_feat--search-vs-main_2025-05-28_14-30-25.md

Contains:
- Visual file tree with thick Unicode characters (├── └── │)
- GitHub branch links for easy navigation
- Status icons (✅ Added, ✏️ Modified, ❌ Deleted)
- Collapsible sections for better organization
- Only files that actually changed between branches
- Clean, professional markdown format

## How It Works

1. **Detects changes** using git diff --name-status between branches
2. **Auto-detects base branch** using intelligent merge history analysis
3. **Builds tree structure** from changed file paths with proper nesting
4. **Renders with Unicode** tree characters and status icons
5. **Adds GitHub links** for branch navigation (when repo detected)
6. **Outputs clean markdown** ready for documentation or PR comments

## Features

- ✅ **Smart base branch detection** - Analyzes merge history to find the right comparison branch
- ✅ **Network-free operation** - No risky git checkout operations that could hang
- ✅ **Modern flag interface** - Clean --base, --target, --output flags
- ✅ **Legacy compatibility** - Supports old positional argument format
- ✅ **Auto .md extension** - Automatically adds .md when missing
- ✅ **Timestamp filenames** - Consistent YYYY-MM-DD_HH-MM-SS format
- ✅ **GitHub integration** - Dynamic branch links when repository detected
- ✅ **Professional output** - Beautiful Unicode trees with status icons
