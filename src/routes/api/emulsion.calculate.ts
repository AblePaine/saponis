import { createFileRoute } from "@tanstack/react-router";

import { calculateResponse, runEmulsionCalculate } from "@/lib/agent-api";

/**
 * POST /api/emulsion/calculate — the emulsion engine
 * (src/lib/emulsion-engine.ts) over JSON. Body is a partial EmulsionInput;
 * omitted fields use the bench defaults.
 */
async function post({ request }: { request: Request }): Promise<Response> {
  return calculateResponse(request, runEmulsionCalculate);
}

export const Route = createFileRoute("/api/emulsion/calculate")({
  server: { handlers: { POST: post } },
});
