#!/bin/bash

# Central loader for all shared utility functions
# This file sources all individual function files in the correct order

# Get the directory of this file for relative imports
LIB_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Set the main script directory (parent of lib/)
export GIT_TREE_SCRIPT_DIR="$(dirname "$LIB_DIR")"

# Load git utilities
source "$LIB_DIR/git/detect_base_branch.sh"
source "$LIB_DIR/git/get_current_branch.sh"
source "$LIB_DIR/git/branch_exists.sh"
source "$LIB_DIR/git/branch_exists_locally.sh"

# Load file utilities
source "$LIB_DIR/file/generate_auto_filename.sh"
source "$LIB_DIR/file/ensure_results_directory.sh"
source "$LIB_DIR/file/resolve_output_path.sh"
source "$LIB_DIR/file/ensure_md_extension.sh"
source "$LIB_DIR/file/prompt_and_cleanup_results.sh"

# Load GitHub utilities
source "$LIB_DIR/github/get_github_repo_info.sh"
source "$LIB_DIR/github/format_branch_name.sh"

# Load project utilities
source "$LIB_DIR/project/get_status_icon.sh"
source "$LIB_DIR/project/get_project_name.sh"

# Load argument utilities
source "$LIB_DIR/argument/show_usage.sh"
source "$LIB_DIR/argument/show_standalone_usage.sh"
source "$LIB_DIR/argument/parse_arguments.sh"
source "$LIB_DIR/argument/parse_legacy_arguments.sh"

# Load wizard utilities
source "$LIB_DIR/wizard/ui/colors.sh"
source "$LIB_DIR/wizard/ui/header.sh"
source "$LIB_DIR/wizard/ui/summary.sh"
source "$LIB_DIR/wizard/prompts/base_branch.sh"
source "$LIB_DIR/wizard/prompts/target_branch.sh"
source "$LIB_DIR/wizard/prompts/output_filename.sh"
source "$LIB_DIR/wizard/prompts/cleanup.sh"
source "$LIB_DIR/wizard/utils/wizard_utils.sh"
source "$LIB_DIR/wizard/interactive_wizard.sh"

# Load core URL utilities (single responsibility)
source "$LIB_DIR/url/get_repo_url.sh"
source "$LIB_DIR/url/generate_github_blob_url.sh"
source "$LIB_DIR/url/generate_git_relative_url.sh"

# Load render URL generators (compose core utilities)
source "$LIB_DIR/render/url/git_url_generator.sh"
source "$LIB_DIR/render/url/github_url_generator.sh"

# Load render utilities
source "$LIB_DIR/render/utils/output_writer.sh"
source "$LIB_DIR/render/utils/file_processor.sh"
source "$LIB_DIR/render/utils/path_calculator.sh"
source "$LIB_DIR/render/utils/render_header.sh"
source "$LIB_DIR/render/utils/render_root_files.sh"
source "$LIB_DIR/render/utils/render_folder_section.sh"
source "$LIB_DIR/render/utils/create_markdown_link.sh"
source "$LIB_DIR/render/utils/tree_builder.sh"
source "$LIB_DIR/render/render_file_tree.sh"
source "$LIB_DIR/render/render_file_summary.sh"
