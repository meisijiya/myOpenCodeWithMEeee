/**
 * AST Search — tree-sitter-based structural code search
 * Reference: omO LSP MCP + oh-my-pi pi-ast
 *
 * Strategy:
 *   1. Prefer ast-grep (real AST matching via tree-sitter)
 *   2. Fall back to ripgrep (rg) for fast regex search
 *   3. Final fallback to GNU grep (always present on Linux)
 *   4. If nothing is available, return a helpful install message
 */
import { tool } from "@opencode-ai/plugin";
import { z } from "zod";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

/**
 * Languages whose tree-sitter grammars ast-grep supports out of the box.
 * "auto" lets ast-grep infer the language from the file extension.
 */
const SUPPORTED_LANGUAGES = [
  "typescript", "javascript", "python", "rust", "go", "java",
  "cpp", "c", "csharp", "ruby", "php", "swift", "kotlin", "scala",
] as const;

const AstSearchSchema = z.object({
  pattern: z.string().describe("AST pattern with $NAME for captures and $$$REST for variadic"),
  language: z.enum(SUPPORTED_LANGUAGES).optional().describe("Target language (auto-detect from extension if not specified)"),
  path: z.string().default(".").describe("Search root path (default: current directory)"),
  context: z.number().default(3).describe("Lines of context around match (default: 3)"),
});

/**
 * Escape a string for safe inclusion inside single-quoted shell arguments.
 * Replaces each `'` with `'\''` (close-quote, escaped literal, open-quote).
 */
function shellQuote(value: string): string {
  return `'${value.replace(/'/g, "'\\''")}'`;
}

/**
 * Detect which search binary is available on PATH.
 * ast-grep is preferred; if its binary name is taken by another tool
 * (e.g., `sg` is `newgrp` on Debian), we verify the actual binary works.
 */
async function detectSearchEngine(): Promise<"ast-grep" | "rg" | "grep" | null> {
  // ast-grep: try the canonical binary first, then the `sg` alias
  for (const bin of ["ast-grep", "sg"]) {
    try {
      const { stdout } = await execAsync(`${bin} --version 2>&1`);
      if (/ast-grep/i.test(stdout)) return "ast-grep";
    } catch {
      // not installed or not the right binary — try next
    }
  }
  // ripgrep
  try {
    await execAsync("rg --version");
    return "rg";
  } catch {
    // not installed
  }
  // GNU grep — almost always present on Linux
  try {
    await execAsync("grep --version");
    return "grep";
  } catch {
    return null;
  }
}

/**
 * Run ast-grep with the given pattern, language, and path.
 * Returns the raw stdout from the search.
 */
async function runAstGrep(pattern: string, language: string | undefined, path: string): Promise<string> {
  const args = ["ast-grep", "run", "--pattern", shellQuote(pattern)];
  if (language) args.push("--lang", language);
  args.push(path);
  const { stdout } = await execAsync(args.join(" "), { maxBuffer: 10 * 1024 * 1024 });
  return stdout;
}

/**
 * Run ripgrep with regex pattern, line numbers, and configurable context.
 */
async function runRipgrep(pattern: string, path: string, context: number): Promise<string> {
  const cmd = `rg -n --context ${context} ${shellQuote(pattern)} ${shellQuote(path)}`;
  const { stdout } = await execAsync(cmd, { maxBuffer: 10 * 1024 * 1024 });
  return stdout;
}

/**
 * Final fallback using GNU grep. Note: GNU grep is not context-aware like rg,
 * so we emit line numbers and let the caller interpret the raw output.
 */
async function runGnugrep(pattern: string, path: string): Promise<string> {
  const cmd = `grep -RIn ${shellQuote(pattern)} ${shellQuote(path)}`;
  const { stdout } = await execAsync(cmd, { maxBuffer: 10 * 1024 * 1024 });
  return stdout;
}

export default tool({
  description:
    "Search code structurally using AST patterns (e.g., 'function $NAME($$$ARGS) { $$$BODY }'). " +
    "Supports 14 languages via tree-sitter. Uses ast-grep when available, " +
    "falls back to ripgrep for fast regex search, and finally to GNU grep. " +
    "Install ast-grep (https://ast-grep.github.io/) for true AST matching.",
  args: {
    pattern: AstSearchSchema.shape.pattern,
    language: AstSearchSchema.shape.language.optional(),
    path: AstSearchSchema.shape.path,
    context: AstSearchSchema.shape.context,
  },
  async execute(args, _context) {
    const { pattern, language, path, context: ctxLines } = args;

    const engine = await detectSearchEngine();

    if (engine === "ast-grep") {
      try {
        const stdout = await runAstGrep(pattern, language, path);
        return stdout || "No matches found";
      } catch (err) {
        // ast-grep failed at runtime — degrade to regex search
        return await fallbackSearch(pattern, path, ctxLines, `ast-grep error: ${(err as Error).message}`);
      }
    }

    if (engine === "rg") {
      try {
        const stdout = await runRipgrep(pattern, path, ctxLines);
        return `[Fallback: ripgrep regex — install ast-grep for true AST search]\n${stdout || "No matches found"}`;
      } catch (err) {
        return await fallbackSearch(pattern, path, ctxLines, `ripgrep error: ${(err as Error).message}`);
      }
    }

    if (engine === "grep") {
      try {
        const stdout = await runGnugrep(pattern, path);
        return `[Fallback: GNU grep — install ast-grep (https://ast-grep.github.io/) for true AST search, or ripgrep for faster results]\n${stdout || "No matches found"}`;
      } catch (err) {
        return `Error: GNU grep failed. ${(err as Error).message}`;
      }
    }

    return [
      "Error: no search engine available.",
      "Install one of:",
      "  - ast-grep (https://ast-grep.github.io/) — recommended, real AST matching",
      "  - ripgrep (https://github.com/BurntSushi/ripgrep) — fast regex",
      "  - grep — usually preinstalled on Linux",
    ].join("\n");
  },
});

/**
 * Degrade to GNU grep when the preferred engine fails at runtime.
 * Used as the last-resort recovery inside catch blocks.
 */
async function fallbackSearch(pattern: string, path: string, ctxLines: number, upstreamErr: string): Promise<string> {
  try {
    const stdout = await runGnugrep(pattern, path);
    return `[Fallback: GNU grep (regex). Upstream engine error: ${upstreamErr}]\n${stdout || "No matches found"}`;
  } catch (err) {
    return `Error: all search engines failed.\n${upstreamErr}\ngrep error: ${(err as Error).message}`;
  }
}
