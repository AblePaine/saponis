import { createFileRoute } from "@tanstack/react-router";

import { calculateResponse, runFoCard } from "@/lib/agent-api";

/**
 * POST /api/fo-card/calculate — the Candle Studio multi-format
 * fragrance card engine (src/lib/fo-card-engine.ts) over JSON. Body is
 * a partial FoCardInput; omitted fields use the bench defaults. Same
 * engine as the /candles fragrance card and the MCP fo_card_calculate
 * tool.
 */
async function post({ request }: { request: Request }): Promise<Response> {
  return calculateResponse(request, runFoCard);
}

export const Route = createFileRoute("/api/fo-card/calculate")({
  server: { handlers: { POST: post } },
});
