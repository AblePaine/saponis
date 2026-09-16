import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowLeftRight } from "lucide-react";
import { FATTY_ACID_KEYS } from "@/types/soap";
import { formatFactor, formatPercent, formatSap, formatScore } from "@/lib/format";
import { METRIC_KEYS, QUALITY_RANGES } from "@/lib/quality-ranges";
import {
  FATTY_ACID_META,
  compareDatasetJsonLd,
  comparePageDescription,
  comparePageTitle,
  kohAdjustedSap,
  oilQuality,
  parseComparePair,
  substitutionFactor,
} from "@/lib/oil-specs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DirectoryHeader } from "@/components/oils/directory-header";
import { JsonLd } from "@/components/oils/json-ld";
import { SpecCard } from "@/components/oils/spec-card";
import { cn } from "@/lib/utils";
import type { MasterOilRecord } from "@/types/soap";

export const Route = createFileRoute("/oils/compare/$pair")({
  loader: ({ params }) => {
    const parsed = parseComparePair(params.pair);
    if (!parsed) throw notFound();
    return parsed;
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Compare oils — Saponis" }] };
    }
    const path = `/oils/compare/${loaderData.a.slug}-vs-${loaderData.b.slug}`;
    return {
      meta: [
        { title: comparePageTitle(loaderData.a, loaderData.b) },
        {
          name: "description",
          content: comparePageDescription(loaderData.a, loaderData.b),
        },
        { name: "robots", content: "index,follow" },
      ],
      links: [{ rel: "canonical", href: path }],
    };
  },
  component: OilCompare,
  notFoundComponent: CompareNotFound,
});

function CompareNotFound() {
  return (
    <main className="mx-auto max-w-lg px-4 py-16 text-center">
      <DirectoryHeader current="compare" />
      <h1 className="mt-10 font-display text-2xl">Pair not in this library</h1>
      <p className="mt-2 text-sm text-muted">
        Comparison URLs are {`{slug1}-vs-{slug2}`} from the oil library.
      </p>
      <Button asChild className="mt-6 h-12">
        <Link to="/oils/compare">Substitution matrix</Link>
      </Button>
    </main>
  );
}

function OilCompare() {
  const { a, b } = Route.useLoaderData();
  const factor = substitutionFactor(a, b);
  const inverse = substitutionFactor(b, a);
  const qualityA = oilQuality(a);
  const qualityB = oilQuality(b);
  const exampleGrams = 500;

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <JsonLd data={compareDatasetJsonLd(a, b)} />
      <DirectoryHeader current="compare" />

      <p className="mt-8 text-xs font-medium tracking-[0.22em] text-muted uppercase">
        Head-to-head
      </p>
      <h1 className="mt-1 font-display text-3xl font-medium tracking-tight sm:text-4xl">
        {a.name}
        <span className="text-muted"> vs </span>
        {b.name}
      </h1>
      <div className="mt-3 flex flex-wrap gap-2">
        <Badge>{a.hardness_profile}</Badge>
        <Badge variant="outline">{b.hardness_profile}</Badge>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <OilLead oil={a} slot="A" />
        <OilLead oil={b} slot="B" />
      </div>

      <section className="mt-4 rounded-2xl bg-primary px-4 py-5 text-primary-fg shadow-[var(--shadow-border)] sm:px-5">
        <p className="text-xs font-medium tracking-[0.22em] uppercase opacity-80">
          Substitution factor
        </p>
        <p className="mt-2 font-mono text-sm tabular-nums opacity-80">
          <span className="block">NaOH SAP A {formatSap(a.sap_naoh)}</span>
          <span className="block">NaOH SAP B {formatSap(b.sap_naoh)}</span>
          <span className="block">
            A / B = {formatSap(a.sap_naoh)} / {formatSap(b.sap_naoh)}
          </span>
        </p>
        <p className="mt-1 font-display text-4xl font-medium tracking-tight">
          {formatFactor(factor)}
        </p>
        <p className="mt-3 max-w-2xl text-sm">
          Multiply your lye amount by {formatFactor(factor)} when swapping {a.name} for {b.name}.
        </p>
        <p className="mt-2 font-mono text-xs tabular-nums opacity-80">
          Inverse {formatFactor(inverse)} when swapping {b.name} for {a.name}.
        </p>
        <div className="mt-4 overflow-x-auto rounded-xl bg-primary-fg/10 p-3 text-sm">
          <p className="text-xs tracking-wide uppercase opacity-80">
            {exampleGrams} g swap · pure NaOH
          </p>
          <dl className="mt-2 grid gap-1 font-mono tabular-nums">
            <div className="flex justify-between gap-4">
              <dt>{exampleGrams} g {a.name}</dt>
              <dd>{(exampleGrams * a.sap_naoh).toFixed(2)} g NaOH</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>{exampleGrams} g {b.name}</dt>
              <dd>{(exampleGrams * b.sap_naoh).toFixed(2)} g NaOH</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Lye_A = Lye_B × factor</dt>
              <dd>
                {(exampleGrams * b.sap_naoh).toFixed(2)} × {formatFactor(factor)} ={" "}
                {(exampleGrams * b.sap_naoh * factor).toFixed(2)}
              </dd>
            </div>
          </dl>
        </div>
        <Button asChild variant="secondary" className="mt-4 h-12">
          <Link
            to="/oils/compare/$pair"
            params={{ pair: `${b.slug}-vs-${a.slug}` }}
          >
            <ArrowLeftRight />
            Reverse pair
          </Link>
        </Button>
      </section>

      <div className="mt-4 flex flex-col gap-4">
        <SpecCard kicker="Constants" title="SAP, iodine, INS">
          <CompareTable
            a={a}
            b={b}
            rows={[
              {
                label: "NaOH SAP (pure)",
                a: formatSap(a.sap_naoh),
                b: formatSap(b.sap_naoh),
                delta: a.sap_naoh - b.sap_naoh,
                deltaDigits: 4,
              },
              {
                label: "KOH SAP (pure)",
                a: formatSap(a.sap_koh),
                b: formatSap(b.sap_koh),
                delta: a.sap_koh - b.sap_koh,
                deltaDigits: 4,
              },
              {
                label: "KOH SAP (90%)",
                a: formatSap(kohAdjustedSap(a.sap_koh)),
                b: formatSap(kohAdjustedSap(b.sap_koh)),
                delta: kohAdjustedSap(a.sap_koh) - kohAdjustedSap(b.sap_koh),
                deltaDigits: 4,
              },
              {
                label: "Iodine value",
                a: String(a.iodine),
                b: String(b.iodine),
                delta: a.iodine - b.iodine,
                deltaDigits: 0,
              },
              {
                label: "INS",
                a: String(a.ins),
                b: String(b.ins),
                delta: a.ins - b.ins,
                deltaDigits: 0,
              },
              {
                label: "Max % of oils",
                a: `${a.recommended_max_percentage}%`,
                b: `${b.recommended_max_percentage}%`,
                delta: a.recommended_max_percentage - b.recommended_max_percentage,
                deltaDigits: 0,
              },
              {
                label: "Hardness class",
                a: a.hardness_profile,
                b: b.hardness_profile,
              },
              {
                label: "Trace",
                a: a.trace_speed_impact,
                b: b.trace_speed_impact,
              },
              {
                label: "INCI (pre-sap)",
                a: a.inci_names.standard,
                b: b.inci_names.standard,
              },
              {
                label: "INCI NaOH salt",
                a: a.inci_names.saponified_naoh,
                b: b.inci_names.saponified_naoh,
              },
              {
                label: "INCI KOH salt",
                a: a.inci_names.saponified_koh,
                b: b.inci_names.saponified_koh,
              },
            ]}
          />
        </SpecCard>

        <SpecCard kicker="Fatty acids" title="Eight-acid profile">
          <CompareTable
            a={a}
            b={b}
            rows={FATTY_ACID_KEYS.map((key) => ({
              label: `${FATTY_ACID_META[key].label} ${FATTY_ACID_META[key].chain}`,
              a: formatPercent(a.fatty_acids[key]),
              b: formatPercent(b.fatty_acids[key]),
              delta: a.fatty_acids[key] - b.fatty_acids[key],
              deltaDigits: 1,
              barA: a.fatty_acids[key],
              barB: b.fatty_acids[key],
              barMax: 100,
            }))}
          />
        </SpecCard>

        <SpecCard kicker="Quality" title="Physical contribution">
          <CompareTable
            a={a}
            b={b}
            rows={METRIC_KEYS.map((key) => {
              const meta = QUALITY_RANGES[key];
              return {
                label: meta.label,
                a: formatScore(qualityA[key]),
                b: formatScore(qualityB[key]),
                delta: qualityA[key] - qualityB[key],
                deltaDigits: 1,
                barA: qualityA[key],
                barB: qualityB[key],
                barMax: meta.ceiling,
              };
            })}
          />
        </SpecCard>
      </div>
    </main>
  );
}

function OilLead({ oil, slot }: { oil: MasterOilRecord; slot: "A" | "B" }) {
  return (
    <article className="rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)]">
      <p className="font-mono text-xs tracking-wide text-muted uppercase">Oil {slot}</p>
      <Link
        to="/oils/$slug"
        params={{ slug: oil.slug }}
        className="mt-1 block font-display text-xl font-medium tracking-tight text-ink underline-offset-2 hover:underline"
      >
        {oil.name}
      </Link>
      <p className="text-sm text-muted italic">{oil.common_botanical_name}</p>
      <p className="mt-2 font-mono text-sm tabular-nums text-ink">
        NaOH {formatSap(oil.sap_naoh)}
      </p>
      <Button asChild variant="outline" className="mt-3 h-12 w-full">
        <Link to="/soap" search={{ oil: oil.slug, wt: 500 }}>
          Load 500 g
        </Link>
      </Button>
    </article>
  );
}

interface CompareRow {
  label: string;
  a: string;
  b: string;
  delta?: number;
  deltaDigits?: number;
  barA?: number;
  barB?: number;
  barMax?: number;
}

function CompareTable({
  a,
  b,
  rows,
}: {
  a: MasterOilRecord;
  b: MasterOilRecord;
  rows: CompareRow[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-line text-xs tracking-wide text-muted uppercase">
            <th className="py-2 pr-3 font-medium">Metric</th>
            <th className="py-2 pr-3 font-medium">{a.name}</th>
            <th className="py-2 pr-3 font-medium">{b.name}</th>
            <th className="py-2 text-right font-medium">Δ A−B</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-b border-line last:border-0 align-top">
              <td className="py-2.5 pr-3 text-muted">{row.label}</td>
              <td className="py-2.5 pr-3">
                <p className="font-mono text-xs tabular-nums sm:text-sm">{row.a}</p>
                {row.barA != null && row.barMax ? (
                  <MiniBar value={row.barA} max={row.barMax} tone="a" />
                ) : null}
              </td>
              <td className="py-2.5 pr-3">
                <p className="font-mono text-xs tabular-nums sm:text-sm">{row.b}</p>
                {row.barB != null && row.barMax ? (
                  <MiniBar value={row.barB} max={row.barMax} tone="b" />
                ) : null}
              </td>
              <td className="py-2.5 text-right font-mono text-xs tabular-nums sm:text-sm">
                {row.delta == null
                  ? "—"
                  : `${row.delta > 0 ? "+" : ""}${row.delta.toFixed(row.deltaDigits ?? 2)}`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MiniBar({
  value,
  max,
  tone,
}: {
  value: number;
  max: number;
  tone: "a" | "b";
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-bg-subtle">
      <div
        className={cn("h-full rounded-full", tone === "a" ? "bg-primary" : "bg-ink-soft")}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
