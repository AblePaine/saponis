import { createFileRoute } from "@tanstack/react-router";

import { calculateResponse, runCandleCalculate } from "@/lib/agent-api";

/**
 * POST /api/candle/calculate — the candle engine (src/lib/candle-engine.ts)
 * over JSON. Body is a partial CandleInput; omitted fields use the bench
 * defaults.
 */
async function post({ request }: { request: Request }): Promise<Response> {
  return calculateResponse(request, runCandleCalculate);
}

export const Route = createFileRoute("/api/candle/calculate")({
  server: { handlers: { POST: post } },
});
