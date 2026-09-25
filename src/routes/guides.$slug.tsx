import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { GUIDE_DATABASE, getGuideBySlug } from "@/data/guides";
import type { Guide } from "@/data/guides";
import { DirectoryHeader } from "@/components/oils/directory-header";
import { GuideBody } from "@/components/guides/guide-body";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const SITE_ORIGIN = "https://saponis.app";
const OG_IMAGE = `${SITE_ORIGIN}/og.jpg`;

export const Route = createFileRoute("/guides/$slug")({
  loader: ({ params }) => {
    const guide = getGuideBySlug(params.slug);
    if (!guide) throw notFound();
    return guide;
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Guide — Saponis" }] };
    }
    const path = `/guides/${loaderData.slug}`;
    const url = `${SITE_ORIGIN}${path}`;
    return {
      meta: [
        { title: `${loaderData.title} — Saponis` },
        { name: "description", content: loaderData.description },
        { name: "robots", content: "index,follow" },
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: "Saponis" },
        { property: "og:title", content: loaderData.title },
        { property: "og:description", content: loaderData.description },
        { property: "og:url", content: url },
        { property: "og:image", content: OG_IMAGE },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: loaderData.title },
        { name: "twitter:description", content: loaderData.description },
        { name: "twitter:image", content: OG_IMAGE },
      ],
      links: [{ rel: "canonical", href: path }],
    };
  },
  component: GuidePage,
  notFoundComponent: GuideNotFound,
});

function GuideNotFound() {
  return (
    <main className="mx-auto max-w-lg px-4 py-16 text-center">
      <DirectoryHeader current="guides" />
      <h1 className="mt-10 font-display text-2xl">Guide not found</h1>
      <p className="mt-2 text-sm text-muted">
        No guide there yet. Start from the list.
      </p>
      <Button asChild className="mt-6 h-12">
        <Link to="/guides">All guides</Link>
      </Button>
    </main>
  );
}

function GuidePage() {
  const guide: Guide = Route.useLoaderData();
  const others = GUIDE_DATABASE.filter((entry) => entry.slug !== guide.slug);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      <DirectoryHeader current="guides" />

      <Link
        to="/guides"
        className="mt-6 inline-flex h-12 items-center gap-2 text-sm font-medium text-primary"
      >
        <ArrowLeft className="size-4" />
        All guides
      </Link>

      <section className="mt-4 rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5">
        <p className="text-xs font-medium tracking-[0.22em] text-muted uppercase">
          Guide · {guide.kicker}
        </p>
        <h1 className="mt-1 font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">
          {guide.title}
        </h1>
        <div className="mt-4 flex flex-col gap-3">
          {guide.intro.map((paragraph, i) => (
            <p key={i} className="text-sm leading-relaxed text-muted">
              {paragraph}
            </p>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {guide.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
      </section>

      <GuideBody sections={guide.sections} keyNumbers={guide.keyNumbers} />

      <section className="mt-8 mb-8">
        <h2 className="font-display text-xl font-medium tracking-tight">
          More guides
        </h2>
        <ul className="mt-3 flex flex-col gap-2">
          {others.map((entry) => (
            <li key={entry.slug}>
              <Link
                to="/guides/$slug"
                params={{ slug: entry.slug }}
                className="flex min-h-12 items-center justify-between gap-3 rounded-xl bg-surface px-4 py-3 text-sm shadow-[var(--shadow-border)]"
              >
                <span className="font-medium text-ink">{entry.title}</span>
                <ArrowRight className="size-4 shrink-0 text-muted" />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
