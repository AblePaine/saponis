import { createFileRoute } from "@tanstack/react-router";

import { calculateResponse, runBalmCalculate } from "@/lib/agent-api";

/**
 * POST /api/balm/calculate — the balm engine (src/lib/balm-engine.ts) over
 * JSON. Body is a partial BalmInput; omitted fields use the bench defaults.
 */
async function post({ request }: { request: Request }): Promise<Response> {
  return calculateResponse(request, runBalmCalculate);
}

export const Route = createFileRoute("/api/balm/calculate")({
  server: { handlers: { POST: post } },
});
