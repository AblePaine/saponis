import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { Lock, TriangleAlert } from "lucide-react";
import {
  BenchHeader,
  BenchLayout,
  BenchResults,
  CopyBenchLink,
  ResultRow,
} from "@/components/calculator/bench-shell";
import { MassField } from "@/components/calculator/mass-field";
import { StepCard } from "@/components/calculator/step-card";
import { UpgradePanel } from "@/components/pro/upgrade-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  decodeCostingState,
  encodeCostingState,
  readBenchEncoded,
  writeBenchEncoded,
} from "@/lib/bench-url";
import {
  DEFAULT_COST_INPUT,
  DEFAULT_MOLD_FILL,
  SAMPLE_OIL_GRAMS,
  computeCost,
  computeMoldFill,
  type CostInput,
  type CostRow,
  type MoldFillInput,
} from "@/lib/costing-engine";
import { formatMass } from "@/lib/format";
import type { FillMode, MoldShape } from "@/lib/mold-engine";
import { useEntitlements } from "@/lib/use-entitlements";
import { cn } from "@/lib/utils";
import {
  DEFAULT_WHOLESALE_INPUT,
  computeWholesale,
  type WholesaleTierInput,
} from "@/lib/wholesale-engine";

function money(value: number): string {
  return `$${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function NumField({
  label,
  value,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  unit: string;
  onChange: (next: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium tracking-wide text-muted">{label}</span>
      <MassField value={value} unit={unit} ariaLabel={label} onChange={onChange} />
    </label>
  );
}

function Segmented<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (next: T) => void;
  ariaLabel: string;
}) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn(
        "grid gap-1 rounded-lg bg-bg-subtle p-1",
        options.length === 2 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-4",
      )}
    >
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          className={cn(
            "rounded-md px-2 py-2 text-sm font-medium transition-colors",
            value === option.id
              ? "bg-surface text-ink shadow-[var(--shadow-border)]"
              : "text-muted hover:text-ink",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

const SHAPES: { id: MoldShape; label: string }[] = [
  { id: "loaf", label: "Loaf" },
  { id: "slab", label: "Slab" },
  { id: "cylinder", label: "Cylinder" },
  { id: "water_fill", label: "Water fill" },
];

export function CostingCalculator() {
  const [mold, setMold] = useState<MoldFillInput>(DEFAULT_MOLD_FILL);
  const [cost, setCost] = useState<CostInput>(DEFAULT_COST_INPUT);
  const [floorMargin, setFloorMargin] = useState(
    DEFAULT_WHOLESALE_INPUT.floorMarginPercent,
  );
  const [tiers, setTiers] = useState<WholesaleTierInput[]>(
    DEFAULT_WHOLESALE_INPUT.tiers,
  );
  const [retailOverride, setRetailOverride] = useState<number | null>(null);
  const [scaleNote, setScaleNote] = useState("");
  const { entitlements, isPending: billingPending } = useEntitlements();

  // Share links (?r=, see src/lib/bench-url.ts): hydrate once, then sync.
  const [booted, setBooted] = useState(false);
  useLayoutEffect(() => {
    const shared = decodeCostingState(readBenchEncoded());
    if (shared) {
      setMold(shared.mold);
      setCost(shared.cost);
      setFloorMargin(shared.wholesale.floorMarginPercent);
      if (shared.wholesale.tiers.length > 0) setTiers(shared.wholesale.tiers);
    }
    setBooted(true);
  }, []);
  const shareEncoded = useMemo(
    () =>
      encodeCostingState({
        mold,
        cost,
        wholesale: { floorMarginPercent: floorMargin, tiers },
      }),
    [mold, cost, floorMargin, tiers],
  );
  useEffect(() => {
    if (!booted) return;
    writeBenchEncoded(shareEncoded);
  }, [booted, shareEncoded]);

  const moldResult = useMemo(() => computeMoldFill(mold), [mold]);
  const costResult = useMemo(() => computeCost(cost), [cost]);

  const retail =
    retailOverride ?? (costResult.suggestedRetail || DEFAULT_WHOLESALE_INPUT.retailPrice);
  const wholesale = useMemo(
    () =>
      computeWholesale({
        retailPrice: retail,
        unitCost: costResult.unitCost || DEFAULT_WHOLESALE_INPUT.unitCost,
        floorMarginPercent: floorMargin,
        tiers,
      }),
    [retail, costResult.unitCost, floorMargin, tiers],
  );
  const isPro = entitlements?.pro ?? false;

  function scaleCostToMold() {
    const factor = moldResult.oilChargeGrams / SAMPLE_OIL_GRAMS;
    if (factor > 0 && Math.abs(factor - 1) > 0.001) {
      setCost((current) => ({
        ...current,
        rows: current.rows.map((row) =>
          row.mode === "flat"
            ? row
            : { ...row, amountGrams: Math.round(row.amountGrams * factor * 10) / 10 },
        ),
      }));
      setScaleNote(
        `Batch scaled ×${factor.toFixed(2)} to this mold's ${formatMass(moldResult.oilChargeGrams, "g")} oil charge (flat-cost rows don't scale).`,
      );
    }
    document.getElementById("costing-cost")?.scrollIntoView({ behavior: "smooth" });
  }

  function setRow(index: number, patch: Partial<CostRow>) {
    setCost((current) => ({
      ...current,
      rows: current.rows.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    }));
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-4 pt-6 pb-8 sm:px-6 lg:px-8 lg:pb-12">
      <BenchHeader
        kicker="06 · Costing"
        title="Costing suite"
        lede="Size it → cost it → price it. Mold-fill sizing runs the mold engine's own math with no recipe loaded; cost-per-bar counts every cost in the batch — labor, packaging, overhead — and divides by good bars only; the wholesale ladder prints discount off retail and the margin it really leaves, side by side. Prices preloaded are SAMPLE craft-supplier prices for checking the math — a math tool, your numbers."
      />
      <BenchLayout
        steps={
          <>
            <div id="costing-mold">
              <StepCard
                step={1}
                title="Mold fill"
                subtitle="How much oil does this mold actually need?"
              >
                <div className="flex flex-col gap-4">
                  <Segmented
                    ariaLabel="Mold shape"
                    options={SHAPES}
                    value={mold.shape}
                    onChange={(shape) => setMold((m) => ({ ...m, shape }))}
                  />
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {mold.shape === "loaf" || mold.shape === "slab" ? (
                      <>
                        <NumField label="Length" value={mold.length} unit={mold.unit} onChange={(v) => setMold((m) => ({ ...m, length: v }))} />
                        <NumField label="Width" value={mold.width} unit={mold.unit} onChange={(v) => setMold((m) => ({ ...m, width: v }))} />
                        <NumField label="Height" value={mold.height} unit={mold.unit} onChange={(v) => setMold((m) => ({ ...m, height: v }))} />
                      </>
                    ) : null}
                    {mold.shape === "cylinder" ? (
                      <>
                        <NumField label="Diameter" value={mold.diameter} unit={mold.unit} onChange={(v) => setMold((m) => ({ ...m, diameter: v }))} />
                        <NumField label="Height" value={mold.height} unit={mold.unit} onChange={(v) => setMold((m) => ({ ...m, height: v }))} />
                      </>
                    ) : null}
                    {mold.shape === "water_fill" ? (
                      <NumField label="Water fill (whole mold)" value={mold.waterGrams} unit="g" onChange={(v) => setMold((m) => ({ ...m, waterGrams: v }))} />
                    ) : null}
                    <NumField label="Cavities" value={mold.cavities} unit="" onChange={(v) => setMold((m) => ({ ...m, cavities: Math.max(1, Math.floor(v)) }))} />
                    <NumField label="Bars from this mold (0 = cavities)" value={mold.bars} unit="" onChange={(v) => setMold((m) => ({ ...m, bars: Math.max(0, Math.floor(v)) }))} />
                    <NumField label="Cure water loss" value={mold.cureLossPercent} unit="%" onChange={(v) => setMold((m) => ({ ...m, cureLossPercent: v }))} />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="mb-1.5 text-xs font-medium tracking-wide text-muted">Length unit</p>
                      <Segmented ariaLabel="Length unit" options={[{ id: "in", label: "Inches" }, { id: "cm", label: "Centimetres" }]} value={mold.unit} onChange={(unit) => setMold((m) => ({ ...m, unit }))} />
                    </div>
                    <div>
                      <p className="mb-1.5 text-xs font-medium tracking-wide text-muted">Fill</p>
                      <Segmented ariaLabel="Fill mode" options={[{ id: "headspace", label: "10% headspace" }, { id: "brim", label: "To the brim" }]} value={mold.fill} onChange={(fill: FillMode) => setMold((m) => ({ ...m, fill }))} />
                    </div>
                  </div>
                  <Button type="button" className="h-11" onClick={scaleCostToMold}>
                    Cost a batch this size →
                  </Button>
                </div>
              </StepCard>
            </div>

            <div id="costing-cost">
              <StepCard
                step={2}
                title="Cost per bar"
                subtitle="Every cost in the batch — not just ingredients."
              >
                <div className="flex flex-col gap-4">
                  {scaleNote ? (
                    <p className="rounded-xl bg-primary-soft px-3 py-3 text-sm text-ink">{scaleNote}</p>
                  ) : null}
                  <div className="flex flex-col gap-2">
                    {cost.rows.map((row, index) => (
                      <div key={index} className="rounded-xl border border-line bg-surface px-3 py-3">
                        <div className="flex items-center gap-2">
                          <Input
                            value={row.name}
                            aria-label="Ingredient name"
                            onChange={(e) => setRow(index, { name: e.target.value })}
                            className="h-10 flex-1"
                          />
                          <button
                            type="button"
                            onClick={() => setRow(index, { mode: row.mode === "flat" ? "weight" : "flat" })}
                            className="rounded-md bg-bg-subtle px-2.5 py-2 text-xs font-medium text-muted"
                          >
                            {row.mode === "flat" ? "flat $" : "by weight"}
                          </button>
                          <button
                            type="button"
                            aria-label={`Remove ${row.name}`}
                            onClick={() =>
                              setCost((c) => ({ ...c, rows: c.rows.filter((_, i) => i !== index) }))
                            }
                            className="px-1 text-warn"
                          >
                            ✕
                          </button>
                        </div>
                        {row.mode === "flat" ? (
                          <div className="mt-2 grid grid-cols-2 gap-2">
                            <NumField label="Flat cost / batch" value={row.flatCost} unit="$" onChange={(v) => setRow(index, { flatCost: v })} />
                          </div>
                        ) : (
                          <div className="mt-2 grid grid-cols-3 gap-2">
                            <NumField label="In batch" value={row.amountGrams} unit="g" onChange={(v) => setRow(index, { amountGrams: v })} />
                            <NumField label="Price paid" value={row.pricePaid} unit="$" onChange={(v) => setRow(index, { pricePaid: v })} />
                            <NumField label="Amount bought" value={row.purchasedGrams} unit="g" onChange={(v) => setRow(index, { purchasedGrams: v })} />
                          </div>
                        )}
                        <p className="mt-2 text-right font-mono text-sm text-muted">
                          {money(costResult.lines[index]?.cost ?? 0)}
                        </p>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      className="h-10"
                      onClick={() =>
                        setCost((c) => ({
                          ...c,
                          rows: [
                            ...c.rows,
                            { name: "New ingredient", amountGrams: 0, pricePaid: 0, purchasedGrams: 0, mode: "weight", flatCost: 0 },
                          ],
                        }))
                      }
                    >
                      + Add ingredient
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <NumField label="Packaging / bar" value={cost.packagingPerBar} unit="$" onChange={(v) => setCost((c) => ({ ...c, packagingPerBar: v }))} />
                    <NumField label="Labor / batch" value={cost.laborMinutes} unit="min" onChange={(v) => setCost((c) => ({ ...c, laborMinutes: v }))} />
                    <NumField label="Labor rate" value={cost.laborRatePerHour} unit="$/hr" onChange={(v) => setCost((c) => ({ ...c, laborRatePerHour: v }))} />
                    <NumField label="Overhead / batch" value={cost.overheadPerBatch} unit="$" onChange={(v) => setCost((c) => ({ ...c, overheadPerBatch: v }))} />
                    <NumField label="Bars poured" value={cost.yieldBars} unit="" onChange={(v) => setCost((c) => ({ ...c, yieldBars: v }))} />
                    <NumField label="Shrink / unusable bars" value={cost.shrinkBars} unit="" onChange={(v) => setCost((c) => ({ ...c, shrinkBars: v }))} />
                    <NumField label="Target margin" value={cost.targetMarginPercent} unit="%" onChange={(v) => setCost((c) => ({ ...c, targetMarginPercent: v }))} />
                    <NumField label="Cure carrying rate / yr (0 = off)" value={cost.carryingRatePercent} unit="%" onChange={(v) => setCost((c) => ({ ...c, carryingRatePercent: v }))} />
                    <NumField label="Cure weeks" value={cost.cureWeeks} unit="" onChange={(v) => setCost((c) => ({ ...c, cureWeeks: v }))} />
                    <NumField label="Channel fee (0 = off)" value={cost.channelFeePercent} unit="%" onChange={(v) => setCost((c) => ({ ...c, channelFeePercent: v }))} />
                    <NumField label="Channel fee fixed / sale" value={cost.channelFeeFixed} unit="$" onChange={(v) => setCost((c) => ({ ...c, channelFeeFixed: v }))} />
                  </div>
                </div>
              </StepCard>
            </div>

            <div id="costing-wholesale">
              <StepCard
                step={3}
                title="Wholesale pricing"
                subtitle="Discount off retail — and the margin it really leaves."
              >
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-3">
                    <NumField
                      label="Retail price"
                      value={retail}
                      unit="$"
                      onChange={(v) => setRetailOverride(v)}
                    />
                    <NumField
                      label="Floor margin (flag below)"
                      value={floorMargin}
                      unit="%"
                      onChange={setFloorMargin}
                    />
                  </div>
                  <p className="text-sm text-muted">
                    Retail and cost flow in from step 2 (cost{" "}
                    {money(costResult.unitCost || DEFAULT_WHOLESALE_INPUT.unitCost)} at the
                    suggested retail {money(costResult.suggestedRetail)}). Your direct margin
                    at this retail is{" "}
                    <span className="font-medium text-ink">
                      {wholesale.retailMarginPercent.toFixed(1)}%
                    </span>
                    {tiers[0]
                      ? `, and the ${tiers[0].name} tier at ${tiers[0].discountPercent}% off would price at ${money(wholesale.tiers[0]?.price ?? 0)}.`
                      : "."}
                  </p>
                  {billingPending ? (
                    <p className="text-sm text-muted">Checking your plan…</p>
                  ) : isPro ? (
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-2">
                        {tiers.map((tier, index) => (
                          <div key={index} className="rounded-xl border border-line px-3 py-3">
                            <div className="grid grid-cols-3 gap-2">
                              <NumField label="Discount off retail" value={tier.discountPercent} unit="%" onChange={(v) => setTiers((t) => t.map((x, i) => (i === index ? { ...x, discountPercent: v } : x)))} />
                              <NumField label="Min qty" value={tier.minQty} unit="" onChange={(v) => setTiers((t) => t.map((x, i) => (i === index ? { ...x, minQty: Math.floor(v) } : x)))} />
                              <div className="flex flex-col justify-end pb-1">
                                <span className="font-mono text-sm text-ink">{money(wholesale.tiers[index]?.price ?? 0)}</span>
                                <span className="text-xs text-muted">
                                  margin {(wholesale.tiers[index]?.marginPercent ?? 0).toFixed(1)}% · keeps {money(wholesale.tiers[index]?.profitPerUnit ?? 0)}
                                </span>
                              </div>
                            </div>
                            {wholesale.tiers[index]?.belowFloor ? (
                              <p className="mt-2 flex gap-2 rounded-lg bg-warn-soft px-3 py-2 text-sm text-ink">
                                <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warn" />
                                {tier.name} is below your {floorMargin}% floor — at{" "}
                                {money(wholesale.tiers[index]?.price ?? 0)} you keep{" "}
                                {money(wholesale.tiers[index]?.profitPerUnit ?? 0)} a bar.
                              </p>
                            ) : null}
                          </div>
                        ))}
                      </div>
                      <dl>
                        <ResultRow label={`Floor price @ ${floorMargin}% margin`} value={money(wholesale.floorPrice)} />
                        <ResultRow label="Retail needed for the first tier to hold the floor" value={money(wholesale.requiredRetailForFirstTier)} />
                      </dl>
                    </div>
                  ) : (
                    <>
                      <div className="rounded-xl bg-bg-subtle px-4 py-4">
                        <p className="flex items-center gap-2 text-sm font-medium text-ink">
                          <Lock className="size-4 text-muted" /> The full ladder is a
                          Saponis Pro feature
                        </p>
                        <p className="mt-1.5 text-sm leading-relaxed text-muted">
                          Pro adds every tier with its margin and floor flag, the floor
                          price, and the required-retail solve — the numbers that show
                          when a distributor discount quietly eats the maker.
                        </p>
                      </div>
                      {entitlements ? (
                        <UpgradePanel entitlements={entitlements} />
                      ) : null}
                    </>
                  )}
                </div>
              </StepCard>
            </div>
          </>
        }
        results={
          <BenchResults title="Your numbers" subtitle="Updates as you type.">
            <div className="flex flex-col gap-5">
              <div>
                <h3 className="text-xs font-medium tracking-[0.18em] text-muted uppercase">Mold fill</h3>
                <dl className="mt-1">
                  <ResultRow label="Mold volume" value={`${moldResult.totalVolumeCm3.toLocaleString("en-US", { maximumFractionDigits: 1 })} cm³`} />
                  <ResultRow label="Batter to mix" value={formatMass(moldResult.batterGrams, "g")} />
                  <ResultRow label="Oil charge" value={formatMass(moldResult.oilChargeGrams, "g")} />
                  <ResultRow label="Cured weight / bar" value={formatMass(moldResult.perBarCuredGrams, "g")} />
                </dl>
              </div>
              <div>
                <h3 className="text-xs font-medium tracking-[0.18em] text-muted uppercase">Cost per bar</h3>
                <dl className="mt-1">
                  <ResultRow label="Ingredients" value={`${money(costResult.ingredientSubtotal)} (${costResult.stackShares.ingredients.toFixed(0)}%)`} />
                  <ResultRow label="Packaging" value={`${money(costResult.packagingTotal)} (${costResult.stackShares.packaging.toFixed(0)}%)`} />
                  <ResultRow label="Labor" value={`${money(costResult.laborTotal)} (${costResult.stackShares.labor.toFixed(0)}%)`} />
                  <ResultRow label="Overhead + carrying" value={`${money(costResult.overheadPerBatch + costResult.carryingCost)} (${(costResult.stackShares.overhead + costResult.stackShares.carrying).toFixed(0)}%)`} />
                  <ResultRow label="Batch total" value={money(costResult.batchTotal)} />
                  <ResultRow label="True cost / bar" value={money(costResult.unitCost)} />
                  <ResultRow label="Ingredients only / bar" value={money(costResult.ingredientsPerBar)} />
                  <ResultRow label="Suggested retail" value={costResult.channelFeeAtRetail > 0 ? `${money(costResult.suggestedRetail)} → ${money(costResult.netRetailAfterFees)} after fees` : money(costResult.suggestedRetail)} />
                </dl>
              </div>
              <CopyBenchLink encoded={shareEncoded} label="Share this costing" />
            </div>
          </BenchResults>
        }
      />
    </div>
  );
}
