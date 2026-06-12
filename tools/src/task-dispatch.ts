/**
 * Task Dispatch — router + MCP proxy wrapper around opencode's built-in task tool.
 *
 * Why this exists (per v2 design):
 * 1. Explicit surface for Sisyphus to invoke (vs implicit sub-agent dispatch)
 * 2. Context management: timeout, output filtering, context injection
 * 3. MCP proxy: normalize MCP tool calls through our routing layer
 *
 * Note: opencode's built-in `task` tool handles the actual delegation. This
 * tool just normalizes the call and provides explicit defaults.
 *
 * Background subagents: opencode 1.16.2+ supports background:true natively
 * (returns task_id immediately; main agent can keep working; results are
 * auto-injected into the parent session when the subagent finishes).
 * Requires `OPENCODE_EXPERIMENTAL=true` (or `..._BACKGROUND_SUBAGENTS=true`).
 */
import { tool } from "@opencode-ai/plugin";

const z = tool.schema;

const TaskDispatchSchema = z.object({
  subagent_type: z
    .string()
    .default("oracle")
    .describe("Subagent type (oracle, lyra, hephaestus, or mcp:<server>:<tool>)"),
  description: z.string().describe("3-5 word task description"),
  prompt: z.string().describe("Full task description with context"),
  mode: z
    .enum(["background", "sync", "continuation"])
    .default("background")
    .describe(
      "Delegation mode (opencode 1.16.2+ required for background/continuation): " +
        "'background'=fire-and-forget (default; results auto-injected when done); " +
        "'sync'=block until subagent finishes; " +
        "'continuation'=resume prior subagent session (requires task_id).",
    ),
  task_id: z
    .string()
    .optional()
    .describe("Required for mode=continuation; pass the prior task_id to resume that subagent session."),
  timeout_ms: z
    .number()
    .optional()
    .describe("Optional timeout in milliseconds (default: no timeout). Only applies to mode=sync."),
});

/**
 * Parse the subagent_type field. Supports two formats:
 * 1. Plain agent name: "oracle", "lyra", "hephaestus"
 * 2. MCP proxy: "mcp:<server>:<tool>" e.g. "mcp:MiniMax:web_search"
 */
function parseSubagentType(value: string): {
  kind: "agent" | "mcp";
  agent?: string;
  mcpServer?: string;
  mcpTool?: string;
} {
  if (value.startsWith("mcp:")) {
    const [, server, toolName] = value.split(":");
    if (!server || !toolName) {
      throw new Error(`Invalid MCP format: '${value}'. Expected 'mcp:<server>:<tool>'`);
    }
    return { kind: "mcp", mcpServer: server, mcpTool: toolName };
  }
  return { kind: "agent", agent: value };
}

/**
 * Compute the effective `background` flag from `mode`.
 * `background` and `continuation` are async (fire-and-forget); `sync` blocks.
 */
function modeToBackground(mode: "background" | "sync" | "continuation"): boolean {
  return mode !== "sync";
}

export default tool({
  description:
    "Dispatch a task to a sub-agent (oracle/lyra/hephaestus) OR proxy an MCP tool call. " +
    "Use 'mcp:<server>:<tool>' format for MCP proxy (e.g., 'mcp:MiniMax:web_search'). " +
    "mode=background (default; opencode 1.16.2+): subagent runs in parallel, results auto-injected. " +
    "mode=sync: block until subagent finishes. " +
    "mode=continuation: resume prior subagent session via task_id.",
  args: {
    subagent_type: TaskDispatchSchema.shape.subagent_type,
    description: TaskDispatchSchema.shape.description,
    prompt: TaskDispatchSchema.shape.prompt,
    mode: TaskDispatchSchema.shape.mode,
    task_id: TaskDispatchSchema.shape.task_id,
    timeout_ms: TaskDispatchSchema.shape.timeout_ms,
  },
  async execute(args) {
    const subagentType = args.subagent_type as string;
    const description = args.description as string;
    const prompt = args.prompt as string;
    const mode = (args.mode as "background" | "sync" | "continuation") ?? "background";
    const taskId = args.task_id as string | undefined;
    const timeoutMs = args.timeout_ms as number | undefined;

    // Validate mode=continuation requires task_id
    if (mode === "continuation" && !taskId) {
      return "Error: mode=continuation requires task_id (pass the prior task_id to resume).";
    }

    const background = modeToBackground(mode);

    let parsed;
    try {
      parsed = parseSubagentType(subagentType);
    } catch (err) {
      return `Error: ${(err as Error).message}`;
    }

    if (parsed.kind === "mcp") {
      // MCP proxy mode: normalize the call but don't actually invoke
      // (opencode plugins can't programmatically call MCP tools)
      return JSON.stringify(
        {
          kind: "mcp",
          server: parsed.mcpServer,
          tool: parsed.mcpTool,
          description,
          prompt,
          mode,
          note:
            "MCP proxy: this tool normalizes the call. Use the MCP tool directly via " +
            "`mcp__<server>__<tool>` syntax in your tool calls.",
        },
        null,
        2,
      );
    }

    // Agent dispatch mode: return normalized parameters
    // (opencode's built-in task tool handles actual delegation)
    return JSON.stringify(
      {
        kind: "agent",
        subagent_type: parsed.agent,
        description,
        prompt,
        mode,
        background,
        ...(taskId ? { task_id: taskId } : {}),
        timeout_ms: timeoutMs ?? null,
        note:
          "Agent dispatch: this tool normalizes the call. " +
          "opencode's built-in task tool handles the actual sub-agent invocation.",
      },
      null,
      2,
    );
  },
});
