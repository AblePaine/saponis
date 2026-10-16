import { createFileRoute } from "@tanstack/react-router";

import { buildOpenApiSpec } from "@/lib/openapi";

/** GET /openapi.json — OpenAPI 3.0 description of the agent API. */
function get(): Response {
  return Response.json(buildOpenApiSpec(), {
    headers: { "Cache-Control": "public, max-age=3600" },
  });
}

export const Route = createFileRoute("/openapi.json")({
  server: { handlers: { GET: get } },
});
