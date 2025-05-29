# Git Tree Script

A powerful script for generating markdown file trees showing git changes between branches, featuring an interactive wizard and smart flags for effortless usage:

**example output:**

---
---

## 🔄 File Tree of Changed Files

**`main`** &#8592; **`feat/user-auth`**

> <details open>
> <summary>
> <strong>🏠 my-project</strong>
> </summary>
>
> &emsp;&#9493;✏️ [package.json](../../../package.json)
> <details>
> <summary>
> &#9492;<strong>🗂️ src</strong>
> </summary>
>
> &emsp;&emsp;&#9501;✅ [LoginForm.tsx](../../../src/components/LoginForm.tsx)<br>
> &emsp;&emsp;&#9501;❌ [AuthProvider.tsx](../../../src/components/AuthProvider.tsx)<br>
> &emsp;&emsp;&#9493;✏️ [App.tsx](../../../src/App.tsx)
> </details>
> </details>
 
## 📊 File Summary (4 total files changed)
<details>
<summary>
<strong>✅ Added Files (1)</strong>
</summary>

- `LoginForm.tsx`

</details>

<details>
<summary>
<strong>✏️ Modified Files (1)</strong>
</summary>

- `package.json`
</details>

<details>
<summary>
<strong>❌ Deleted Files (1)</strong>
</summary>

- `AuthProvider.tsx`

</details>

---
---

## What It Does

Generates visual file tree representations of git changes between branches, perfect for:
- PR comments and documentation
- Code review preparation
- Change summaries and project documentation

## Script Overview

- **index.sh** - Main script with interactive wizard, smart flags, and intelligent branch auto-detection

## Usage Modes

### 🧙‍♂️ Interactive Wizard (Recommended)
Simply run without arguments to start the guided wizard:

```bash
# Interactive wizard - guides you through all options
./scripts/git-tree/index.sh
```

### ⚡ Auto Mode (Fastest)
Use all defaults with no prompts:

```bash
# Auto mode - all defaults, no prompts, no cleanup
./scripts/git-tree/index.sh --a
```

### 🎯 Smart Flags
Use branch names directly as flags:

```bash
# Smart flags - intuitive branch comparisons
./scripts/git-tree/index.sh --main              # Compare current vs main
./scripts/git-tree/index.sh --feat--search      # Compare current vs feat--search

# Dual smart flags - specify both branches
./scripts/git-tree/index.sh --main --feat-search    # Compare feat-search vs main

# Cleanup control flags
./scripts/git-tree/index.sh --y --main          # Auto-cleanup + compare vs main
./scripts/git-tree/index.sh --n --main          # Skip cleanup + compare vs main
```

### 🔧 Explicit Flags
Traditional flag-based approach:

```bash
# Explicit flags for full control
./scripts/git-tree/index.sh --base main --target feat/search
./scripts/git-tree/index.sh --target current --base main
./scripts/git-tree/index.sh --output my-comparison.md

# Combined approaches
./scripts/git-tree/index.sh --main --output comparison.md
./scripts/git-tree/index.sh --y --base main --target feat/search
```

## All Available Flags

### Core Flags
- `--wizard` - Force interactive wizard mode
- `--base BRANCH` - Base branch to compare against (auto-detected if not specified)
- `--target BRANCH` - Target branch to compare (defaults to current branch)
- `--output FILE` - Output markdown file (auto-generated if not specified)

### Smart Flags
- `--a` - Auto mode: use all defaults, skip all prompts
- `--y` - Auto-confirm cleanup of previous results (yes)
- `--n` - Auto-decline cleanup of previous results (no)
- `--BRANCH_NAME` - Use any branch name as a smart flag (e.g., `--main`, `--feat-search`)

### Special Keywords
- `current` - Use current branch (for `--base` or `--target`)

## Output

### File Location
All generated files are automatically saved to the `results/` directory within the git-tree folder:
```
scripts/git-tree/results/git-tree_<target>-vs-<base>_YYYY-MM-DD_HH-MM-SS.md
```

Example: 

`scripts/git-tree/results/git-tree_feat--search-vs-main_2025-05-28_14-30-25.md`

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

### 🧙‍♂️ Interactive Experience
- ✅ **Interactive wizard** - Guided step-by-step setup when no arguments provided
- ✅ **Smart defaults** - Intelligent auto-detection of branches and settings
- ✅ **Cleanup management** - Wizard handles previous results cleanup with user choice

### ⚡ Smart Flags & Auto Mode
- ✅ **Auto mode (`--a`)** - Run with all defaults, skip all prompts
- ✅ **Smart flag parsing** - Use any branch name as a flag (e.g., `--main`, `--feat-search`)
- ✅ **Dual smart flags** - Specify both branches with `--main --feat-search` syntax
- ✅ **Cleanup flags** - `--y` (auto-cleanup) and `--n` (skip cleanup) for automation

### 🎯 Core Functionality
- ✅ **Smart base branch detection** - Analyzes merge history to find the right comparison branch
- ✅ **Network-free operation** - No risky git checkout operations that could hang
- ✅ **Modern flag interface** - Clean `--base`, `--target`, `--output` flags
- ✅ **"Current" keyword** - Use `current` for explicit current branch reference
- ✅ **Legacy compatibility** - Supports old positional argument format

### 📁 Output & Organization
- ✅ **Auto .md extension** - Automatically adds .md when missing
- ✅ **Timestamp filenames** - Consistent YYYY-MM-DD_HH-MM-SS format
- ✅ **Results directory** - Organized output to `git-tree/results/` folder
- ✅ **GitHub integration** - Dynamic branch links when repository detected
- ✅ **Quoted output format** - File tree rendered as blockquotes for clean documentation
- ✅ **Professional styling** - Beautiful Unicode trees with status icons

## Advanced Usage Examples

### Wizard Mode Features
```bash
# Start interactive wizard
./scripts/git-tree/index.sh
# or explicitly
./scripts/git-tree/index.sh --wizard

# The wizard guides you through:
# 1. Base branch selection (with auto-detection)
# 2. Target branch selection (defaults to current)
# 3. Output filename (with auto-generation option)
# 4. Cleanup previous results (yes/no choice)
```

### Smart Flag Combinations
```bash
# Single smart flag (base branch)
./scripts/git-tree/index.sh --main
./scripts/git-tree/index.sh --feat--search
./scripts/git-tree/index.sh --feature/user-login

# Dual smart flags (base and target)
./scripts/git-tree/index.sh --main --feat-search        # feat-search vs main
./scripts/git-tree/index.sh --develop --feature/login   # feature/login vs develop

# Smart flags with cleanup control
./scripts/git-tree/index.sh --y --main                  # Auto-cleanup + main comparison
./scripts/git-tree/index.sh --n --feat-search           # Skip cleanup + feat-search comparison

# Smart flags with output control
./scripts/git-tree/index.sh --main --output my-tree.md
./scripts/git-tree/index.sh --y --main --output comparison
```

### Automation Scenarios
```bash
# Full automation (CI/CD friendly)
./scripts/git-tree/index.sh --a                         # All defaults, no prompts

# Automated cleanup with specific branches
./scripts/git-tree/index.sh --y --base main --target develop

# Quick comparison without cleanup prompts
./scripts/git-tree/index.sh --n --main
```

### Special Keywords & Flag Priority
```bash
# "current" keyword for explicit current branch reference
./scripts/git-tree/index.sh --target current --base main
./scripts/git-tree/index.sh --base current --target main

# Flag priority (when multiple ways specify same value):
# 1. Explicit flags (--base, --target, --output) - highest priority
# 2. Smart flags (--branch-name) - if explicit not already specified
# 3. Positional arguments - fill remaining values in order
# 4. Auto-detection - for any remaining unspecified values
```

## GitHub Actions Integration

The git-tree script is seamlessly integrated with GitHub Actions to automatically generate PR comments with file trees.

### How It Works
- **Automatic Triggers** - Runs on PR open, synchronize, and reopen events
- **Smart Branch Detection** - Uses `GITHUB_HEAD_REF` and `GITHUB_BASE_REF` from the PR context
- **Comment Management** - Updates existing comments with new changes using sticky comments
- **Clean Output** - Generates professional file trees ready for PR comments

### Integration Files
- `.github/workflows/git-tree-pr-comment.yml` - Main GitHub Action workflow
- `.github/scripts/git-tree-pr-adapter.sh` - Adapter script that bridges GitHub Actions with git-tree

### Usage in PRs
When you create or update a pull request, the action automatically:
1. Detects changes between base and head branches
2. Generates a file tree using the git-tree script
3. Formats the output for GitHub comments
4. Posts or updates the PR comment with the file tree

### Manual Testing
To test the GitHub Action integration locally:
```bash
# Set up test environment variables
export GITHUB_REPOSITORY="owner/repo"
export PR_NUMBER="123"
export GITHUB_TOKEN="your-token"
export GITHUB_HEAD_REF="your-branch"
export GITHUB_BASE_REF="main"

# Run the adapter script
./.github/scripts/git-tree-pr-adapter.sh
```

## Quick Reference

### Most Common Usage Patterns
```bash
# 🧙‍♂️ Interactive (recommended for first-time users)
./scripts/git-tree/index.sh

# ⚡ Auto mode (fastest for regular use)
./scripts/git-tree/index.sh --a

# 🎯 Quick comparisons
./scripts/git-tree/index.sh --main              # Compare current vs main
./scripts/git-tree/index.sh --main --feat-xyz   # Compare feat-xyz vs main

# 🛠️ With cleanup control (automation-friendly)
./scripts/git-tree/index.sh --y --main          # Auto-cleanup + comparison
./scripts/git-tree/index.sh --n --main          # Skip cleanup + comparison
```

### Getting Help
```bash
./scripts/git-tree/index.sh --help              # Show detailed usage information
```
