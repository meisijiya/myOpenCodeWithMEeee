/**
 * PR Reader — read GitHub PR/Issue as structured markdown
 * Reference: oh-my-pi internal-urls/pr:// scheme
 */
import { tool } from "@opencode-ai/plugin";
import { exec } from "child_process";
import { promisify } from "util";

const z = tool.schema;
const execAsync = promisify(exec);

const PR_REGEX = /^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/(pull|issues)\/(\d+)/;

export default tool({
  description: "Fetch a GitHub PR or Issue as structured data. Uses 'gh' CLI if available (preferred); falls back to GitHub API via curl.",
  args: {
    url: z.string().url().describe("GitHub PR or Issue URL (e.g., https://github.com/owner/repo/pull/123)"),
  },
  async execute(args) {
    const url = args.url as string;
    const match = url.match(PR_REGEX);
    if (!match) {
      return `Error: not a recognized GitHub PR/Issue URL: ${url}`;
    }
    const [, owner, repo, type, num] = match;
    const isPR = type === "pull";

    try {
      const cmd = isPR
        ? `gh pr view ${num} --repo ${owner}/${repo} --json title,body,state,comments,reviews,files,additions,deletions 2>/dev/null`
        : `gh issue view ${num} --repo ${owner}/${repo} --json title,body,state,comments 2>/dev/null`;
      const { stdout } = await execAsync(cmd, { maxBuffer: 5 * 1024 * 1024 });
      if (stdout) {
        try {
          const data = JSON.parse(stdout);
          return formatGhOutput(data, isPR);
        } catch {
          return stdout;
        }
      }
    } catch {
      // gh not installed or failed — fall back
    }

    try {
      const apiPath = isPR ? `pulls/${num}` : `issues/${num}`;
      const { stdout } = await execAsync(
        `curl -sL -H "Accept: application/vnd.github+json" "https://api.github.com/repos/${owner}/${repo}/${apiPath}"`,
        { maxBuffer: 5 * 1024 * 1024 },
      );
      const data = JSON.parse(stdout);
      return formatApiOutput(data, isPR);
    } catch (err) {
      return `Error: both gh CLI and curl failed. Install gh: https://cli.github.com/. ${(err as Error).message}`;
    }
  },
});

/**
 * Format output from `gh` CLI (JSON with rich fields).
 */
function formatGhOutput(data: any, isPR: boolean): string {
  const lines: string[] = [];
  lines.push(`# ${data.title || "(no title)"}`);
  lines.push(`**State**: ${data.state}`);
  if (isPR) {
    lines.push(`**Additions/Deletions**: +${data.additions || 0} / -${data.deletions || 0}`);
  }
  lines.push("");
  if (data.body) {
    lines.push(data.body);
    lines.push("");
  }
  if (isPR && data.files) {
    lines.push(`\n## Files changed (${data.files.length})`);
    for (const f of data.files.slice(0, 20)) {
      lines.push(`- ${f.path} (+${f.additions}/-${f.deletions})`);
    }
  }
  if (data.comments && data.comments.length > 0) {
    lines.push(`\n## Comments (${data.comments.length})`);
    for (const c of data.comments.slice(0, 10)) {
      lines.push(`- **${c.author?.login || "?"}**: ${(c.body || "").slice(0, 200)}`);
    }
  }
  return lines.join("\n");
}

/**
 * Format output from GitHub REST API (sparser than gh CLI output).
 */
function formatApiOutput(data: any, isPR: boolean): string {
  const lines: string[] = [];
  lines.push(`# ${data.title || "(no title)"}`);
  lines.push(`**State**: ${data.state}`);
  if (isPR) {
    lines.push(`**Additions/Deletions**: +${data.additions || 0} / -${data.deletions || 0}`);
  }
  lines.push("");
  if (data.body) {
    lines.push(data.body);
  }
  return lines.join("\n");
}
