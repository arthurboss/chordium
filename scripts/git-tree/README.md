# Git Tree Script

A script for generating markdown file trees showing git changes between branches.

## What It Does

Generates visual file tree representations of git changes between branches, perfect for:
- PR comments and documentation
- Code review preparation
- Change summaries and project documentation

## Script Overview

- **index.sh** - Main script with modern flag support and intelligent branch auto-detection

## Quick Start

```bash
# Auto-detect everything (current branch vs detected base)
./scripts/git-tree/index.sh

# Compare specific branches with modern flags
./scripts/git-tree/index.sh --base main --target feat/search

# Smart flags - use any branch name as a flag
./scripts/git-tree/index.sh --main              # Compare current vs main
./scripts/git-tree/index.sh --feat--search      # Compare current vs feat--search

# Use "current" keyword for explicit current branch
./scripts/git-tree/index.sh --target current --base main

# Custom output file (auto-adds .md extension)
./scripts/git-tree/index.sh --output my-comparison

# Mixed usage - smart flag with custom output
./scripts/git-tree/index.sh --main --output comparison.md

# Legacy positional arguments (backward compatible)
./scripts/git-tree/index.sh main my-output
```

## Output

### File Location
All generated files are automatically saved to the `results/` directory within the git-tree folder:
```
scripts/git-tree/results/git-tree_<target>-vs-<base>_YYYY-MM-DD_HH-MM-SS.md
```

Example: `scripts/git-tree/results/git-tree_feat--search-vs-main_2025-05-28_14-30-25.md`

### File Content
Contains:
- **Quoted file tree** - Every line of the tree structure is formatted as a blockquote for clean documentation
- **GitHub branch links** - Direct links to branches when repository detected
- **Status icons** - ✅ Added, ✏️ Modified, ❌ Deleted files clearly marked
- **Collapsible sections** - Organized folder structure for better readability
- **Smart filtering** - Only files that actually changed between branches
- **Professional format** - Clean markdown ready for PR comments and documentation

## How It Works

1. **Detects changes** using git diff --name-status between branches
2. **Auto-detects base branch** using intelligent merge history analysis
3. **Builds tree structure** from changed file paths with proper nesting
4. **Renders with Unicode** tree characters and status icons
5. **Formats as quotes** - Every line of the file tree is prefixed with "> " for clean blockquote formatting
6. **Adds GitHub links** for branch navigation (when repo detected)
7. **Outputs clean markdown** ready for documentation or PR comments

## Features

- ✅ **Smart base branch detection** - Analyzes merge history to find the right comparison branch
- ✅ **Network-free operation** - No risky git checkout operations that could hang
- ✅ **Modern flag interface** - Clean --base, --target, --output flags
- ✅ **Smart flag parsing** - Use any branch name as a flag (e.g., `--main`, `--feat--search`)
- ✅ **"Current" keyword** - Use `current` for explicit current branch reference
- ✅ **Legacy compatibility** - Supports old positional argument format
- ✅ **Auto .md extension** - Automatically adds .md when missing
- ✅ **Timestamp filenames** - Consistent YYYY-MM-DD_HH-MM-SS format
- ✅ **Results directory** - Organized output to `git-tree/results/` folder
- ✅ **GitHub integration** - Dynamic branch links when repository detected
- ✅ **Quoted output format** - File tree rendered as blockquotes for clean documentation
- ✅ **Professional styling** - Beautiful Unicode trees with status icons

## Advanced Usage

### Smart Flags
Use any branch name as a flag for intuitive comparisons:

```bash
# These are equivalent:
./scripts/git-tree/index.sh --base main
./scripts/git-tree/index.sh --main

# Works with complex branch names:
./scripts/git-tree/index.sh --feat--search
./scripts/git-tree/index.sh --feature/user-login

# Combined with other flags:
./scripts/git-tree/index.sh --main --output comparison.md
./scripts/git-tree/index.sh --feat--search --target develop
```

### "Current" Keyword
Use `current` to explicitly reference the current branch:

```bash
# Compare current branch against main
./scripts/git-tree/index.sh --target current --base main

# Use current as base (reverse comparison)
./scripts/git-tree/index.sh --base current --target main

# Both branches can use current (though this would show no changes)
./scripts/git-tree/index.sh --base current --target current
```

### Flag Priority
When multiple ways to specify the same value are used:
1. Explicit flags (`--base`, `--target`, `--output`) take highest priority
2. Smart flags (`--branch-name`) set the base branch if not already specified
3. Positional arguments fill in missing values in order
4. Auto-detection happens for any remaining unspecified values
