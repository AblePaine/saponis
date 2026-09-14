import { getOilById } from "@/data/oils";
import { formatMass, formatPercent, formatRatio } from "@/lib/format";
import type { BatchResult, RecipeConfig } from "@/types/soap";

const CHECKS = [
  "Goggles and gloves on",
  "Scale zeroed",
  "Oils at target temperature",
  "Lye solution at target temperature",
  "Trace reached",
];

export function PrintSheet({
  config,
  result,
}: {
  config: RecipeConfig;
  result: BatchResult;
}) {
  const unit = config.unit;
  return (
    <section className="print-sheet hidden print:block">
      <h1 className="font-display text-3xl font-medium">Saponis batch sheet</h1>
      <p className="mt-1 text-sm">
        Superfat {config.superfatPercentage}% · Unit {unit} ·{" "}
        {config.liquidConfig.mode === "concentration"
          ? `${config.liquidConfig.value}% concentration`
          : config.liquidConfig.mode === "ratio"
            ? `${config.liquidConfig.value}:1 water:lye`
            : `${config.liquidConfig.value}% of oils`}
      </p>

      <h2 className="mt-6 font-display text-xl">Weigh-up</h2>
      <table className="mt-2 w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="border-b border-ink/20 py-2 text-left">Item</th>
            <th className="border-b border-ink/20 py-2 text-right">Weight</th>
            <th className="border-b border-ink/20 py-2 text-right w-16">✓</th>
          </tr>
        </thead>
        <tbody>
          {config.oils.map((row) => (
            <tr key={row.oilId}>
              <td className="border-b border-ink/10 py-2">
                {getOilById(row.oilId)?.name ?? row.oilId}
              </td>
              <td className="border-b border-ink/10 py-2 text-right font-mono">
                {formatMass(row.amount, unit)}
              </td>
              <td className="border-b border-ink/10 py-2 text-right">☐</td>
            </tr>
          ))}
          <tr>
            <td className="border-b border-ink/10 py-2">NaOH</td>
            <td className="border-b border-ink/10 py-2 text-right font-mono">
              {formatMass(result.dryLyeWeight.naoh, unit)}
            </td>
            <td className="border-b border-ink/10 py-2 text-right">☐</td>
          </tr>
          <tr>
            <td className="border-b border-ink/10 py-2">KOH</td>
            <td className="border-b border-ink/10 py-2 text-right font-mono">
              {formatMass(result.dryLyeWeight.koh, unit)}
            </td>
            <td className="border-b border-ink/10 py-2 text-right">☐</td>
          </tr>
          <tr>
            <td className="border-b border-ink/10 py-2">Liquid</td>
            <td className="border-b border-ink/10 py-2 text-right font-mono">
              {formatMass(result.liquidWeight, unit)}
            </td>
            <td className="border-b border-ink/10 py-2 text-right">☐</td>
          </tr>
          <tr>
            <td className="border-b border-ink/10 py-2">Fragrance</td>
            <td className="border-b border-ink/10 py-2 text-right font-mono">
              {formatMass(config.additives?.fragranceGrams ?? 0, unit)}
            </td>
            <td className="border-b border-ink/10 py-2 text-right">☐</td>
          </tr>
          <tr>
            <td className="py-2 font-medium">Total batch</td>
            <td className="py-2 text-right font-mono font-medium">
              {formatMass(result.totalBatchWeight, unit)}
            </td>
            <td className="py-2 text-right">☐</td>
          </tr>
        </tbody>
      </table>

      <p className="mt-3 text-sm">
        Concentration {formatPercent(result.lyeConcentrationPercent)} · Water:lye{" "}
        {formatRatio(result.waterToLyeRatio)}
      </p>

      <h2 className="mt-6 font-display text-xl">Production checklist</h2>
      <ul className="mt-2 text-sm">
        {CHECKS.map((item) => (
          <li key={item} className="flex items-center gap-3 border-b border-ink/10 py-2">
            <span className="font-mono">☐</span>
            {item}
          </li>
        ))}
      </ul>

      {result.safetyAlerts.length > 0 ? (
        <p className="mt-6 text-sm">
          Alerts: {result.safetyAlerts.join(" · ")}
        </p>
      ) : null}
    </section>
  );
}
