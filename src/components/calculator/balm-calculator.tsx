import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { StepCard } from "@/components/calculator/step-card";
import { MassField } from "@/components/calculator/mass-field";
import {
  BenchHeader,
  BenchLayout,
  BenchResults,
  PercentRow,
  ResultRow,
  WarningList,
} from "@/components/calculator/bench-shell";
import { computeBalm, FIRMNESS_LABEL, type CoolMethod } from "@/lib/balm-engine";
import {
  BALM_LIQUID_OILS,
  BUTTERS,
  WAXES,
} from "@/data/waxes";
import { cn } from "@/lib/utils";

const GRAININESS_LABEL = {
  low: "Low",
  moderate: "Moderate",
  high: "High",
} as const;

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

export function BalmCalculator() {
  const [batchGrams, setBatchGrams] = useState(100);
  const [coolMethod, setCoolMethod] = useState<CoolMethod>("fast");
  const [percents, setPercents] = useState<Record<string, number>>({
    "beeswax-yellow": 20,
    "shea-unrefined": 30,
    "sweet-almond-balm": 50,
  });

  const result = useMemo(
    () =>
      computeBalm({
        batchGrams,
        coolMethod,
        components: Object.entries(percents).map(([id, percent]) => ({
          id,
          percent,
        })),
      }),
    [batchGrams, coolMethod, percents],
  );

  const group = (
    title: string,
    records: typeof WAXES,
    note: (id: string) => string | undefined,
  ) => (
    <div>
      <h3 className="mb-2 text-xs font-medium tracking-[0.18em] text-muted uppercase">
        {title}
      </h3>
      <div className="flex flex-col gap-2">
        {records.map((record) => (
          <PercentRow
            key={record.id}
            name={record.name}
            note={note(record.id)}
            percent={percents[record.id]}
            onToggle={(on) =>
              setPercents((prev) =>
                setPercent(prev, record.id, on ? 10 : undefined),
              )
            }
            onPercent={(percent) =>
              setPercents((prev) => setPercent(prev, record.id, percent))
            }
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-4 pt-6 pb-8 sm:px-6 lg:px-8 lg:pb-12">
      <BenchHeader
        kicker="02 · Balms"
        title="Balm bench"
        lede="Wax, butter, and oil in proportions that actually set — plus a read on when your balm melts and a heads-up before it goes grainy. Percents don't have to add to 100; the bench normalizes for you."
      />
      <BenchLayout
        steps={
          <>
            <StepCard
              step={1}
              title="Batch & cooling"
              subtitle="How much you're making, and how fast it cools."
            >
              <div className="flex flex-col gap-4">
                <div>
                  <label
                    htmlFor="balm-batch"
                    className="mb-1.5 block text-sm font-medium text-ink"
                  >
                    Batch size
                  </label>
                  <div className="w-40">
                    <MassField
                      id="balm-batch"
                      value={batchGrams}
                      unit="g"
                      ariaLabel="Batch size in grams"
                      onChange={setBatchGrams}
                    />
                  </div>
                </div>
                <div>
                  <span className="mb-1.5 block text-sm font-medium text-ink">
                    Cooling method
                  </span>
                  <div className="flex gap-2">
                    {(
                      [
                        ["slow", "Slow cool — room temp"],
                        ["fast", "Fast cool — fridge temper"],
                      ] as [CoolMethod, string][]
                    ).map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setCoolMethod(value)}
                        aria-pressed={coolMethod === value}
                        className={cn(
                          "h-12 flex-1 rounded-xl border px-3 text-sm font-medium transition-colors",
                          coolMethod === value
                            ? "border-primary bg-primary-soft text-primary"
                            : "border-line bg-surface text-muted hover:text-ink",
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-faint">
                    Fast cooling sets small, even crystals — the classic defense
                    against graininess.
                  </p>
                </div>
              </div>
            </StepCard>
            <StepCard
              step={2}
              title="Formula"
              subtitle="Waxes give structure, butters give body, oils keep it spreadable."
            >
              <div className="flex flex-col gap-5">
                {group(
                  "Waxes",
                  WAXES,
                  (id) =>
                    `${WAXES.find((w) => w.id === id)?.melt_point_c} °C melt`,
                )}
                {group(
                  "Butters",
                  BUTTERS,
                  (id) =>
                    `${BUTTERS.find((w) => w.id === id)?.melt_point_c} °C melt`,
                )}
                {group("Liquid oils", BALM_LIQUID_OILS, () => "liquid at room temp")}
              </div>
            </StepCard>
          </>
        }
        results={
          <BenchResults
            title="Your balm"
            subtitle="Weigh-up table for the batch above."
          >
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">
                  {FIRMNESS_LABEL[result.firmness]}
                </Badge>
                <Badge
                  variant={
                    result.graininessRisk === "high" ? "warn" : "outline"
                  }
                >
                  Graininess: {GRAININESS_LABEL[result.graininessRisk]}
                </Badge>
              </div>
              <dl>
                <ResultRow
                  label="Estimated melt point"
                  value={`${result.estimatedMeltPointC.toFixed(1)} °C / ${result.estimatedMeltPointF.toFixed(1)} °F`}
                />
                <ResultRow
                  label="Wax / butter / oil"
                  value={`${result.waxPercent.toFixed(1)} / ${result.butterPercent.toFixed(1)} / ${result.liquidOilPercent.toFixed(1)} %`}
                />
              </dl>
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
