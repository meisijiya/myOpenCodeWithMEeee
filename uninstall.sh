#!/usr/bin/env bash
# uninstall.sh — Remove myOpenCodeWithMEeee files from ~/.config/opencode/
#
# Removes only files this project installed. Does not touch:
# - opencode.json or any config
# - oh-my-openagent.json or any other plugin config
# - Existing opencode plugins (rtk.ts, etc.)
# - Existing AGENTS.md
# - Existing tools that we did not create (e.g., the user may have their own)
#
# Idempotent: safe to run multiple times.

set -euo pipefail

TARGET_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/opencode"

echo "Uninstalling myOpenCodeWithMEeee from ${TARGET_DIR}"
echo ""

# Helper: rm -f a file under TARGET_DIR, tolerating missing files
rm_target() {
  local f="${TARGET_DIR}/$1"
  if [[ -f "${f}" ]] || [[ -L "${f}" ]]; then
    rm -v "${f}"
  fi
}

# Helper: rm -rf a dir under TARGET_DIR, tolerating missing dirs
rm_target_dir() {
  local d="${TARGET_DIR}/$1"
  if [[ -d "${d}" ]]; then
    rm -rfv "${d}"
  fi
}

# Our specific agents
rm_target "agents/sisyphus.md"
rm_target "agents/oracle.md"

# Our specific skills
rm_target_dir "skills/karpathy-guidelines"
rm_target_dir "skills/ultrawork"
rm_target_dir "skills/git-master"
rm_target_dir "skills/openspec-integration"

# Our specific tools (only those we created)
rm_target "tools/hashline-edit.js"
rm_target "tools/task-dispatch.js"
rm_target "tools/ast-search.js"
rm_target "tools/web-search.js"
rm_target "tools/image-inspect.js"
rm_target "tools/mermaid-render.js"
rm_target "tools/pr-reader.js"
rm_target "tools/atomic-commit.js"
rm_target "tools/context7-docs.js"
rm_target "tools/playwright-browser.js"

# Our specific plugin
rm_target "plugins/orchestrator.js"

echo ""
echo "✓ Uninstall complete. Restart opencode to apply changes."
echo "Note: opencode.json was NOT modified. Add/remove the plugin entry manually if needed."
