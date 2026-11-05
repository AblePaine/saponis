import { useEffect, useMemo, useState } from "react";
import { Check, Link2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StepCard } from "@/components/calculator/step-card";
import { NextStep } from "@/components/next-step";
import { MassField } from "@/components/calculator/mass-field";
import { SliderField } from "@/components/calculator/slider-field";
import {
  BenchLayout,
  BenchResults,
  ResultRow,
  WarningList,
} from "@/components/calculator/bench-shell";
import { computeCandleBlend } from "@/lib/candle-blend-engine";
import {
  computeFoCard,
  FO_FORMAT_LABEL,
  type FoFormat,
} from "@/lib/fo-card-engine";
import { computeWickStart } from "@/lib/wick-engine";
import {
  decodeBlendState,
  decodeFoCardState,
  decodeWickState,
  encodeBlendState,
  encodeFoCardState,
  encodeWickState,
  readNamedParam,
  writeNamedParam,
} from "@/lib/bench-url";
import { CANDLE_WAXES } from "@/data/candle-waxes";
import { WICK_SERIES } from "@/data/wick-guide";
import { cn } from "@/lib/utils";

/**
 * Candle Studio expansion (Tier 1 Build 2) — the three tools that
 * complete the candlemaking brief's engine sequence on the /candles
 * bench: the multi-format fragrance card (E), the blend window (D),
 * and the wick starting point + burn-test card (C). Each carries its
 * state in its own query param (?f= / ?b= / ?w=); the batch bench
 * above owns ?r=. Spec: docs/CANDLE_STUDIO_SPEC.md.
 */

const number1 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const number2 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const number3 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 3 });

function tempRange(lowC: number, highC: number): string {
  const f = (c: number) => Math.round((c * 9) / 5 + 32);
  return `${Math.round(lowC)}–${Math.round(highC)} °C (${f(lowC)}–${f(highC)} °F)`;
}

function ShareToolLink({
  param,
  encoded,
  label,
}: {
  param: string;
  encoded: string;
  label: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    writeNamedParam(param, encoded);
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="h-11 w-full"
      onClick={copyLink}
    >
      {copied ? (
        <Check className="h-4 w-4" aria-hidden />
      ) : (
        <Link2 className="h-4 w-4" aria-hidden />
      )}
      {copied ? "Link copied" : label}
    </Button>
  );
}

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-sm font-medium text-ink"
    >
      {children}
    </label>
  );
}

/* ------------------------------------------------------------------ */
/* E — multi-format fragrance card                                     */
/* ------------------------------------------------------------------ */

interface FoRowState {
  enabled: boolean;
  finishedGrams: number;
  desiredLoadPercent: number;
  ifraCapPercent: number;
  waxHoldPercentOfWax: number;
}

const FO_FORMATS: FoFormat[] = ["candle", "melt", "diffuser", "soap"];

const FO_DEFAULTS: Record<FoFormat, FoRowState> = {
  candle: {
    enabled: true,
    finishedGrams: 1000,
    desiredLoadPercent: 8,
    ifraCapPercent: 0,
    waxHoldPercentOfWax: 10,
  },
  melt: {
    enabled: false,
    finishedGrams: 200,
    desiredLoadPercent: 10,
    ifraCapPercent: 0,
    waxHoldPercentOfWax: 10,
  },
  diffuser: {
    enabled: false,
    finishedGrams: 100,
    desiredLoadPercent: 20,
    ifraCapPercent: 0,
    waxHoldPercentOfWax: 0,
  },
  soap: {
    enabled: false,
    finishedGrams: 500,
    desiredLoadPercent: 3,
    ifraCapPercent: 0,
    waxHoldPercentOfWax: 0,
  },
};

function FoCardTool() {
  const [initial] = useState(() => decodeFoCardState(readNamedParam("f")));
  const [foName, setFoName] = useState("");
  const [rows, setRows] = useState<Record<FoFormat, FoRowState>>(() => {
    const base = { ...FO_DEFAULTS };
    if (initial) {
      for (const format of FO_FORMATS) base[format] = { ...base[format], enabled: false };
      for (const row of initial.formats) {
        base[row.format] = {
          enabled: true,
          finishedGrams: row.finishedGrams,
          desiredLoadPercent: row.desiredLoadPercent,
          ifraCapPercent: row.ifraCapPercent,
          waxHoldPercentOfWax: row.waxHoldPercentOfWax,
        };
      }
    }
    return base;
  });

  const enabledFormats = useMemo(
    () => FO_FORMATS.filter((f) => rows[f].enabled),
    [rows],
  );
  const result = useMemo(
    () =>
      computeFoCard({
        foName,
        formats: enabledFormats.map((format) => ({
          format,
          finishedGrams: rows[format].finishedGrams,
          desiredLoadPercent: rows[format].desiredLoadPercent,
          ifraCapPercent: rows[format].ifraCapPercent,
          waxHoldPercentOfWax: rows[format].waxHoldPercentOfWax,
        })),
      }),
    [rows, foName, enabledFormats],
  );

  const encoded = useMemo(
    () =>
      encodeFoCardState({
        formats: enabledFormats.map((format) => ({
          format,
          finishedGrams: rows[format].finishedGrams,
          desiredLoadPercent: rows[format].desiredLoadPercent,
          ifraCapPercent: rows[format].ifraCapPercent,
          waxHoldPercentOfWax: rows[format].waxHoldPercentOfWax,
        })),
      }),
    [rows, enabledFormats],
  );
  useEffect(() => {
    writeNamedParam("f", encoded);
  }, [encoded]);

  const patch = (format: FoFormat, next: Partial<FoRowState>) =>
    setRows((prev) => ({ ...prev, [format]: { ...prev[format], ...next } }));

  return (
    <BenchLayout
      steps={
        <StepCard
          step={5}
          title="One oil, every format"
          subtitle="The same fragrance in a candle, a melt, a diffuser and a soap — each with its own cap."
        >
          <div className="flex flex-col gap-5">
            <div>
              <FieldLabel htmlFor="fo-name">Fragrance oil (optional)</FieldLabel>
              <Input
                id="fo-name"
                value={foName}
                onChange={(event) => setFoName(event.target.value)}
                placeholder="e.g. Cedar & Smoke"
                className="h-12"
              />
            </div>
            {FO_FORMATS.map((format) => {
              const row = rows[format];
              const isWax = format === "candle" || format === "melt";
              return (
                <div
                  key={format}
                  className="rounded-xl border border-line px-3 py-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-display text-base font-medium text-ink">
                      {FO_FORMAT_LABEL[format]}
                    </span>
                    <button
                      type="button"
                      aria-pressed={row.enabled}
                      onClick={() => patch(format, { enabled: !row.enabled })}
                      className={cn(
                        "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                        row.enabled
                          ? "bg-primary text-primary-foreground"
                          : "bg-primary-soft text-primary",
                      )}
                    >
                      {row.enabled ? "On the card" : "Add to card"}
                    </button>
                  </div>
                  {row.enabled ? (
                    <div className="mt-3 grid gap-4 sm:grid-cols-2">
                      <div>
                        <FieldLabel htmlFor={`fo-finished-${format}`}>
                          Finished batch
                        </FieldLabel>
                        <MassField
                          id={`fo-finished-${format}`}
                          value={row.finishedGrams}
                          unit="g"
                          ariaLabel={`${FO_FORMAT_LABEL[format]} finished batch in grams`}
                          onChange={(v) => patch(format, { finishedGrams: v })}
                        />
                      </div>
                      <div>
                        <FieldLabel htmlFor={`fo-load-${format}`}>
                          Desired load, % of finished
                        </FieldLabel>
                        <SliderField
                          id={`fo-load-${format}`}
                          min={0}
                          max={40}
                          step={0.5}
                          value={row.desiredLoadPercent}
                          unit="%"
                          ariaLabel={`${FO_FORMAT_LABEL[format]} desired load percent`}
                          onChange={(v) => patch(format, { desiredLoadPercent: v })}
                        />
                      </div>
                      <div>
                        <FieldLabel htmlFor={`fo-ifra-${format}`}>
                          IFRA cap from the certificate, % of finished
                        </FieldLabel>
                        <MassField
                          id={`fo-ifra-${format}`}
                          value={row.ifraCapPercent}
                          unit="%"
                          ariaLabel={`${FO_FORMAT_LABEL[format]} IFRA cap percent`}
                          onChange={(v) => patch(format, { ifraCapPercent: v })}
                        />
                      </div>
                      {isWax ? (
                        <div>
                          <FieldLabel htmlFor={`fo-hold-${format}`}>
                            Wax max load, % of wax
                          </FieldLabel>
                          <MassField
                            id={`fo-hold-${format}`}
                            value={row.waxHoldPercentOfWax}
                            unit="%"
                            ariaLabel={`${FO_FORMAT_LABEL[format]} wax hold percent of wax`}
                            onChange={(v) =>
                              patch(format, { waxHoldPercentOfWax: v })
                            }
                          />
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              );
            })}
            <p className="text-sm text-muted">
              Saponis seeds no fragrance limits of its own — the caps on this
              card are the ones you type in, from the oil's IFRA certificate
              and your wax supplier's sheet. No cap entered means no ceiling
              applied, and the card says so.
            </p>
          </div>
        </StepCard>
      }
      results={
        <BenchResults
          title="Fragrance card"
          subtitle={`${result.foName} across ${result.rows.length} format${result.rows.length === 1 ? "" : "s"}.`}
        >
          <div className="flex flex-col gap-4">
            {result.rows.map((row) => (
              <div key={row.format} className="flex flex-col gap-1">
                <p className="font-display text-base font-medium text-ink">
                  {row.label} — {number1.format(row.finishedGrams)} g finished
                </p>
                <ResultRow
                  label="Fragrance to weigh"
                  value={`${number1.format(row.fragranceGrams)} g`}
                />
                <ResultRow
                  label={row.format === "diffuser" ? "Carrier / base" : "Wax / base"}
                  value={`${number1.format(row.baseGrams)} g`}
                />
                {row.loadPercentOfWax !== null ? (
                  <ResultRow
                    label="Load, % of wax"
                    value={`${number2.format(row.loadPercentOfWax)}%`}
                  />
                ) : null}
                <ResultRow
                  label="Binding cap"
                  value={
                    row.bindingCapPercent !== null
                      ? `${number2.format(row.bindingCapPercent)}% of finished (${row.bindingCapSource === "ifra" ? "IFRA" : "wax hold"})`
                      : "None entered"
                  }
                />
                {row.maxFragranceGrams !== null ? (
                  <ResultRow
                    label="Max fragrance at cap"
                    value={`${number1.format(row.maxFragranceGrams)} g`}
                  />
                ) : null}
                <WarningList warnings={row.warnings} />
              </div>
            ))}
            <ResultRow
              label="Fragrance across all batches"
              value={`${number1.format(result.totalFragranceGrams)} g`}
            />
            <WarningList warnings={result.warnings} />
            <ShareToolLink param="f" encoded={encoded} label="Share this card" />
          </div>
        </BenchResults>
      }
    />
  );
}

/* ------------------------------------------------------------------ */
/* D — wax blend window                                                */
/* ------------------------------------------------------------------ */

function BlendTool() {
  const [initial] = useState(() => decodeBlendState(readNamedParam("b")));
  const [percents, setPercents] = useState<Record<string, number>>(
    () =>
      initial?.percents ?? {
        "soy-container-seed": 70,
        "beeswax-candle-seed": 30,
      },
  );
  const [stearicPercent, setStearicPercent] = useState(
    initial?.stearicPercent ?? 0,
  );
  const [vybarPercent, setVybarPercent] = useState(initial?.vybarPercent ?? 0);

  const result = useMemo(
    () =>
      computeCandleBlend({
        components: CANDLE_WAXES.map((wax) => ({
          waxId: wax.id,
          percent: percents[wax.id] ?? 0,
        })),
        stearicPercent,
        vybarPercent,
      }),
    [percents, stearicPercent, vybarPercent],
  );

  const encoded = useMemo(
    () => encodeBlendState({ percents, stearicPercent, vybarPercent }),
    [percents, stearicPercent, vybarPercent],
  );
  useEffect(() => {
    writeNamedParam("b", encoded);
  }, [encoded]);

  return (
    <BenchLayout
      steps={
        <StepCard
          step={6}
          title="Blend the waxes"
          subtitle="Mass-weighted density, melt band and pour window for a blend — before you melt anything."
        >
          <div className="flex flex-col gap-4">
            {CANDLE_WAXES.map((wax) => (
              <div key={wax.id}>
                <FieldLabel htmlFor={`blend-${wax.id}`}>
                  {wax.name.replace(" (seed)", "")} share
                </FieldLabel>
                <SliderField
                  id={`blend-${wax.id}`}
                  min={0}
                  max={100}
                  step={1}
                  value={percents[wax.id] ?? 0}
                  unit="%"
                  ariaLabel={`${wax.name} share percent`}
                  onChange={(v) =>
                    setPercents((prev) => ({ ...prev, [wax.id]: v }))
                  }
                />
              </div>
            ))}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <FieldLabel htmlFor="blend-stearic">
                  Stearic acid, % of blend
                </FieldLabel>
                <SliderField
                  id="blend-stearic"
                  min={0}
                  max={30}
                  step={0.5}
                  value={stearicPercent}
                  unit="%"
                  ariaLabel="Stearic acid percent"
                  onChange={setStearicPercent}
                />
              </div>
              <div>
                <FieldLabel htmlFor="blend-vybar">Vybar, % of blend</FieldLabel>
                <SliderField
                  id="blend-vybar"
                  min={0}
                  max={5}
                  step={0.25}
                  value={vybarPercent}
                  unit="%"
                  ariaLabel="Vybar percent"
                  onChange={setVybarPercent}
                />
              </div>
            </div>
            <p className="text-sm text-muted">
              Profile numbers are seed values for each wax class. The blend
              maths is exact weighting; the inputs are estimates, so compare
              blends against each other rather than trusting the decimals.
            </p>
          </div>
        </StepCard>
      }
      results={
        <BenchResults
          title="Blend window"
          subtitle="Weighted estimate from the seed profile library."
        >
          <div className="flex flex-col gap-1.5">
            <ResultRow
              label="Blend specific gravity"
              value={number3.format(result.blendSg)}
            />
            <ResultRow
              label="Melt band"
              value={tempRange(result.meltLowC, result.meltHighC)}
            />
            <ResultRow
              label="Pour window"
              value={tempRange(result.pourLowC, result.pourHighC)}
            />
            <ResultRow
              label="Hardness"
              value={`${result.hardnessBand} (${number2.format(result.hardnessScore)})`}
            />
            <ResultRow
              label="Frost tendency"
              value={result.frostRiskBand}
            />
            <ResultRow
              label="Forms"
              value={`Container ${result.containerOk ? "✓" : "✗"} · Pillar ${result.pillarOk ? "✓" : "✗"}`}
            />
            {result.rows.map((row) => (
              <ResultRow
                key={row.waxId}
                label={row.name.replace(" (seed)", "")}
                value={`${number1.format(row.percent)}% · melts ≈${Math.round(row.meltMidC)} °C`}
              />
            ))}
          </div>
          <div className="mt-4 flex flex-col gap-3">
            <Button
              type="button"
              className="h-11 w-full"
              onClick={() => {
                window.dispatchEvent(
                  new CustomEvent("saponis:use-blend-sg", {
                    detail: result.blendSg,
                  }),
                );
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              Use this SG in the batch bench ↑
            </Button>
            <WarningList warnings={result.warnings} />
            {result.notes.length > 0 ? (
              <ul className="flex flex-col gap-1.5 text-sm text-muted">
                {result.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            ) : null}
            <ShareToolLink param="b" encoded={encoded} label="Share this blend" />
          </div>
        </BenchResults>
      }
    />
  );
}

/* ------------------------------------------------------------------ */
/* C — wick starting point + burn-test card                            */
/* ------------------------------------------------------------------ */

function WickTool() {
  const [initial] = useState(() => decodeWickState(readNamedParam("w")));
  const [diameterInches, setDiameterInches] = useState(
    initial?.diameterInches ?? 3,
  );
  const [waxId, setWaxId] = useState(initial?.waxId ?? "soy-container-seed");
  const [foLoadPercent, setFoLoadPercent] = useState(initial?.foLoadPercent ?? 8);
  const [seriesId, setSeriesId] = useState(initial?.seriesId ?? "");

  const result = useMemo(
    () =>
      computeWickStart({
        diameterInches,
        waxId,
        foLoadPercent,
        seriesId: seriesId === "" ? undefined : seriesId,
      }),
    [diameterInches, waxId, foLoadPercent, seriesId],
  );

  const encoded = useMemo(
    () => encodeWickState({ diameterInches, waxId, foLoadPercent, seriesId }),
    [diameterInches, waxId, foLoadPercent, seriesId],
  );
  useEffect(() => {
    writeNamedParam("w", encoded);
  }, [encoded]);

  return (
    <BenchLayout
      steps={
        <StepCard
          step={7}
          title="Pick a wick to test"
          subtitle="A starting size per series — and the burn test that actually settles it."
        >
          <div className="flex flex-col gap-4">
            <div>
              <FieldLabel htmlFor="wick-diameter">
                Vessel inside diameter
              </FieldLabel>
              <div className="w-40">
                <MassField
                  id="wick-diameter"
                  value={diameterInches}
                  unit="in"
                  ariaLabel="Vessel inside diameter in inches"
                  onChange={setDiameterInches}
                />
              </div>
            </div>
            <div>
              <span className="mb-1.5 block text-sm font-medium text-ink">
                Wax family
              </span>
              <div className="flex flex-wrap gap-2">
                {CANDLE_WAXES.map((wax) => (
                  <button
                    key={wax.id}
                    type="button"
                    aria-pressed={waxId === wax.id}
                    onClick={() => setWaxId(wax.id)}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                      waxId === wax.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-primary-soft text-primary",
                    )}
                  >
                    {wax.name.replace(" (seed)", "")}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <FieldLabel htmlFor="wick-load">Fragrance load</FieldLabel>
              <SliderField
                id="wick-load"
                min={0}
                max={30}
                step={0.5}
                value={foLoadPercent}
                unit="%"
                ariaLabel="Fragrance load percent"
                onChange={setFoLoadPercent}
              />
            </div>
            <div>
              <span className="mb-1.5 block text-sm font-medium text-ink">
                Wick series
              </span>
              <div className="flex flex-wrap gap-2">
                {[{ id: "", name: "Full card" }, ...WICK_SERIES].map((s) => (
                  <button
                    key={s.id || "all"}
                    type="button"
                    aria-pressed={seriesId === s.id}
                    onClick={() => setSeriesId(s.id)}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                      seriesId === s.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-primary-soft text-primary",
                    )}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-sm text-muted">
              Sizes come from the seed guide for each wax class. Your
              supplier's chart for the exact wax in your pot outranks this
              table — and the burn test outranks both.
            </p>
          </div>
        </StepCard>
      }
      results={
        <BenchResults
          title="Wick test card"
          subtitle={`${number2.format(result.diameterInches)}″ vessel · ${result.waxName.replace(" (seed)", "")} · read from the ${result.bandInches}″ band.`}
        >
          <div className="flex flex-col gap-3">
            {result.series.map((s) => (
              <div key={s.seriesId}>
                <p className="font-display text-base font-medium text-ink">
                  {s.name}
                </p>
                <p className="font-mono text-sm text-muted tabular-nums">
                  test {s.sizes[0] ?? "—"} ·{" "}
                  <span className="font-semibold text-ink">
                    start {s.sizes[1]}
                  </span>{" "}
                  · test {s.sizes[2] ?? "—"}
                </p>
                <p className="text-sm text-muted">{s.note}</p>
              </div>
            ))}
            <div className="rounded-xl border border-line px-3 py-3">
              <p className="font-display text-base font-medium text-ink">
                The burn test
              </p>
              <ResultRow
                label="First burn"
                value={`${number1.format(result.protocol.firstBurnHours)} hours (1 hr per inch)`}
              />
              <ResultRow
                label="Full burn cycles before judging"
                value={String(result.protocol.fullBurnCycles)}
              />
              <ResultRow
                label="Pool depth target"
                value={`${result.protocol.targetPoolDepthInches[0]}″–${result.protocol.targetPoolDepthInches[1]}″`}
              />
              <ul className="mt-2 flex flex-col gap-1.5 text-sm text-muted">
                {result.protocol.evaluate.map((line) => (
                  <li key={line}>{line}</li>
                ))}
                {result.protocol.adjust.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
            <WarningList warnings={result.advisories} />
            <ShareToolLink param="w" encoded={encoded} label="Share this test card" />
          </div>
        </BenchResults>
      }
    />
  );
}

export function CandleStudioTools() {
  return (
    <div className="mt-12">
      <div className="flex max-w-3xl flex-col gap-3">
        <Badge className="w-fit">Candle Studio expansion</Badge>
        <h2 className="font-display text-3xl font-medium tracking-tight text-balance">
          The rest of the candle bench
        </h2>
        <p className="text-base text-muted">
          The batch bench above sizes one pour. These three tools cover the
          questions around it: what the same oil does in every product you
          sell, what a blend of waxes will pour like, and which wick to put
          on the test fire first.
        </p>
      </div>
      <FoCardTool />
      <BlendTool />
      <WickTool />
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <NextStep
          to="/costing"
          label="Cost this in the costing suite"
          blurb="The pour is planned — the costing suite turns it into a true cost per candle, with labor, packaging, and overhead counted in."
        />
      </div>
    </div>
  );
}
