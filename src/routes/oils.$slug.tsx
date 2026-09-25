import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowLeft, Plus } from "lucide-react";
import { OIL_DATABASE, getOilBySlug } from "@/data/oils";
import { formatSap } from "@/lib/format";
import {
  DEFAULT_PRELOAD_WEIGHT_G,
  counterpartPairs,
  kohAdjustedSap,
  oilDatasetJsonLd,
  oilPageDescription,
  oilPageTitle,
} from "@/lib/oil-specs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DirectoryHeader } from "@/components/oils/directory-header";
import { JsonLd } from "@/components/oils/json-ld";
import { SpecCard } from "@/components/oils/spec-card";
import { FattySpectrum } from "@/components/oils/fatty-spectrum";
import { QualityMatrix } from "@/components/oils/quality-matrix";
import { CopyBlock } from "@/components/oils/copy-block";
import type { MasterOilRecord } from "@/types/soap";

export const Route = createFileRoute("/oils/$slug")({
  loader: ({ params }) => {
    const oil = getOilBySlug(params.slug);
    if (!oil) throw notFound();
    return oil;
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Oil — Saponis" }] };
    }
    const path = `/oils/${loaderData.slug}`;
    return {
      meta: [
        { title: oilPageTitle(loaderData) },
        { name: "description", content: oilPageDescription(loaderData) },
        { name: "robots", content: "index,follow" },
      ],
      links: [{ rel: "canonical", href: path }],
    };
  },
  component: OilSpec,
  notFoundComponent: OilNotFound,
});

function OilNotFound() {
  return (
    <main className="mx-auto max-w-lg px-4 py-16 text-center">
      <DirectoryHeader current="library" />
      <h1 className="mt-10 font-display text-2xl">Oil not in this library</h1>
      <p className="mt-2 text-sm text-muted">
        Every spec sheet comes from the same oil table. Pick a fat from the catalog.
      </p>
      <Button asChild className="mt-6 h-12">
        <Link to="/oils">Oil library</Link>
      </Button>
    </main>
  );
}

function OilSpec() {
  const oil = Route.useLoaderData();
  const koh90 = kohAdjustedSap(oil.sap_koh);
  const counterparts = counterpartPairs(oil);
  const siblings = OIL_DATABASE.filter((entry) => entry.id !== oil.id);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      <JsonLd data={oilDatasetJsonLd(oil)} />
      <DirectoryHeader current="library" />

      <Link
        to="/oils"
        className="mt-6 inline-flex h-12 items-center gap-2 text-sm font-medium text-primary"
      >
        <ArrowLeft className="size-4" />
        Oil library
      </Link>

      <section className="mt-4 rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5">
        <p className="text-xs font-medium tracking-[0.22em] text-muted uppercase">
          Spec sheet
        </p>
        <h1 className="mt-1 font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">
          {oil.name}
        </h1>
        <p className="text-muted italic">{oil.common_botanical_name}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge>{oil.hardness_profile}</Badge>
          <Badge variant="outline">trace {oil.trace_speed_impact}</Badge>
          <Badge variant="outline">max {oil.recommended_max_percentage}%</Badge>
          {oil.workhorse ? <Badge variant="outline">workhorse</Badge> : null}
        </div>
        <Button asChild size="lg" className="mt-5 h-12 w-full sm:w-auto">
          <Link to="/soap" search={{ oil: oil.slug, wt: DEFAULT_PRELOAD_WEIGHT_G }}>
            <Plus />
            Load into soap bench
          </Link>
        </Button>
      </section>

      <div className="mt-4 flex flex-col gap-4">
        <SpecCard kicker="01" title="Saponification & chemical numbers">
          <dl className="divide-y divide-line">
            <ConstantRow
              label="NaOH SAP (pure)"
              value={formatSap(oil.sap_naoh)}
              unit="g NaOH / g oil"
            />
            <ConstantRow
              label="KOH SAP (pure)"
              value={formatSap(oil.sap_koh)}
              unit="g KOH / g oil"
            />
            <ConstantRow
              label="KOH SAP (90% reagent)"
              value={formatSap(koh90)}
              unit="g 90% KOH / g oil"
            />
            <ConstantRow
              label="Iodine value"
              value={String(oil.iodine)}
              unit="g I₂ / 100 g"
            />
            <ConstantRow label="INS" value={String(oil.ins)} unit="KOH SAP − IV" />
          </dl>
        </SpecCard>

        <SpecCard kicker="02" title="Fatty acid spectrum">
          <FattySpectrum profile={oil.fatty_acids} />
        </SpecCard>

        <SpecCard kicker="03" title="What it does in the bar">
          <QualityMatrix oil={oil} />
        </SpecCard>

        <SpecCard kicker="04" title="INCI names for the label">
          <div className="flex flex-col gap-3">
            <CopyBlock
              label="Pre-saponification INCI"
              value={oil.inci_names.standard}
              hint="The oil left over as superfat, by name."
            />
            <CopyBlock
              label="Post-saponification NaOH salt"
              value={oil.inci_names.saponified_naoh}
              hint="How to list it on a NaOH soap label."
            />
            <CopyBlock
              label="Post-saponification KOH salt"
              value={oil.inci_names.saponified_koh}
              hint="How to list it on a KOH soap label."
            />
          </div>
        </SpecCard>
      </div>

      {counterparts.length > 0 ? (
        <section className="mt-8">
          <h2 className="font-display text-xl font-medium tracking-tight">
            Head-to-head: can you swap it?
          </h2>
          <ul className="mt-3 flex flex-col gap-2">
            {counterparts.map((row) => (
              <li key={row.pair}>
                <CompareLink oil={oil} other={row.b} factor={row.factor} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-8 mb-8">
        <h2 className="font-display text-xl font-medium tracking-tight">Library</h2>
        <ul className="mt-3 flex flex-col gap-2">
          {siblings.map((entry) => (
            <li key={entry.id}>
              <Link
                to="/oils/$slug"
                params={{ slug: entry.slug }}
                className="flex h-12 items-center justify-between rounded-xl bg-surface px-4 text-sm shadow-[var(--shadow-border)]"
              >
                <span>{entry.name}</span>
                <span className="font-mono text-xs text-muted">
                  {formatSap(entry.sap_naoh)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

function ConstantRow({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-3">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="shrink-0 text-right">
        <span className="font-mono text-sm tabular-nums text-ink">{value}</span>
        <span className="mt-0.5 block text-xs text-faint">{unit}</span>
      </dd>
    </div>
  );
}

function CompareLink({
  oil,
  other,
  factor,
}: {
  oil: MasterOilRecord;
  other: MasterOilRecord;
  factor: number;
}) {
  return (
    <Link
      to="/oils/compare/$pair"
      params={{ pair: `${oil.slug}-vs-${other.slug}` }}
      className="flex min-h-12 items-center justify-between gap-3 rounded-xl bg-surface px-4 py-3 text-sm shadow-[var(--shadow-border)]"
    >
      <span>
        vs {other.name}
      </span>
      <span className="font-mono text-xs tabular-nums text-muted">
        ×{factor.toFixed(4)}
      </span>
    </Link>
  );
}
