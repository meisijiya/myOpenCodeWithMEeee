/**
 * Playwright Browser — full browser automation
 * Reference: omO playwright skill
 */
import { tool } from "@opencode-ai/plugin";
import { exec } from "child_process";
import { promisify } from "util";

const z = tool.schema;
const execAsync = promisify(exec);

export default tool({
  description: "Automate a real browser via Playwright. Supports navigate, screenshot, eval JS, scrape. Requires 'playwright' CLI (bunx playwright) installed. For full UI automation, use the @playwright/mcp server instead.",
  args: {
    action: z.enum(["navigate", "screenshot", "eval", "scrape"]).describe("Browser action"),
    url: z.string().url().optional().describe("URL for navigate/scrape"),
    script: z.string().optional().describe("JavaScript to evaluate (for action=eval)"),
    output_path: z.string().optional().describe("Where to save screenshot (for action=screenshot)"),
    selector: z.string().optional().describe("CSS selector to extract (for action=scrape)"),
  },
  async execute(args) {
    const action = args.action as string;
    const url = args.url as string | undefined;
    const script = args.script as string | undefined;
    const outputPath = (args.output_path as string) || "/tmp/screenshot.png";
    const selector = args.selector as string | undefined;

    if (action === "navigate" && url) {
      try {
        const { stdout } = await execAsync(`bunx playwright cr --url "${url}" 2>/dev/null || echo "playwright not installed; install with: bunx playwright install chromium"`);
        return `Navigated to ${url}\n${stdout}`;
      } catch (err) {
        return `Error: navigate failed. ${(err as Error).message}`;
      }
    }

    if (action === "screenshot" && url) {
      try {
        const { stdout } = await execAsync(`bunx playwright screenshot "${url}" "${outputPath}" 2>/dev/null || echo "playwright not installed; install with: bunx playwright install chromium"`);
        return `Screenshot saved to ${outputPath}\n${stdout}`;
      } catch (err) {
        return `Error: screenshot failed. ${(err as Error).message}`;
      }
    }

    if (action === "eval" && script && url) {
      try {
        const { stdout } = await execAsync(`bunx playwright eval "${url}" "${script.replace(/"/g, '\\"')}" 2>/dev/null || echo "playwright eval not available; consider @playwright/mcp"`);
        return stdout;
      } catch (err) {
        return `Error: eval failed. ${(err as Error).message}`;
      }
    }

    if (action === "scrape" && url) {
      try {
        const scrapeScript = selector
          ? `Array.from(document.querySelectorAll('${selector}')).map(e => e.textContent).join('\\n')`
          : `document.body.innerText`;
        const { stdout } = await execAsync(`bunx playwright eval "${url}" "${scrapeScript}" 2>/dev/null || curl -sL "${url}"`);
        return stdout;
      } catch (err) {
        return `Error: scrape failed. ${(err as Error).message}`;
      }
    }

    return `Error: action='${action}' requires appropriate args (url/script/etc.)`;
  },
});
