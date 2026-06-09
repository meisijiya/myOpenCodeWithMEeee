#!/usr/bin/env bash
# uninstall.sh — Remove myOpenCodeWithMEeee files from ~/.config/opencode/
#
# Removes only files this project installed. Does not touch:
# - opencode.json or any config
# - oh-my-openagent.json or any other plugin config
# - Existing opencode plugins (rtk.ts, etc.)
# - Existing AGENTS.md

set -euo pipefail

TARGET_DIR="${HOME}/.config/opencode"

echo "Uninstalling myOpenCodeWithMEeee from ${TARGET_DIR}"
echo ""

# Our specific agents
rm -fv "${TARGET_DIR}/agents/sisyphus.md"
rm -fv "${TARGET_DIR}/agents/oracle.md"

# Our specific skills
rm -rfv "${TARGET_DIR}/skills/karpathy-guidelines"
rm -rfv "${TARGET_DIR}/skills/ultrawork"
rm -rfv "${TARGET_DIR}/skills/git-master"
rm -rfv "${TARGET_DIR}/skills/openspec-integration"

# Our specific tools (only those we created)
rm -fv "${TARGET_DIR}/tools/hashline-edit.js"
rm -fv "${TARGET_DIR}/tools/task-dispatch.js"
rm -fv "${TARGET_DIR}/tools/ast-search.js"
rm -fv "${TARGET_DIR}/tools/web-search.js"
rm -fv "${TARGET_DIR}/tools/image-inspect.js"
rm -fv "${TARGET_DIR}/tools/mermaid-render.js"
rm -fv "${TARGET_DIR}/tools/pr-reader.js"
rm -fv "${TARGET_DIR}/tools/atomic-commit.js"
rm -fv "${TARGET_DIR}/tools/context7-docs.js"
rm -fv "${TARGET_DIR}/tools/playwright-browser.js"

# Our specific plugin
rm -fv "${TARGET_DIR}/plugins/orchestrator.js"

echo ""
echo "✓ Uninstall complete. Restart opencode to apply changes."
echo "Note: opencode.json was NOT modified. Add/remove the plugin entry manually if needed."
