#!/usr/bin/env bash
# uninstall.sh — Remove ohMeisijiyaCode files from ~/.config/opencode/
#
# Removes only files this project installed, and matches entry from
# opencode.json's `plugin` array (if it was registered by install.sh).
# Does NOT touch:
# - oh-my-openagent.json or any other plugin config
# - Existing opencode plugins (rtk.ts, etc.)
# - Existing AGENTS.md
# - Existing CLIs that we did not create (mmx / ctx7 / playwright-cli)
# - Existing MCPs that were added before install.sh (e.g., MiniMax via /connect)
#
# Idempotent: safe to run multiple times.

set -euo pipefail

TARGET_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/opencode"
OPENCODE_CONFIG="${TARGET_DIR}/opencode.json"

echo "Uninstalling ohMeisijiyaCode from ${TARGET_DIR}"
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

# Our 7 agents (v2.2: onetwo/twoone/eggdog + update/architect/planner/reviewer)
rm_target "agents/onetwo.md"
rm_target "agents/librarian.md"
rm_target "agents/twoone.md"
rm_target "agents/eggdog.md"
rm_target "agents/update.md"
rm_target "agents/architect.md"
rm_target "agents/planner.md"
rm_target "agents/reviewer.md"

# Our 19 skills (v2.2: same count as v2.1, but composition shifted)
#  - 3 self-built: karpathy-guidelines / openspec-integration / mmx-cli-usage
#  - 1 self-built utility: update-project-meta
#  - 11 verbatim imports: mattpocock (10) + addyosmani (1)
#  - 4 mattpocock-managed: improve-codebase-architecture / setup-matt-pocock-skills /
#                          triage / update-project-meta
#  - remaining: incremental-implementation / interview-me / source-driven-development /
#               git-workflow-and-versioning
rm_target_dir "skills/caveman"
rm_target_dir "skills/diagnose"
rm_target_dir "skills/git-workflow-and-versioning"
rm_target_dir "skills/docx"
rm_target_dir "skills/grill-with-docs"
rm_target_dir "skills/handoff"
rm_target_dir "skills/improve-codebase-architecture"
rm_target_dir "skills/incremental-implementation"
rm_target_dir "skills/interview-me"
rm_target_dir "skills/karpathy-guidelines"
rm_target_dir "skills/mmx-cli-usage"
rm_target_dir "skills/openspec-integration"
rm_target_dir "skills/pdf"
rm_target_dir "skills/pptx"
rm_target_dir "skills/prototype"
rm_target_dir "skills/setup-matt-pocock-skills"
rm_target_dir "skills/source-driven-development"
rm_target_dir "skills/tdd"
rm_target_dir "skills/xlsx"
rm_target_dir "skills/to-issues"
rm_target_dir "skills/triage"
rm_target_dir "skills/update-project-meta"
rm_target_dir "skills/zoom-out"

# Our 21 commands (v2.2: slash-command files in ~/.config/opencode/commands/)
for cmd in brainstorm caveman code-review diagnose finish-branch git-workflow grill \
           handoff improve-arch interview mmx plan prototype setup tdd to-issues \
           triage updateProjectMeta verify write-skill zoom-out; do
  rm_target "commands/${cmd}.md"
done

# Note: v2.2 retired both custom tools (hashline-edit / task-dispatch) and the
# orchestrator plugin. We do not delete them here — they no longer exist in
# v2.2 install paths. If you upgraded from v2.1, run v2.1's uninstall.sh first.

# Remove compaction block (only if it matches our template — preserve user's custom settings)
if [[ -f "${OPENCODE_CONFIG}" ]]; then
  REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  COMPACTION_TEMPLATE="${REPO_DIR}/templates/opencode-compaction.jsonc"
  if [[ -f "${COMPACTION_TEMPLATE}" ]]; then
    REMOVE_COMPACTION_OUTPUT="$(python3 - "${OPENCODE_CONFIG}" "${COMPACTION_TEMPLATE}" <<'PY_EOF' 2>&1
import json, sys

config_path, template_path = sys.argv[1], sys.argv[2]
try:
    with open(config_path, "r", encoding="utf-8") as f:
        config = json.load(f)
    with open(template_path, "r", encoding="utf-8") as f:
        template = json.load(f)
except (json.JSONDecodeError, OSError) as e:
    print(f"WARN: could not read files: {e}")
    sys.exit(0)

removed = False

# Remove compaction block if it matches our template (deep equal)
user_compaction = config.get("compaction")
if user_compaction == template.get("compaction"):
    del config["compaction"]
    removed = True
    print("removed: compaction block (matched our template)")

# Remove agent.compaction.prompt if it matches our template prompt
ac = config.get("agent", {}).get("compaction")
template_prompt = template.get("agent", {}).get("compaction", {}).get("prompt")
if isinstance(ac, dict) and ac.get("prompt") == template_prompt:
    del ac["prompt"]
    # If agent.compaction is now empty, remove it entirely
    if not ac:
        del config["agent"]["compaction"]
    removed = True
    print("removed: agent.compaction.prompt (matched our template)")

if not removed:
    print("preserved: compaction block (user-customized, not removed)")
else:
    with open(config_path, "w", encoding="utf-8") as f:
        json.dump(config, f, indent=2, ensure_ascii=False)
        f.write("\n")
PY_EOF
)"
    echo "compaction: ${REMOVE_COMPACTION_OUTPUT}"
  fi
fi

echo ""
echo "✓ Uninstall complete. Restart opencode to apply changes."
echo "Note: your providers, MCPs (from /connect), and personal AGENTS.md are preserved."