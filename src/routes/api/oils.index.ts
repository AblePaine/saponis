import { createFileRoute } from "@tanstack/react-router";

import { listOils } from "@/lib/agent-api";

/** GET /api/oils — the full oil library behind the soap engine. */
function get(): Response {
  return Response.json(listOils(), {
    headers: { "Cache-Control": "public, max-age=3600" },
  });
}

export const Route = createFileRoute("/api/oils/")({
  server: { handlers: { GET: get } },
});
