import { createFileRoute } from "@tanstack/react-router";

import { calculateResponse, runCostCalculate } from "@/lib/agent-api";

/**
 * POST /api/cost/calculate — the costing suite's cost-per-unit engine
 * (src/lib/costing-engine.ts) over JSON. Body is a partial CostInput;
 * omitted fields use the bench defaults (the SAMPLE recipe). The
 * wholesale ladder is a Saponis Pro feature and has no endpoint here.
 */
async function post({ request }: { request: Request }): Promise<Response> {
  return calculateResponse(request, runCostCalculate);
}

export const Route = createFileRoute("/api/cost/calculate")({
  server: { handlers: { POST: post } },
});
