import { createFileRoute } from "@tanstack/react-router";

import { calculateResponse, runMoldFillCalculate } from "@/lib/agent-api";

/**
 * POST /api/mold-fill/calculate — the costing suite's mold-fill sizing
 * (src/lib/costing-engine.ts, calling the mold engine) over JSON. Body is
 * a partial MoldFillInput; omitted fields use the bench defaults.
 */
async function post({ request }: { request: Request }): Promise<Response> {
  return calculateResponse(request, runMoldFillCalculate);
}

export const Route = createFileRoute("/api/mold-fill/calculate")({
  server: { handlers: { POST: post } },
});
