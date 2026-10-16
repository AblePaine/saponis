import { createFileRoute } from "@tanstack/react-router";
import { GUIDE_DATABASE } from "@/data/guides";
import { OIL_DATABASE } from "@/data/oils";
import { listWorkhorseComparePairs } from "@/lib/oil-specs";
import { SITE_ORIGIN } from "@/lib/site";

/**
 * /sitemap.xml — generated at request time from the same data sources the
 * pages render from (oil database, guide database, workhorse compare pairs),
 * so a new oil, guide, or pair appears here without a hand edit. The static
 * bench/hub paths below are the only hand-listed entries.
 */
const STATIC_PATHS = [
  "/",
  "/soap",
  "/balms",
  "/emulsions",
  "/surfactants",
  "/candles",
  "/oils",
  "/oils/compare",
  "/guides",
] as const;

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function urlEntry(path: string, lastmod?: string): string {
  const lastmodLine = lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : "";
  return `  <url>\n    <loc>${escapeXml(`${SITE_ORIGIN}${path}`)}</loc>${lastmodLine}\n  </url>`;
}

function buildSitemapXml(): string {
  const entries: string[] = STATIC_PATHS.map((path) => urlEntry(path));
  for (const oil of OIL_DATABASE) {
    entries.push(urlEntry(`/oils/${oil.slug}`));
  }
  for (const pair of listWorkhorseComparePairs()) {
    entries.push(urlEntry(`/oils/compare/${pair.pair}`));
  }
  for (const guide of GUIDE_DATABASE) {
    entries.push(urlEntry(`/guides/${guide.slug}`, guide.published));
  }
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    "</urlset>",
    "",
  ].join("\n");
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: () =>
        new Response(buildSitemapXml(), {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        }),
    },
  },
});
