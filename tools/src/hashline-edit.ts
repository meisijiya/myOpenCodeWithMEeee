/**
 * Hashline Edit tool — replaces default edit with line#CID anchor system
 * Reference: oh-my-pi patch/edit + omO src/tools/hashline-edit
 */
import { tool } from "@opencode-ai/plugin";
import { readFile, writeFile } from "fs/promises";
import { validateTag } from "./hashline-tag";

const z = tool.schema;

const CID_CHARSET = "ZPMQVRWSNKTXJBYH";
const CID_REGEX = new RegExp(`^\\d+#[${CID_CHARSET}]{2}$`);

const HashlineEditSchema = z.object({
  path: z.string().describe("File path to edit"),
  op: z.enum(["replace", "append", "prepend"]).describe("Edit operation"),
  pos: z.string().regex(CID_REGEX).optional().describe("Start anchor (LINE#CID format, CID in ZPMQVRWSNKTXJBYH)"),
  end: z.string().regex(CID_REGEX).optional().describe("End anchor (LINE#CID format, CID in ZPMQVRWSNKTXJBYH)"),
  lines: z.array(z.string()).describe("New lines to write"),
  delete: z.boolean().optional().describe("If true, delete the file (replace op only)"),
});

/**
 * Parse a "LINE#CID" anchor into [0-indexed line number, CID].
 * Returns null if the format is invalid.
 */
function parseAnchor(anchor: string): [number, string] | null {
  const m = anchor.match(/^(\d+)#([ZPMQVRWSNKTXJBYH]{2})$/);
  if (!m) return null;
  return [parseInt(m[1], 10) - 1, m[2]];
}

/**
 * Build a "LINE#CID| content" tagged string from a 0-indexed line.
 */
function buildTagged(lineIdx: number, content: string): string {
  return `${lineIdx + 1}#${"XX"}| ${content}`;
}

export default tool({
  description: "Edit a file using LINE#CID hashline anchors. If anchors are stale (file changed), edit is rejected before corruption. Replaces opencode's default edit tool for higher accuracy on weak models.",
  args: {
    path: HashlineEditSchema.shape.path,
    op: HashlineEditSchema.shape.op,
    pos: HashlineEditSchema.shape.pos.optional(),
    end: HashlineEditSchema.shape.end.optional(),
    lines: HashlineEditSchema.shape.lines,
    delete: HashlineEditSchema.shape.delete.optional(),
  },
  async execute(args, context) {
    const { path, op, pos, end, lines, delete: shouldDelete } = args;

    // Reject delete on non-replace op
    if (shouldDelete && op !== "replace") {
      return `Error: delete=true only valid with op="replace"`;
    }

    let content: string;
    try {
      content = await readFile(path, "utf-8");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return `Error: cannot read ${path}: ${msg}`;
    }

    // Handle file deletion
    if (shouldDelete && op === "replace") {
      await writeFile(path, "");
      return `Deleted ${path}`;
    }

    const originalLines = content.split("\n");

    // Parse and validate anchors up front
    const parsedPos = pos ? parseAnchor(pos) : null;
    if (pos && !parsedPos) {
      return `Error: pos anchor ${pos} has invalid format (expected LINE#CID where CID is in ${CID_CHARSET})`;
    }
    const parsedEnd = end ? parseAnchor(end) : null;
    if (end && !parsedEnd) {
      return `Error: end anchor ${end} has invalid format (expected LINE#CID where CID is in ${CID_CHARSET})`;
    }

    // Validate pos anchor
    if (parsedPos && pos) {
      const [lineIdx, cid] = parsedPos;
      if (lineIdx < 0 || lineIdx >= originalLines.length) {
        return `Error: pos anchor ${pos} is out of range (file has ${originalLines.length} line(s))`;
      }
      const tagged = `${lineIdx + 1}#${cid}| ${originalLines[lineIdx]}`;
      if (!validateTag(tagged, content)) {
        return `Error: pos anchor ${pos} is stale — file has changed. Re-read the file and try again.`;
      }
    }

    // Validate end anchor
    if (parsedEnd && end) {
      const [lineIdx, cid] = parsedEnd;
      if (lineIdx < 0 || lineIdx >= originalLines.length) {
        return `Error: end anchor ${end} is out of range (file has ${originalLines.length} line(s))`;
      }
      const tagged = `${lineIdx + 1}#${cid}| ${originalLines[lineIdx]}`;
      if (!validateTag(tagged, content)) {
        return `Error: end anchor ${end} is stale — file has changed. Re-read the file and try again.`;
      }
    }

    // Compute new line array based on op
    let newLines: string[];

    if (op === "replace") {
      if (!parsedPos) return `Error: replace requires pos anchor`;
      const [startIdx] = parsedPos;
      const [endIdx] = parsedEnd ?? parsedPos;
      if (endIdx < startIdx) {
        return `Error: end anchor ${end} is before pos anchor ${pos}`;
      }
      newLines = [
        ...originalLines.slice(0, startIdx),
        ...lines,
        ...originalLines.slice(endIdx + 1),
      ];
    } else if (op === "append") {
      if (parsedPos) {
        const [startIdx] = parsedPos;
        newLines = [
          ...originalLines.slice(0, startIdx + 1),
          ...lines,
          ...originalLines.slice(startIdx + 1),
        ];
      } else {
        newLines = [...originalLines, ...lines];
      }
    } else {
      // prepend
      if (parsedPos) {
        const [startIdx] = parsedPos;
        newLines = [
          ...originalLines.slice(0, startIdx),
          ...lines,
          ...originalLines.slice(startIdx),
        ];
      } else {
        newLines = [...lines, ...originalLines];
      }
    }

    await writeFile(path, newLines.join("\n"));
    return `Edited ${path}: ${op} at ${pos || "BOF"}${end ? `-${end}` : ""}, ${lines.length} line(s) written`;
  },
});
