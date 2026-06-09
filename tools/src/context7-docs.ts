/**
 * Context7 Docs — query official library documentation
 * Reference: omO context7 MCP
 */
import { tool } from "@opencode-ai/plugin";
import { exec } from "child_process";
import { promisify } from "util";

const z = tool.schema;
const execAsync = promisify(exec);

export default tool({
  description: "Query official library documentation via Context7. Returns up-to-date, version-specific docs for a given library.",
  args: {
    library: z.string().describe("Library name (e.g., 'react', 'fastapi', 'tokio')"),
    query: z.string().describe("What to look up in the docs"),
  },
  async execute(args) {
    const library = args.library as string;
    const query = args.query as string;

    try {
      const url = `https://context7.com/api/v1/search?library=${encodeURIComponent(library)}&query=${encodeURIComponent(query)}`;
      const { stdout } = await execAsync(`curl -sL -A "myOpenCodeWithMEeee/1.0" "${url}"`, {
        maxBuffer: 5 * 1024 * 1024,
      });
      if (!stdout) return `No docs found for ${library} (query: ${query})`;
      try {
        const data = JSON.parse(stdout);
        if (Array.isArray(data) && data.length > 0) {
          const lines: string[] = [`# Context7 docs: ${library} — ${query}\n`];
          for (const r of data.slice(0, 5)) {
            lines.push(`## ${r.title || r.name || "(untitled)"}`);
            if (r.url) lines.push(`URL: ${r.url}`);
            if (r.snippet || r.description) lines.push(r.snippet || r.description);
            if (r.content) lines.push(r.content.slice(0, 2000));
            lines.push("");
          }
          return lines.join("\n");
        }
        return stdout;
      } catch {
        return stdout;
      }
    } catch (err) {
      return `Error: Context7 query failed. ${(err as Error).message}`;
    }
  },
});
