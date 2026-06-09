/**
 * Atomic Commit — analyze working tree and recommend atomic commit boundaries
 * Reference: oh-my-pi omp commit + omO git-master skill
 */
import { tool } from "@opencode-ai/plugin";
import { exec } from "child_process";
import { promisify } from "util";

const z = tool.schema;
const execAsync = promisify(exec);

/**
 * Score a file path by commit priority.
 * Higher score = should be committed first (more important source code).
 * Lock files score 0 (excluded from commits).
 */
const SCORE_FN = (path: string): number => {
  if (path.includes("package-lock.json") || path.includes("bun.lock") || path.includes("yarn.lock")) return 0;
  if (path.match(/\.(json|toml|yaml|yml|toml)$/)) return 1;
  if (path.includes("docs/") || path.endsWith(".md")) return 2;
  if (path.includes("test/") || path.includes("spec/") || path.endsWith(".test.ts") || path.endsWith(".spec.ts")) return 3;
  if (path.includes("src/") || path.includes("lib/")) return 5;
  return 4;
};

export default tool({
  description: "Analyze working tree changes and group them into recommended atomic commits. Source files score higher than tests/docs/configs. Lock files excluded from commits. Returns ordered groups.",
  args: {
    message_style: z.enum(["conventional", "freeform"]).default("conventional").describe("Commit message style (used in suggestions)"),
  },
  async execute(args) {
    const style = (args.message_style as string) || "conventional";

    try {
      const { stdout: statusOut } = await execAsync("git status --porcelain");
      const { stdout: diffNamesOut } = await execAsync("git diff --name-only HEAD");

      const allFiles = new Set<string>();
      for (const line of statusOut.split("\n").filter(Boolean)) {
        const path = line.replace(/^.../, "").trim().split(" -> ").pop() || "";
        if (path) allFiles.add(path);
      }
      for (const p of diffNamesOut.split("\n").filter(Boolean)) allFiles.add(p);

      const scored = Array.from(allFiles)
        .filter((p) => SCORE_FN(p) > 0)
        .map((p) => ({ path: p, score: SCORE_FN(p) }))
        .sort((a, b) => b.score - a.score);

      if (scored.length === 0) {
        return "No working tree changes to analyze.";
      }

      const groups: Record<number, string[]> = {};
      for (const f of scored) {
        groups[f.score] = groups[f.score] || [];
        groups[f.score].push(f.path);
      }

      const lines: string[] = [`# Atomic commit recommendations (${style})\n`];
      const sortedScores = Object.keys(groups).map(Number).sort((a, b) => b - a);
      let commitNum = 1;
      for (const score of sortedScores) {
        const files = groups[score];
        const prefix = style === "conventional" ? inferConventionalType(files) : "";
        const subject = style === "conventional" ? `${prefix}: ...` : "...";
        lines.push(`## Commit ${commitNum} (${subject})`);
        lines.push("```bash");
        lines.push(`git add ${files.map((f) => `"${f}"`).join(" ")}`);
        lines.push(`git commit -m "${subject}"`);
        lines.push("```");
        lines.push("");
        commitNum++;
      }
      return lines.join("\n");
    } catch (err) {
      return `Error: not a git repo or git unavailable. ${(err as Error).message}`;
    }
  },
});

/**
 * Infer conventional-commit type prefix from file paths.
 */
function inferConventionalType(files: string[]): string {
  const allDocs = files.every((f) => f.includes("docs/") || f.endsWith(".md"));
  if (allDocs) return "docs";
  const allTests = files.every((f) => f.includes("test/") || f.includes("spec/") || f.endsWith(".test.ts"));
  if (allTests) return "test";
  return "feat";
}
