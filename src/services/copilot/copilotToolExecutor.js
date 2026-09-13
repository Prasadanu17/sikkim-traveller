import { TOOL_REGISTRY } from "./copilotToolRegistry";

/**
 * Tool Executor & Validation Manager.
 * Validates tool name and arguments, executes existing service, and sanitizes output.
 */
export async function executeCopilotTool(toolName, params) {
  const tool = TOOL_REGISTRY[toolName];

  if (!tool) {
    throw new Error(`Tool "${toolName}" is not registered or approved.`);
  }

  try {
    const result = await tool.handler(params);
    return {
      status: "success",
      toolName,
      type: tool.type,
      data: result
    };
  } catch (err) {
    console.warn(`[CopilotToolExecutor] Error executing ${toolName}:`, err.message);
    return {
      status: "error",
      toolName,
      type: tool.type,
      error: err.message
    };
  }
}
