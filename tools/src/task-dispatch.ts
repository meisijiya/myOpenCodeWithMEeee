/**
 * Task Dispatch — thin convenience wrapper around opencode's built-in task tool
 * Provides shorthand for common delegation patterns
 */
import { tool } from "@opencode-ai/plugin";

const z = tool.schema;

const TaskDispatchSchema = z.object({
  subagent_type: z.string().default("oracle").describe("Subagent type (e.g., 'oracle')"),
  description: z.string().describe("3-5 word task description"),
  prompt: z.string().describe("Full task description with context"),
  background: z.boolean().default(false).describe("If true, return task_id immediately for fire-and-forget"),
});

export default tool({
  description: "Dispatch a task to a sub agent (typically 'oracle'). Returns task result or task_id (if background=true). Use for read-only analysis, exploration, or research.",
  args: {
    subagent_type: TaskDispatchSchema.shape.subagent_type,
    description: TaskDispatchSchema.shape.description,
    prompt: TaskDispatchSchema.shape.prompt,
    background: TaskDispatchSchema.shape.background,
  },
  async execute(args, context) {
    // Note: This is a thin wrapper. opencode's built-in `task` tool handles the actual delegation.
    // This tool just normalizes the call and provides explicit defaults.
    return JSON.stringify(
      {
        subagent_type: args.subagent_type,
        description: args.description,
        prompt: args.prompt,
        background: args.background,
        note: "This tool returns the normalized parameters. The actual sub agent invocation is handled by opencode's built-in task tool.",
      },
      null,
      2,
    );
  },
});
