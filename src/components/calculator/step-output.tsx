import { Printer } from "lucide-react";
import { getOilById } from "@/data/oils";
import { Button } from "@/components/ui/button";
import { formatMass, formatPercent, formatRatio } from "@/lib/format";
import { StepCard } from "@/components/calculator/step-card";
import {
  DANGER_UNSATURATED_SOLUTION,
  WARNING_EXCESS_WATER,
  WARNING_STRIPPING_BAR,
  type BatchResult,
  type RecipeConfig,
} from "@/types/soap";
import { cn } from "@/lib/utils";

function alertCopy(alert: string): { title: string; body: string } {
  if (alert === DANGER_UNSATURATED_SOLUTION) {
    return {
      title: "Lye too concentrated",
      body: "Water ratio is too low to safely dissolve the alkali.",
    };
  }
  if (alert === WARNING_EXCESS_WATER) {
    return {
      title: "High liquid content",
      body: "A wet batter makes soft bars, a long cure, and soda ash.",
    };
  }
  if (alert === WARNING_STRIPPING_BAR) {
    return {
      title: "Stripping profile",
      body: "Cleansing is above 22 with a thin superfat.",
    };
  }
  return { title: "Notice", body: alert };
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-line py-3">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="font-mono text-sm tabular-nums text-ink">{value}</dd>
    </div>
  );
}

export function StepOutput({
  config,
  result,
}: {
  config: RecipeConfig;
  result: BatchResult;
}) {
  const unit = config.unit;

  return (
    <StepCard
      step={4}
      title="Batch sheet"
      subtitle="Weigh-up table, then print a one-page production checklist."
    >
      {result.safetyAlerts.length > 0 ? (
        <ul className="mb-4 flex flex-col gap-2">
          {result.safetyAlerts.map((alert) => {
            const copy = alertCopy(alert);
            const hazard = alert.startsWith("DANGER_");
            return (
              <li
                key={alert}
                className={cn(
                  "rounded-xl px-3 py-3",
                  hazard ? "bg-danger-soft text-danger" : "bg-warn-soft text-warn",
                )}
              >
                <p className="text-sm font-medium">{copy.title}</p>
                <p className="text-sm opacity-90">{copy.body}</p>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mb-4 rounded-xl bg-ok-soft px-3 py-3 text-sm text-ok">
          No safety flags. Still wear PPE and add lye to liquid, never the reverse.
        </p>
      )}

      <dl>
        {config.oils.map((row) => {
          const oil = getOilById(row.oilId);
          return (
            <Row
              key={row.oilId}
              label={oil?.name ?? row.oilId}
              value={formatMass(row.amount, unit)}
            />
          );
        })}
        <Row label="NaOH" value={formatMass(result.dryLyeWeight.naoh, unit)} />
        <Row label="KOH" value={formatMass(result.dryLyeWeight.koh, unit)} />
        <Row label="Liquid" value={formatMass(result.liquidWeight, unit)} />
        <Row
          label="Fragrance"
          value={formatMass(config.additives?.fragranceGrams ?? 0, unit)}
        />
        <Row
          label="Sodium lactate"
          value={formatMass(config.additives?.sodiumLactateGrams ?? 0, unit)}
        />
        <Row label="Total batch" value={formatMass(result.totalBatchWeight, unit)} />
        <Row label="Lye concentration" value={formatPercent(result.lyeConcentrationPercent)} />
        <Row label="Water : lye" value={formatRatio(result.waterToLyeRatio)} />
      </dl>

      <Button
        type="button"
        size="lg"
        className="mt-4 w-full no-print"
        onClick={() => window.print()}
      >
        <Printer />
        Print batch sheet
      </Button>
    </StepCard>
  );
}
