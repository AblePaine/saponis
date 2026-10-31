import { createFileRoute } from "@tanstack/react-router";

import { calculateResponse, runCandleBlend } from "@/lib/agent-api";

/**
 * POST /api/candle-blend/calculate — the Candle Studio blend window
 * engine (src/lib/candle-blend-engine.ts) over JSON. Body is a partial
 * CandleBlendInput; omitted fields use the bench defaults. Same engine
 * as the /candles blend tool and the MCP candle_blend_calculate tool.
 */
async function post({ request }: { request: Request }): Promise<Response> {
  return calculateResponse(request, runCandleBlend);
}

export const Route = createFileRoute("/api/candle-blend/calculate")({
  server: { handlers: { POST: post } },
});
