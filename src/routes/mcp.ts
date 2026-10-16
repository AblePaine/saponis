import { createFileRoute } from "@tanstack/react-router";

import {
  AGENT_TOOLS,
  AgentToolFailure,
  callAgentTool,
  isAgentTool,
  MCP_SERVER_INFO,
} from "@/lib/agent-api";

/**
 * POST /mcp — stateless MCP endpoint (streamable HTTP transport, plain
 * application/json responses; no sessions, no SSE stream).
 *
 * Hand-rolled minimal JSON-RPC 2.0: the repo has no MCP SDK in its
 * dependency tree, and the surface needed is four methods. Supports
 * initialize, ping, tools/list, and tools/call, backed by the exact same
 * engine calls as the REST API (src/lib/agent-api.ts). Notifications
 * (messages without an id) are accepted with HTTP 202 and no body.
 * Batches (JSON arrays) are supported. No authentication — the public
 * calculators only; the label engine and the /app Pro bench stay out.
 */

const DEFAULT_PROTOCOL_VERSION = "2025-03-26";

type JsonRpcId = string | number | null;

interface JsonRpcMessage {
  id?: JsonRpcId;
  method?: unknown;
  params?: unknown;
}

function rpcResult(id: JsonRpcId, result: unknown) {
  return { jsonrpc: "2.0", id, result };
}

function rpcError(id: JsonRpcId, code: number, message: string) {
  return { jsonrpc: "2.0", id, error: { code, message } };
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

/** Returns the JSON-RPC response object, or null for notifications. */
function handleMessage(message: unknown): unknown {
  if (
    typeof message !== "object" ||
    message === null ||
    Array.isArray(message)
  ) {
    return rpcError(null, -32600, "Invalid Request: expected a JSON-RPC object.");
  }
  const { id, method, params } = message as JsonRpcMessage;
  const isNotification = id === undefined;
  const responseId: JsonRpcId = isNotification ? null : (id ?? null);

  switch (method) {
    case "initialize": {
      if (isNotification) return null;
      const requested = asRecord(params).protocolVersion;
      return rpcResult(responseId, {
        protocolVersion:
          typeof requested === "string" ? requested : DEFAULT_PROTOCOL_VERSION,
        capabilities: { tools: {} },
        serverInfo: MCP_SERVER_INFO,
      });
    }
    case "ping":
      return isNotification ? null : rpcResult(responseId, {});
    case "tools/list":
      if (isNotification) return null;
      return rpcResult(responseId, {
        tools: AGENT_TOOLS.map((tool) => ({
          name: tool.name,
          description: tool.description,
          inputSchema: tool.inputSchema,
        })),
      });
    case "tools/call": {
      if (isNotification) return null;
      const call = asRecord(params);
      const name = call.name;
      if (typeof name !== "string" || !isAgentTool(name)) {
        return rpcError(
          responseId,
          -32602,
          `Unknown tool: ${typeof name === "string" ? name : "(missing name)"}. Call tools/list for the available tools.`,
        );
      }
      try {
        const result = callAgentTool(name, call.arguments ?? {});
        return rpcResult(responseId, {
          content: [{ type: "text", text: JSON.stringify(result) }],
          structuredContent: result as Record<string, unknown>,
          isError: false,
        });
      } catch (error) {
        const text =
          error instanceof AgentToolFailure || error instanceof Error
            ? error.message
            : "Tool call failed.";
        return rpcResult(responseId, {
          content: [{ type: "text", text }],
          isError: true,
        });
      }
    }
    default:
      if (isNotification) return null;
      return rpcError(
        responseId,
        -32601,
        `Method not found: ${typeof method === "string" ? method : "(missing method)"}`,
      );
  }
}

async function post({ request }: { request: Request }): Promise<Response> {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json(rpcError(null, -32700, "Parse error: body is not valid JSON."), {
      status: 400,
    });
  }
  if (Array.isArray(payload)) {
    const responses = payload
      .map(handleMessage)
      .filter((response) => response !== null);
    if (responses.length === 0) return new Response(null, { status: 202 });
    return Response.json(responses);
  }
  const response = handleMessage(payload);
  if (response === null) return new Response(null, { status: 202 });
  return Response.json(response);
}

function get(): Response {
  return Response.json(
    rpcError(
      null,
      -32000,
      "Method Not Allowed: this MCP server is stateless — POST JSON-RPC 2.0 messages to /mcp.",
    ),
    { status: 405, headers: { Allow: "POST" } },
  );
}

export const Route = createFileRoute("/mcp")({
  server: { handlers: { POST: post, GET: get } },
});
