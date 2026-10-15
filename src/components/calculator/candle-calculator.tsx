import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { StepCard } from "@/components/calculator/step-card";
import { MassField } from "@/components/calculator/mass-field";
import { SliderField } from "@/components/calculator/slider-field";
import {
  BenchHeader,
  BenchLayout,
  BenchResults,
  ResultRow,
  WarningList,
} from "@/components/calculator/bench-shell";
import { computeCandle, FO_BASIS_LABEL, type FoBasis } from "@/lib/candle-engine";
import { CANDLE_WAXES } from "@/data/candle-waxes";
import { cn } from "@/lib/utils";

export function CandleCalculator() {
  const [waterGrams, setWaterGrams] = useState(240);
  const [vesselCount, setVesselCount] = useState(4);
  const [waxId, setWaxId] = useState("soy-container-seed");
  const [customSg, setCustomSg] = useState(0);
  const [headspacePercent, setHeadspacePercent] = useState(10);
  const [wastePercent, setWastePercent] = useState(3);
  const [foBasis, setFoBasis] = useState<FoBasis>("wax");
  const [foLoadPercent, setFoLoadPercent] = useState(8);
  const [maxFoPercent, setMaxFoPercent] = useState(0);
  const [ifraCapPercent, setIfraCapPercent] = useState(0);

  const result = useMemo(
    () =>
      computeCandle({
        waterMassGramsPerVessel: waterGrams,
        vesselCount,
        waxId,
        specificGravityOverride: customSg,
        headspacePercent,
        wastePercent,
        foBasis,
        foLoadPercent,
        maxFoPercentOfWax: maxFoPercent,
        ifraCapPercentOfFinished: ifraCapPercent,
      }),
    [
      waterGrams,
      vesselCount,
      waxId,
      customSg,
      headspacePercent,
      wastePercent,
      foBasis,
      foLoadPercent,
      maxFoPercent,
      ifraCapPercent,
    ],
  );

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-4 pt-6 pb-8 sm:px-6 lg:px-8 lg:pb-12">
      <BenchHeader
        kicker="05 · Candles"
        title="Candle bench"
        lede="Two numbers decide a candle batch and both are usually fudged: what '8% fragrance' actually means, and how much wax a jar really holds. This bench makes you name the fragrance convention — percent of wax, or percent of finished weight — and prints both, and it sizes the fill from the weighed water in your vessel times the wax's specific gravity, not the jar's label."
      />
      <BenchLayout
        steps={
          <>
            <StepCard
              step={1}
              title="Vessel & wax"
              subtitle="Weigh the water, pick the wax, leave headspace."
            >
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-4">
                  <div>
                    <label
                      htmlFor="candle-water"
                      className="mb-1.5 block text-sm font-medium text-ink"
                    >
                      Water fill per vessel
                    </label>
                    <div className="w-40">
                      <MassField
                        id="candle-water"
                        value={waterGrams}
                        unit="g"
                        ariaLabel="Water fill per vessel in grams"
                        onChange={setWaterGrams}
                      />
                    </div>
                    <p className="mt-1.5 max-w-56 text-xs leading-relaxed text-faint">
                      Fill a vessel with water to your fill line and weigh it. That's the input —
                      not the ounce size on the jar.
                    </p>
                  </div>
                  <div>
                    <label
                      htmlFor="candle-count"
                      className="mb-1.5 block text-sm font-medium text-ink"
                    >
                      Vessels in the batch
                    </label>
                    <div className="w-40">
                      <MassField
                        id="candle-count"
                        value={vesselCount}
                        unit="ct"
                        ariaLabel="Number of vessels in the batch"
                        onChange={setVesselCount}
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <span className="mb-1.5 block text-sm font-medium text-ink">
                    Wax (specific gravity)
                  </span>
                  <div className="flex flex-col gap-2">
                    {CANDLE_WAXES.map((wax) => (
                      <button
                        key={wax.id}
                        type="button"
                        onClick={() => setWaxId(wax.id)}
                        aria-pressed={waxId === wax.id && customSg <= 0}
                        className={cn(
                          "flex min-h-12 items-center justify-between gap-3 rounded-xl border px-3 text-left text-sm font-medium transition-colors",
                          waxId === wax.id && customSg <= 0
                            ? "border-primary bg-primary-soft text-primary"
                            : "border-line bg-surface text-muted hover:text-ink",
                        )}
                      >
                        <span>{wax.name}</span>
                        <span className="font-mono text-sm tabular-nums">
                          SG {wax.specific_gravity.toFixed(2)} · seed
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="mt-3">
                    <label
                      htmlFor="candle-custom-sg"
                      className="mb-1.5 block text-sm font-medium text-ink"
                    >
                      Custom SG (supplier's number wins)
                    </label>
                    <div className="w-40">
                      <MassField
                        id="candle-custom-sg"
                        value={customSg}
                        unit="SG"
                        ariaLabel="Custom specific gravity override"
                        onChange={setCustomSg}
                      />
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-faint">
                      Library gravities are seed values. If your supplier publishes an SG for the
                      wax in your pot, enter it here — anything above zero overrides the library.
                    </p>
                  </div>
                </div>
                <div>
                  <span className="mb-1.5 block text-sm font-medium text-ink">Headspace</span>
                  <SliderField
                    min={0}
                    max={30}
                    step={0.5}
                    value={headspacePercent}
                    onChange={setHeadspacePercent}
                    unit="%"
                    ariaLabel="Headspace percent"
                  />
                </div>
                <div>
                  <span className="mb-1.5 block text-sm font-medium text-ink">
                    Waste / kettle heel
                  </span>
                  <SliderField
                    min={0}
                    max={20}
                    step={0.5}
                    value={wastePercent}
                    onChange={setWastePercent}
                    unit="%"
                    ariaLabel="Waste percent"
                  />
                  <p className="mt-1.5 text-xs leading-relaxed text-faint">
                    Inflates what you melt, never what lands in the jar.
                  </p>
                </div>
              </div>
            </StepCard>
            <StepCard
              step={2}
              title="Fragrance load — name the basis"
              subtitle="The same percent is two different candles. Pick which one your recipe means."
            >
              <div className="flex flex-col gap-4">
                <div className="flex gap-2">
                  {(
                    [
                      ["wax", "% of wax weight"],
                      ["finished", "% of finished weight"],
                    ] as [FoBasis, string][]
                  ).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setFoBasis(value)}
                      aria-pressed={foBasis === value}
                      className={cn(
                        "h-12 flex-1 rounded-xl border px-3 text-sm font-medium transition-colors",
                        foBasis === value
                          ? "border-primary bg-primary-soft text-primary"
                          : "border-line bg-surface text-muted hover:text-ink",
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div>
                  <span className="mb-1.5 block text-sm font-medium text-ink">Fragrance load</span>
                  <SliderField
                    min={0}
                    max={20}
                    step={0.5}
                    value={foLoadPercent}
                    onChange={setFoLoadPercent}
                    unit="%"
                    ariaLabel="Fragrance load percent"
                  />
                </div>
                <div className="flex flex-wrap gap-4">
                  <div>
                    <label
                      htmlFor="candle-max-fo"
                      className="mb-1.5 block text-sm font-medium text-ink"
                    >
                      Your wax's max load (optional)
                    </label>
                    <div className="w-40">
                      <MassField
                        id="candle-max-fo"
                        value={maxFoPercent}
                        unit="%"
                        ariaLabel="Maximum fragrance load, percent of wax"
                        onChange={setMaxFoPercent}
                      />
                    </div>
                    <p className="mt-1.5 max-w-56 text-xs leading-relaxed text-faint">
                      Percent of wax weight, from your wax supplier. Zero = no cap. The bench seeds
                      no limit of its own.
                    </p>
                  </div>
                  <div>
                    <label
                      htmlFor="candle-ifra"
                      className="mb-1.5 block text-sm font-medium text-ink"
                    >
                      This oil's IFRA cap (optional)
                    </label>
                    <div className="w-40">
                      <MassField
                        id="candle-ifra"
                        value={ifraCapPercent}
                        unit="%"
                        ariaLabel="IFRA cap, percent of finished weight"
                        onChange={setIfraCapPercent}
                      />
                    </div>
                    <p className="mt-1.5 max-w-56 text-xs leading-relaxed text-faint">
                      Percent of finished weight, from the oil's own IFRA certificate. Zero = no
                      cap.
                    </p>
                  </div>
                </div>
              </div>
            </StepCard>
          </>
        }
        results={
          <BenchResults
            title="Your batch"
            subtitle="Weigh-up table — convention printed, both ways."
          >
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Basis: {FO_BASIS_LABEL[result.foBasis]}</Badge>
                {result.overMaxFo ? <Badge variant="warn">Over your max load</Badge> : null}
                {result.overIfraCap ? <Badge variant="warn">Over your IFRA cap</Badge> : null}
              </div>
              <dl>
                <ResultRow
                  label="Load as % of wax"
                  value={`${result.foPercentOfWax.toFixed(2)} %`}
                />
                <ResultRow
                  label="Load as % of finished"
                  value={`${result.foPercentOfFinished.toFixed(2)} %`}
                />
                <ResultRow
                  label="Wax SG used"
                  value={`${result.specificGravity.toFixed(2)}${result.usingCustomSg ? " (custom)" : " (seed)"}`}
                />
              </dl>
              <dl>
                <ResultRow
                  label="Finished per vessel"
                  value={`${result.finishedPerVesselGrams.toFixed(1)} g`}
                />
                <ResultRow
                  label="Wax per vessel"
                  value={`${result.waxPerVesselGrams.toFixed(1)} g`}
                />
                <ResultRow
                  label="Fragrance per vessel"
                  value={`${result.fragrancePerVesselGrams.toFixed(1)} g`}
                />
              </dl>
              <dl>
                <ResultRow
                  label={`Wax to melt (${result.vesselCount} vessels + waste)`}
                  value={`${result.waxToMeltGrams.toFixed(1)} g`}
                />
                <ResultRow
                  label="Fragrance to weigh"
                  value={`${result.fragranceToWeighGrams.toFixed(1)} g`}
                />
                <ResultRow
                  label="Finished batch"
                  value={`${result.finishedTotalGrams.toFixed(1)} g`}
                />
              </dl>
              <WarningList warnings={result.warnings} />
              <p className="text-xs leading-relaxed text-faint">
                Calculation tool only — it does the arithmetic, it doesn't certify a candle. Wick
                choice, pour temperature, and burn performance are settled by your own test burns,
                not by this page.
              </p>
            </div>
          </BenchResults>
        }
      />
    </div>
  );
}
