import { createFileRoute } from "@tanstack/react-router";

import { calculateResponse, runSoapCalculate } from "@/lib/agent-api";
import { decodeRecipe } from "@/lib/recipe-url";

/**
 * POST /api/soap/calculate — the soap engine (src/lib/calcEngine.ts) over
 * JSON. Body is a partial RecipeConfig, or { "recipe": "<r string>" }.
 * GET with ?r=<share-link recipe> runs the same calculation.
 */
async function post({ request }: { request: Request }): Promise<Response> {
  return calculateResponse(request, runSoapCalculate);
}

function get({ request }: { request: Request }): Response {
  const encoded = new URL(request.url).searchParams.get("r");
  const config = decodeRecipe(encoded);
  if (!config) {
    return Response.json(
      {
        error:
          "Pass a Saponis recipe string as ?r= (the value from a /soap share link), or POST a JSON body instead.",
      },
      { status: 400 },
    );
  }
  return Response.json(runSoapCalculate(config));
}

export const Route = createFileRoute("/api/soap/calculate")({
  server: { handlers: { POST: post, GET: get } },
});
