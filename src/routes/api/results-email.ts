import { createFileRoute } from "@tanstack/react-router";

import { getSql } from "@/lib/db";

/**
 * POST /api/results-email — store an "email me these results" request.
 *
 * Body: { email, surface, snapshot } where snapshot is the caller's
 * results object. The request is written to `results_email_requests`
 * (migration 0003). The response says `delivery: "pending"` because
 * that is true at store time: the drain job (send leg, live
 * 2026-11-06 — POST /api/results-email/drain) sends within a few
 * minutes and marks the row sent (migration 0004).
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_SNAPSHOT_CHARS = 20_000;

async function post({ request }: { request: Request }): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }
  const { email, surface, snapshot } = (body ?? {}) as {
    email?: unknown;
    surface?: unknown;
    snapshot?: unknown;
  };
  if (typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
    return Response.json({ error: "invalid_email" }, { status: 400 });
  }
  if (typeof surface !== "string" || !surface || surface.length > 64) {
    return Response.json({ error: "invalid_surface" }, { status: 400 });
  }
  if (typeof snapshot !== "object" || snapshot === null || Array.isArray(snapshot)) {
    return Response.json({ error: "invalid_snapshot" }, { status: 400 });
  }
  const snapshotJson = JSON.stringify(snapshot);
  if (snapshotJson.length > MAX_SNAPSHOT_CHARS) {
    return Response.json({ error: "snapshot_too_large" }, { status: 400 });
  }
  try {
    const sql = await getSql();
    await sql.query(
      "insert into results_email_requests (email, surface, snapshot) values ($1, $2, $3::jsonb)",
      [email.trim(), surface, snapshotJson],
    );
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "storage_failed" },
      { status: 500 },
    );
  }
  return Response.json({ ok: true, stored: true, delivery: "pending" });
}

export const Route = createFileRoute("/api/results-email")({
  server: { handlers: { POST: post } },
});
