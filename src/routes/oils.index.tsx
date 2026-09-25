import { Link, createFileRoute } from "@tanstack/react-router";
import { OIL_DATABASE } from "@/data/oils";
import { formatSap } from "@/lib/format";
import { catalogDatasetJsonLd, kohAdjustedSap } from "@/lib/oil-specs";
import { DirectoryHeader } from "@/components/oils/directory-header";
import { JsonLd } from "@/components/oils/json-ld";
import { Badge } from "@/components/ui/badge";
import type { MasterOilRecord } from "@/types/soap";

const HARDNESS_ORDER = ["hard", "brittle", "soft"] as const;

export const Route = createFileRoute("/oils/")({
  head: () => ({
    meta: [
      { title: "Oil library — SAP, INCI, fatty acids · Saponis" },
      {
        name: "description",
        content:
          "Look up any soapmaking oil: NaOH and KOH SAP, iodine, INS, fatty acids, INCI names, and how it behaves in the bar.",
      },
      { name: "robots", content: "index,follow" },
    ],
    links: [{ rel: "canonical", href: "/oils" }],
  }),
  component: OilLibrary,
});

function OilLibrary() {
  const groups = HARDNESS_ORDER.map((hardness) => ({
    hardness,
    oils: OIL_DATABASE.filter((oil) => oil.hardness_profile === hardness),
  })).filter((group) => group.oils.length > 0);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <JsonLd data={catalogDatasetJsonLd()} />
      <DirectoryHeader current="library" />
      <p className="mt-8 text-xs font-medium tracking-[0.22em] text-muted uppercase">
        Directory
      </p>
      <h1 className="mt-1 font-display text-3xl font-medium tracking-tight sm:text-4xl">
        Oil library
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        {OIL_DATABASE.length} fats, SAP to 4 decimals, and the INCI names you'll
        actually print on the label. Workhorse oils get head-to-head swap pages.
      </p>

      <div className="mt-6 md:hidden">
        <ul className="flex flex-col gap-3">
          {groups.flatMap((group) =>
            group.oils.map((oil) => (
              <li key={oil.id}>
                <OilCard oil={oil} />
              </li>
            )),
          )}
        </ul>
      </div>

      <div className="mt-6 hidden overflow-x-auto rounded-2xl bg-surface shadow-[var(--shadow-border)] md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs tracking-wide text-muted uppercase">
              <th className="px-4 py-3 font-medium">Oil</th>
              <th className="px-3 py-3 font-medium whitespace-nowrap">NaOH SAP</th>
              <th className="px-3 py-3 font-medium whitespace-nowrap">KOH SAP</th>
              <th className="px-3 py-3 font-medium whitespace-nowrap">KOH 90%</th>
              <th className="px-3 py-3 font-medium">IV</th>
              <th className="px-3 py-3 font-medium">INS</th>
              <th className="px-3 py-3 font-medium">Max</th>
              <th className="px-4 py-3 font-medium">Class</th>
            </tr>
          </thead>
          <tbody>
            {groups.flatMap((group) =>
              group.oils.map((oil) => <OilRow key={oil.id} oil={oil} />),
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}

function OilRow({ oil }: { oil: MasterOilRecord }) {
  return (
    <tr className="border-b border-line last:border-0">
      <td className="px-4 py-3">
        <Link
          to="/oils/$slug"
          params={{ slug: oil.slug }}
          className="font-medium text-ink underline-offset-2 hover:underline"
        >
          {oil.name}
        </Link>
        <p className="text-xs text-muted italic">{oil.common_botanical_name}</p>
      </td>
      <td className="px-3 py-3 font-mono whitespace-nowrap tabular-nums">
        {formatSap(oil.sap_naoh)}
      </td>
      <td className="px-3 py-3 font-mono whitespace-nowrap tabular-nums">
        {formatSap(oil.sap_koh)}
      </td>
      <td className="px-3 py-3 font-mono whitespace-nowrap tabular-nums">
        {formatSap(kohAdjustedSap(oil.sap_koh))}
      </td>
      <td className="px-3 py-3 font-mono tabular-nums">{oil.iodine}</td>
      <td className="px-3 py-3 font-mono tabular-nums">{oil.ins}</td>
      <td className="px-3 py-3 font-mono whitespace-nowrap tabular-nums">
        {oil.recommended_max_percentage}%
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1">
          <Badge>{oil.hardness_profile}</Badge>
          {oil.workhorse ? <Badge variant="outline">workhorse</Badge> : null}
        </div>
      </td>
    </tr>
  );
}

function OilCard({ oil }: { oil: MasterOilRecord }) {
  return (
    <Link
      to="/oils/$slug"
      params={{ slug: oil.slug }}
      className="block rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)]"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-display text-lg font-medium tracking-tight text-ink">{oil.name}</p>
          <p className="text-xs text-muted italic">{oil.common_botanical_name}</p>
        </div>
        <div className="flex flex-wrap gap-1">
          <Badge>{oil.hardness_profile}</Badge>
          {oil.workhorse ? <Badge variant="outline">workhorse</Badge> : null}
        </div>
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
        <div>
          <dt className="text-xs text-muted">NaOH SAP</dt>
          <dd className="font-mono tabular-nums">{formatSap(oil.sap_naoh)}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted">KOH 90%</dt>
          <dd className="font-mono tabular-nums">{formatSap(kohAdjustedSap(oil.sap_koh))}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Iodine / INS</dt>
          <dd className="font-mono tabular-nums">
            {oil.iodine} / {oil.ins}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Max</dt>
          <dd className="font-mono tabular-nums">{oil.recommended_max_percentage}%</dd>
        </div>
      </dl>
    </Link>
  );
}
