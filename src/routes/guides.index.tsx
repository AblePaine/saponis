import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { GUIDE_DATABASE } from "@/data/guides";
import { DirectoryHeader } from "@/components/oils/directory-header";
import { Badge } from "@/components/ui/badge";

const SITE_ORIGIN = "https://saponis.app";
const OG_IMAGE = `${SITE_ORIGIN}/og.jpg`;

export const Route = createFileRoute("/guides/")({
  head: () => ({
    meta: [
      { title: "Formulation guides — Saponis" },
      {
        name: "description",
        content:
          "Practical soapmaking and cosmetic formulation guides: lye safety, reading an oil, cold process vs hot process, superfatting, cure times, and balm ratios.",
      },
      { name: "robots", content: "index,follow" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Saponis" },
      { property: "og:title", content: "Formulation guides — Saponis" },
      {
        property: "og:description",
        content:
          "Practical soapmaking and cosmetic formulation guides: lye safety, reading an oil, cold process vs hot process, superfatting, cure times, and balm ratios.",
      },
      { property: "og:url", content: `${SITE_ORIGIN}/guides` },
      { property: "og:image", content: OG_IMAGE },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Formulation guides — Saponis" },
      {
        name: "twitter:description",
        content:
          "Practical soapmaking and cosmetic formulation guides: lye safety, reading an oil, cold process vs hot process, superfatting, cure times, and balm ratios.",
      },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [{ rel: "canonical", href: "/guides" }],
  }),
  component: GuidesHub,
});

function GuidesHub() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <DirectoryHeader current="guides" />
      <p className="mt-8 text-xs font-medium tracking-[0.22em] text-muted uppercase">
        Library
      </p>
      <h1 className="mt-1 font-display text-3xl font-medium tracking-tight sm:text-4xl">
        Formulation guides
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        {GUIDE_DATABASE.length} practical guides. Numbers first: ratios, temperatures,
        times, and the working rules behind each batch.
      </p>

      <ul className="mt-6 flex flex-col gap-3">
        {GUIDE_DATABASE.map((guide) => (
          <li key={guide.slug}>
            <Link
              to="/guides/$slug"
              params={{ slug: guide.slug }}
              className="block rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium tracking-[0.22em] text-muted uppercase">
                    Guide · {guide.kicker}
                  </p>
                  <p className="mt-1 font-display text-lg font-medium tracking-tight text-ink">
                    {guide.title}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">
                    {guide.description}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {guide.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <ArrowRight className="mt-1 size-4 shrink-0 text-muted" />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
