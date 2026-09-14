import { Link } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { getOilById } from "@/data/oils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { oilTotal, useRecipeStore } from "@/lib/recipe-store";
import { formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";
import { MassField } from "@/components/calculator/mass-field";
import { OilPicker } from "@/components/calculator/oil-picker";
import { StepCard } from "@/components/calculator/step-card";

export function StepOils() {
  const config = useRecipeStore((s) => s.config);
  const entryMode = useRecipeStore((s) => s.entryMode);
  const batchTotal = useRecipeStore((s) => s.batchTotal);
  const setEntryMode = useRecipeStore((s) => s.setEntryMode);
  const setBatchTotal = useRecipeStore((s) => s.setBatchTotal);
  const setOilAmount = useRecipeStore((s) => s.setOilAmount);
  const setOilPercent = useRecipeStore((s) => s.setOilPercent);
  const removeOil = useRecipeStore((s) => s.removeOil);
  const normalizePercents = useRecipeStore((s) => s.normalizePercents);

  const total = oilTotal(config);
  const basis = entryMode === "percent" ? batchTotal || total : total;
  const percentSum =
    basis > 0
      ? config.oils.reduce((sum, row) => sum + (row.amount / basis) * 100, 0)
      : 0;
  const percentOff = entryMode === "percent" && Math.abs(percentSum - 100) > 0.2;

  return (
    <StepCard
      step={1}
      title="Oils"
      subtitle="Search the library, then enter % of total or direct weight."
    >
      <div className="flex rounded-lg bg-bg-subtle p-1">
        {(
          [
            { id: "percent", label: "% of total" },
            { id: "weight", label: "Direct weight" },
          ] as const
        ).map((mode) => (
          <button
            key={mode.id}
            type="button"
            onClick={() => setEntryMode(mode.id)}
            className={cn(
              "h-12 flex-1 rounded-md px-3 text-sm font-medium transition-colors duration-150",
              entryMode === mode.id
                ? "bg-surface text-ink shadow-sm"
                : "text-muted hover:text-ink",
            )}
          >
            {mode.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        <Label htmlFor="batch-total">
          {entryMode === "percent" ? "Batch size (100%)" : "Scale oils to"}
        </Label>
        <div className="mt-1">
          <MassField
            id="batch-total"
            value={entryMode === "percent" ? basis : total}
            unit={config.unit}
            ariaLabel="Total oil weight"
            onChange={setBatchTotal}
          />
        </div>
      </div>

      {percentOff ? (
        <div className="mt-3 flex flex-col gap-2 rounded-xl bg-warn-soft px-3 py-3 text-warn sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm">
            Percentages sum to {formatPercent(percentSum)}. Normalize to 100% of the
            batch size, or the oil total will not match.
          </p>
          <Button
            type="button"
            variant="secondary"
            className="h-12 shrink-0"
            onClick={normalizePercents}
          >
            Normalize
          </Button>
        </div>
      ) : null}

      <div className="mt-4 flex flex-col gap-3">
        {config.oils.length === 0 ? (
          <p className="rounded-xl border border-dashed border-line-strong px-4 py-8 text-center text-sm text-muted">
            Add an oil to start the batch.
          </p>
        ) : (
          config.oils.map((row) => {
            const record = getOilById(row.oilId);
            if (!record) return null;
            const share = basis > 0 ? (row.amount / basis) * 100 : 0;
            const overMax =
              share > record.recommended_max_percentage + 0.05 &&
              record.recommended_max_percentage < 100;
            return (
              <article
                key={row.oilId}
                className="rounded-lg bg-bg-subtle/70 p-3"
              >
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        to="/oils/$slug"
                        params={{ slug: record.slug }}
                        className="font-display text-base font-medium tracking-tight text-ink underline-offset-2 hover:underline"
                      >
                        {record.name}
                      </Link>
                      <Badge variant="outline">{record.hardness_profile}</Badge>
                      {overMax ? (
                        <Badge variant="warn">over {record.recommended_max_percentage}%</Badge>
                      ) : null}
                    </div>
                    <p className="text-xs text-muted italic">{record.common_botanical_name}</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-12"
                    aria-label={`Remove ${record.name}`}
                    onClick={() => removeOil(row.oilId)}
                  >
                    <Trash2 />
                  </Button>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor={`pct-${row.oilId}`}>Percent</Label>
                    <div className="mt-1">
                      <MassField
                        id={`pct-${row.oilId}`}
                        value={share}
                        unit="%"
                        ariaLabel={`${record.name} percent`}
                        onChange={(value) => setOilPercent(row.oilId, value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor={`wt-${row.oilId}`}>Weight</Label>
                    <div className="mt-1">
                      <MassField
                        id={`wt-${row.oilId}`}
                        value={row.amount}
                        unit={config.unit}
                        ariaLabel={`${record.name} amount`}
                        onChange={(value) => setOilAmount(row.oilId, value)}
                      />
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>

      <div className="mt-4 pb-1">
        <OilPicker />
      </div>
    </StepCard>
  );
}
