import { createFileRoute } from "@tanstack/react-router";

import { calculateResponse, runWickStart } from "@/lib/agent-api";

/**
 * POST /api/wick/calculate — the Candle Studio wick test-card engine
 * (src/lib/wick-engine.ts) over JSON. Body is a partial WickInput;
 * omitted fields use the bench defaults. Same engine as the /candles
 * wick tool and the MCP wick_start_calculate tool.
 */
async function post({ request }: { request: Request }): Promise<Response> {
  return calculateResponse(request, runWickStart);
}

export const Route = createFileRoute("/api/wick/calculate")({
  server: { handlers: { POST: post } },
});
