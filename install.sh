#!/usr/bin/env bash
# install.sh — Mirror myOpenCodeWithMEeee files to ~/.config/opencode/
#
# This script copies (not symlinks) so that:
# 1. The repo is self-contained
# 2. Modifications to ~/.config/opencode/ don't accidentally pollute the repo
# 3. Re-running the script is idempotent
#
# Use uninstall.sh to remove the installed files.

set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET_DIR="${HOME}/.config/opencode"

echo "Installing myOpenCodeWithMEeee → ${TARGET_DIR}"
echo ""

# Sanity check
if [[ ! -d "${REPO_DIR}/agents" ]]; then
  echo "ERROR: ${REPO_DIR}/agents not found. Run this script from the repo root." >&2
  exit 1
fi

# Create target dirs
mkdir -p "${TARGET_DIR}/agents"
mkdir -p "${TARGET_DIR}/tools"
mkdir -p "${TARGET_DIR}/plugins"
mkdir -p "${TARGET_DIR}/skills/karpathy-guidelines"
mkdir -p "${TARGET_DIR}/skills/ultrawork"
mkdir -p "${TARGET_DIR}/skills/git-master"
mkdir -p "${TARGET_DIR}/skills/openspec-integration"

# Mirror agents
if [[ -d "${REPO_DIR}/agents" ]]; then
  cp -v "${REPO_DIR}/agents/"*.md "${TARGET_DIR}/agents/" 2>/dev/null || echo "  (no agent .md files yet)"
fi

# Mirror skills
for skill in karpathy-guidelines ultrawork git-master openspec-integration; do
  if [[ -d "${REPO_DIR}/skills/${skill}" ]]; then
    cp -v "${REPO_DIR}/skills/${skill}/SKILL.md" "${TARGET_DIR}/skills/${skill}/SKILL.md" 2>/dev/null || echo "  (no SKILL.md in ${skill} yet)"
  fi
done

# Mirror tools (built .js files)
if [[ -d "${REPO_DIR}/tools/dist" ]]; then
  cp -v "${REPO_DIR}/tools/dist/"*.js "${TARGET_DIR}/tools/" 2>/dev/null || echo "  (no built tool .js files yet)"
fi

# Mirror plugin
if [[ -f "${REPO_DIR}/plugins/orchestrator.js" ]]; then
  cp -v "${REPO_DIR}/plugins/orchestrator.js" "${TARGET_DIR}/plugins/orchestrator.js"
fi

echo ""
echo "✓ Install complete. Restart opencode to pick up changes."
echo ""
echo "Installed:"
echo "  Agents:   ${TARGET_DIR}/agents/"
ls -1 "${TARGET_DIR}/agents/" 2>/dev/null | sed 's/^/    /'
echo "  Skills:   ${TARGET_DIR}/skills/"
ls -1 "${TARGET_DIR}/skills/" 2>/dev/null | sed 's/^/    /'
echo "  Tools:    ${TARGET_DIR}/tools/"
ls -1 "${TARGET_DIR}/tools/"*.js 2>/dev/null | sed 's/^/    /'
echo "  Plugins:  ${TARGET_DIR}/plugins/"
ls -1 "${TARGET_DIR}/plugins/"*.js 2>/dev/null | sed 's/^/    /'
