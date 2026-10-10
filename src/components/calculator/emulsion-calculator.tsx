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
  computeEmulsion,
  HLB_VERDICT_LABEL,
} from "@/lib/emulsion-engine";
import {
  EMULSIFIERS,
  OIL_REQUIRED_HLB,
  PRESERVATIVES,
} from "@/data/emulsifiers";

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

export function EmulsionCalculator() {
  const [batchGrams, setBatchGrams] = useState(100);
  const [oilPhasePercent, setOilPhasePercent] = useState(20);
  const [evaporationPercent, setEvaporationPercent] = useState(10);
  const [oilPercents, setOilPercents] = useState<Record<string, number>>({
    "sweet-almond-hlb": 70,
    "shea-hlb": 30,
  });
  const [emulsifierPercents, setEmulsifierPercents] = useState<
    Record<string, number>
  >({ "glyceryl-stearate-peg100": 4 });
  const [preservativeId, setPreservativeId] = useState<string | "">(
    "germaben-ii",
  );
  const [preservativePercent, setPreservativePercent] = useState(1);

  const result = useMemo(
    () =>
      computeEmulsion({
        batchGrams,
        oilPhasePercent,
        evaporationPercent,
        oils: Object.entries(oilPercents).map(([id, percent]) => ({
          id,
          percent,
        })),
        emulsifiers: Object.entries(emulsifierPercents).map(([id, percent]) => ({
          id,
          percent,
        })),
        preservativeId: preservativeId === "" ? null : preservativeId,
        preservativePercent,
      }),
    [
      batchGrams,
      oilPhasePercent,
      evaporationPercent,
      oilPercents,
      emulsifierPercents,
      preservativeId,
      preservativePercent,
    ],
  );

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-4 pt-6 pb-8 sm:px-6 lg:px-8 lg:pb-12">
      <BenchHeader
        kicker="03 · Creams"
        title="Emulsion bench"
        lede="Match your emulsifier blend to the oil phase by HLB, keep the preservative inside skin-safe limits, and let the water phase cover what steams off. Oil percents are shares of the oil phase; everything else is percent of the whole batch."
      />
      <BenchLayout
        steps={
          <>
            <StepCard
              step={1}
              title="Batch & phases"
              subtitle="How much you're making and how the formula splits."
            >
              <div className="flex flex-col gap-5">
                <div>
                  <label
                    htmlFor="emulsion-batch"
                    className="mb-1.5 block text-sm font-medium text-ink"
                  >
                    Batch size
                  </label>
                  <div className="w-40">
                    <MassField
                      id="emulsion-batch"
                      value={batchGrams}
                      unit="g"
                      ariaLabel="Batch size in grams"
                      onChange={setBatchGrams}
                    />
                  </div>
                </div>
                <div>
                  <span className="mb-1.5 block text-sm font-medium text-ink">
                    Oil phase — {oilPhasePercent.toFixed(1)}% of the batch
                  </span>
                  <SliderField
                    min={5}
                    max={60}
                    step={1}
                    value={oilPhasePercent}
                    onChange={setOilPhasePercent}
                    unit="%"
                    ariaLabel="Oil phase percent of batch"
                  />
                </div>
                <div>
                  <span className="mb-1.5 block text-sm font-medium text-ink">
                    Evaporation allowance — {evaporationPercent.toFixed(0)}%
                  </span>
                  <SliderField
                    min={0}
                    max={30}
                    step={1}
                    value={evaporationPercent}
                    onChange={setEvaporationPercent}
                    unit="%"
                    ariaLabel="Evaporation allowance percent"
                  />
                  <p className="mt-1.5 text-xs leading-relaxed text-faint">
                    Water lost to steam while you heat and stir — the bench
                    adds it back upfront so the finished cream lands on weight.
                  </p>
                </div>
              </div>
            </StepCard>
            <StepCard
              step={2}
              title="Oil phase"
              subtitle="What needs emulsifying — percents within the oil phase."
            >
              <div className="flex flex-col gap-2">
                {OIL_REQUIRED_HLB.map((oil) => (
                  <PercentRow
                    key={oil.id}
                    name={oil.name}
                    note={`needs HLB ${oil.required_hlb}`}
                    percent={oilPercents[oil.id]}
                    onToggle={(on) =>
                      setOilPercents((prev) =>
                        setPercent(prev, oil.id, on ? 50 : undefined),
                      )
                    }
                    onPercent={(percent) =>
                      setOilPercents((prev) => setPercent(prev, oil.id, percent))
                    }
                  />
                ))}
              </div>
            </StepCard>
            <StepCard
              step={3}
              title="Emulsifier blend"
              subtitle="Percent of the whole batch — the bench blends their HLBs."
            >
              <div className="flex flex-col gap-2">
                {EMULSIFIERS.map((emulsifier) => (
                  <PercentRow
                    key={emulsifier.id}
                    name={emulsifier.name}
                    note={`HLB ${emulsifier.hlb} · ${emulsifier.charge}`}
                    percent={emulsifierPercents[emulsifier.id]}
                    max={15}
                    onToggle={(on) =>
                      setEmulsifierPercents((prev) =>
                        setPercent(prev, emulsifier.id, on ? 3 : undefined),
                      )
                    }
                    onPercent={(percent) =>
                      setEmulsifierPercents((prev) =>
                        setPercent(prev, emulsifier.id, percent),
                      )
                    }
                  />
                ))}
              </div>
            </StepCard>
            <StepCard
              step={4}
              title="Preservative"
              subtitle="Anything with water needs one. Stay at or under the max."
            >
              <div className="flex flex-col gap-4">
                <div>
                  <label
                    htmlFor="emulsion-preservative"
                    className="mb-1.5 block text-sm font-medium text-ink"
                  >
                    Preservative
                  </label>
                  <select
                    id="emulsion-preservative"
                    value={preservativeId}
                    onChange={(event) => setPreservativeId(event.target.value)}
                    className="h-12 w-full rounded-xl border border-line bg-surface px-3 text-sm text-ink"
                  >
                    <option value="">None — I'll risk it</option>
                    {PRESERVATIVES.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (max {p.max_usage_percent}%)
                      </option>
                    ))}
                  </select>
                </div>
                {preservativeId !== "" ? (
                  <div>
                    <span className="mb-1.5 block text-sm font-medium text-ink">
                      Amount — {preservativePercent.toFixed(2)}%
                    </span>
                    <SliderField
                      min={0}
                      max={2}
                      step={0.05}
                      value={preservativePercent}
                      onChange={setPreservativePercent}
                      unit="%"
                      ariaLabel="Preservative percent"
                    />
                  </div>
                ) : null}
              </div>
            </StepCard>
          </>
        }
        results={
          <BenchResults
            title="Your cream"
            subtitle="Weigh-up table for the batch above."
          >
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={
                    result.hlbVerdict === "good"
                      ? "ok"
                      : result.hlbVerdict === "unknown"
                        ? "outline"
                        : "warn"
                  }
                >
                  HLB: {HLB_VERDICT_LABEL[result.hlbVerdict]}
                </Badge>
                <Badge
                  variant={
                    result.preservativeVerdict === "ok"
                      ? "ok"
                      : result.preservativeVerdict === "missing"
                        ? "warn"
                        : "outline"
                  }
                >
                  Preservative:{" "}
                  {result.preservativeVerdict === "ok"
                    ? "Safe"
                    : result.preservativeVerdict === "over"
                      ? "Over max"
                      : result.preservativeVerdict === "missing"
                        ? "None"
                        : "—"}
                </Badge>
              </div>
              <dl>
                <ResultRow
                  label="Oil phase needs HLB"
                  value={
                    result.requiredHlb !== null
                      ? result.requiredHlb.toFixed(1)
                      : "—"
                  }
                />
                <ResultRow
                  label="Your blend's HLB"
                  value={
                    result.blendHlb !== null ? result.blendHlb.toFixed(1) : "—"
                  }
                />
                <ResultRow
                  label="Water to add"
                  value={`${(result.waterGrams + result.makeupWaterGrams).toFixed(1)} g`}
                />
                <ResultRow
                  label="· base water"
                  value={`${result.waterGrams.toFixed(1)} g`}
                />
                <ResultRow
                  label="· evaporation makeup"
                  value={`+${result.makeupWaterGrams.toFixed(1)} g`}
                />
              </dl>
              {result.oilRows.length > 0 ? (
                <dl>
                  <dt className="mb-1 text-xs font-medium tracking-[0.18em] text-muted uppercase">
                    Oil phase
                  </dt>
                  {result.oilRows.map((row) => (
                    <ResultRow
                      key={row.id}
                      label={`${row.name} (${row.percent.toFixed(1)}% of phase)`}
                      value={`${row.grams.toFixed(1)} g`}
                    />
                  ))}
                </dl>
              ) : null}
              {result.emulsifierRows.length > 0 ? (
                <dl>
                  <dt className="mb-1 text-xs font-medium tracking-[0.18em] text-muted uppercase">
                    Emulsifiers
                  </dt>
                  {result.emulsifierRows.map((row) => (
                    <ResultRow
                      key={row.id}
                      label={`${row.name} (${row.percent.toFixed(2)}%)`}
                      value={`${row.grams.toFixed(2)} g`}
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
