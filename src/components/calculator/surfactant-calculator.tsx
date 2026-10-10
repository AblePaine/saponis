import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { StepCard } from "@/components/calculator/step-card";
import { MassField } from "@/components/calculator/mass-field";
import { SliderField } from "@/components/calculator/slider-field";
import {
  BenchHeader,
  BenchLayout,
  BenchResults,
  PercentRow,
  ResultRow,
  WarningList,
} from "@/components/calculator/bench-shell";
import {
  computeCleanser,
  GENTLENESS_LABEL,
} from "@/lib/surfactant-engine";
import { SURFACTANTS } from "@/data/surfactants";
import { cn } from "@/lib/utils";

function setPercent(
  prev: Record<string, number>,
  id: string,
  percent: number | undefined,
): Record<string, number> {
  const next = { ...prev };
  if (percent === undefined) delete next[id];
  else next[id] = percent;
  return next;
}

export function SurfactantCalculator() {
  const [batchGrams, setBatchGrams] = useState(100);
  const [hasTargetPh, setHasTargetPh] = useState(false);
  const [targetPh, setTargetPh] = useState(5.5);
  const [percents, setPercents] = useState<Record<string, number>>({
    "cocamidopropyl-betaine": 8,
    "decyl-glucoside": 6,
  });

  const result = useMemo(
    () =>
      computeCleanser({
        batchGrams,
        targetPh: hasTargetPh ? targetPh : null,
        surfactants: Object.entries(percents).map(([id, percent]) => ({
          id,
          percent,
        })),
      }),
    [batchGrams, hasTargetPh, targetPh, percents],
  );

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-4 pt-6 pb-8 sm:px-6 lg:px-8 lg:pb-12">
      <BenchHeader
        kicker="04 · Cleansers"
        title="Cleanser bench"
        lede="How much cleaning power is actually in the bottle, whether your surfactants get along, and a gentleness read for skin. Percents are of the whole batch."
      />
      <BenchLayout
        steps={
          <>
            <StepCard
              step={1}
              title="Batch & pH target"
              subtitle="How much you're making, and where you want the pH to land."
            >
              <div className="flex flex-col gap-5">
                <div>
                  <label
                    htmlFor="cleanser-batch"
                    className="mb-1.5 block text-sm font-medium text-ink"
                  >
                    Batch size
                  </label>
                  <div className="w-40">
                    <MassField
                      id="cleanser-batch"
                      value={batchGrams}
                      unit="g"
                      ariaLabel="Batch size in grams"
                      onChange={setBatchGrams}
                    />
                  </div>
                </div>
                <div>
                  <label className="flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={hasTargetPh}
                      onChange={(event) => setHasTargetPh(event.target.checked)}
                      className="size-5 shrink-0 accent-[var(--color-primary)]"
                    />
                    <span className="text-sm font-medium text-ink">
                      I have a target pH
                    </span>
                  </label>
                  {hasTargetPh ? (
                    <div className="mt-2">
                      <SliderField
                        min={3}
                        max={10}
                        step={0.1}
                        value={targetPh}
                        onChange={setTargetPh}
                        unit="pH"
                        ariaLabel="Target pH"
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            </StepCard>
            <StepCard
              step={2}
              title="Surfactants"
              subtitle="Percent of the whole batch — the bench works out the active matter."
            >
              <div className="flex flex-col gap-2">
                {SURFACTANTS.map((surfactant) => (
                  <PercentRow
                    key={surfactant.id}
                    name={surfactant.name}
                    note={`${surfactant.charge} · ${(surfactant.asm_fraction * 100).toFixed(0)}% active`}
                    percent={percents[surfactant.id]}
                    max={40}
                    onToggle={(on) =>
                      setPercents((prev) =>
                        setPercent(prev, surfactant.id, on ? 5 : undefined),
                      )
                    }
                    onPercent={(percent) =>
                      setPercents((prev) =>
                        setPercent(prev, surfactant.id, percent),
                      )
                    }
                  />
                ))}
              </div>
            </StepCard>
          </>
        }
        results={
          <BenchResults
            title="Your cleanser"
            subtitle="Weigh-up table for the batch above."
          >
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={
                    result.gentlenessLabel === "gentle"
                      ? "ok"
                      : result.gentlenessLabel === "moderate"
                        ? "outline"
                        : "warn"
                  }
                >
                  {GENTLENESS_LABEL[result.gentlenessLabel]} ·{" "}
                  {result.gentlenessScore}/100
                </Badge>
                <Badge variant={result.compatible ? "outline" : "danger"}>
                  {result.compatible ? "Compatible" : "Conflict"}
                </Badge>
              </div>
              <dl>
                <ResultRow
                  label="Total active matter"
                  value={`${result.totalAsm.toFixed(1)}%`}
                />
                <ResultRow
                  label="Charge mix"
                  value={
                    result.charges.length > 0
                      ? result.charges.join(" + ")
                      : "—"
                  }
                />
                <ResultRow
                  label="Suggested pH window"
                  value={
                    result.recommendedPhRange
                      ? `${result.recommendedPhRange[0].toFixed(1)} – ${result.recommendedPhRange[1].toFixed(1)}`
                      : "—"
                  }
                />
              </dl>
              {result.synergyNote ? (
                <p className="rounded-xl bg-ok-soft px-3 py-3 text-sm leading-relaxed text-ink">
                  {result.synergyNote}
                </p>
              ) : null}
              {result.phNote ? (
                <p
                  className={cn(
                    "rounded-xl px-3 py-3 text-sm leading-relaxed text-ink",
                    result.phNote.includes("outside")
                      ? "bg-warn-soft"
                      : "bg-bg-subtle",
                  )}
                >
                  {result.phNote}
                </p>
              ) : null}
              {result.rows.length > 0 ? (
                <dl>
                  {result.rows.map((row) => (
                    <ResultRow
                      key={row.id}
                      label={`${row.name} (${row.percent.toFixed(1)}%)`}
                      value={`${row.grams.toFixed(1)} g`}
                    />
                  ))}
                </dl>
              ) : null}
              <WarningList warnings={result.warnings} />
            </div>
          </BenchResults>
        }
      />
    </div>
  );
}
