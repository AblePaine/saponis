import { createFileRoute } from "@tanstack/react-router";

import { getOil } from "@/lib/agent-api";

/** GET /api/oils/:slug — one oil record by slug (ids and aliases resolve too). */
function get({ params }: { params: { slug: string } }): Response {
  const oil = getOil(params.slug);
  if (!oil) {
    return Response.json(
      {
        error: `No oil found for '${params.slug}'. GET /api/oils lists every valid slug.`,
      },
      { status: 404 },
    );
  }
  return Response.json(oil, {
    headers: { "Cache-Control": "public, max-age=3600" },
  });
}

export const Route = createFileRoute("/api/oils/$slug")({
  server: { handlers: { GET: get } },
});
