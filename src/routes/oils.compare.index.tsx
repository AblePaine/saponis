import { Link, createFileRoute } from "@tanstack/react-router";
import { workhorseOils } from "@/data/oils";
import { formatFactor, formatSap } from "@/lib/format";
import { listWorkhorseComparePairs } from "@/lib/oil-specs";
import { DirectoryHeader } from "@/components/oils/directory-header";
import { JsonLd } from "@/components/oils/json-ld";

const pairs = listWorkhorseComparePairs();
const horses = workhorseOils();

export const Route = createFileRoute("/oils/compare/")({
  head: () => ({
    meta: [
      { title: "Oil swap guide — Saponis" },
      {
        name: "description",
        content:
          "Swapping oils? The factor tells you how much to adjust the lye. Head-to-head SAP factors for workhorse soapmaking oils.",
      },
      { name: "robots", content: "index,follow" },
    ],
    links: [{ rel: "canonical", href: "/oils/compare" }],
  }),
  component: CompareIndex,
});

function CompareIndex() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "DataCatalog",
          name: "Saponis oil substitution matrix",
          url: "/oils/compare",
          numberOfItems: pairs.length,
          hasPart: pairs.map((row) => ({
            "@type": "Dataset",
            name: `${row.a.name} vs ${row.b.name}`,
            url: `/oils/compare/${row.pair}`,
          })),
        }}
      />
      <DirectoryHeader current="compare" />
      <p className="mt-8 text-xs font-medium tracking-[0.22em] text-muted uppercase">
        Head-to-head
      </p>
      <h1 className="mt-1 font-display text-3xl font-medium tracking-tight sm:text-4xl">
        Substitution matrix
      </h1>
      <p className="mt-2 max-w-2xl font-mono text-sm text-muted">
        Factor = SAP of oil A ÷ SAP of oil B. {horses.length} workhorses · {pairs.length}{" "}
        pairs.
      </p>

      <div className="mt-6 overflow-x-auto rounded-2xl bg-surface shadow-[var(--shadow-border)]">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs tracking-wide text-muted uppercase">
              <th className="px-4 py-3 font-medium">Oil A</th>
              <th className="px-3 py-3 font-medium">Oil B</th>
              <th className="px-3 py-3 font-medium">SAP A</th>
              <th className="px-3 py-3 font-medium">SAP B</th>
              <th className="px-4 py-3 text-right font-medium">A / B</th>
            </tr>
          </thead>
          <tbody>
            {pairs.map((row) => (
              <tr key={row.pair} className="border-b border-line last:border-0">
                <td className="px-4 py-3">
                  <Link
                    to="/oils/compare/$pair"
                    params={{ pair: row.pair }}
                    className="font-medium text-ink underline-offset-2 hover:underline"
                  >
                    {row.a.name}
                  </Link>
                </td>
                <td className="px-3 py-3 text-muted">{row.b.name}</td>
                <td className="px-3 py-3 font-mono tabular-nums">
                  {formatSap(row.a.sap_naoh)}
                </td>
                <td className="px-3 py-3 font-mono tabular-nums">
                  {formatSap(row.b.sap_naoh)}
                </td>
                <td className="px-4 py-3 text-right font-mono tabular-nums">
                  {formatFactor(row.factor)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
