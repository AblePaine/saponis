import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { OIL_DATABASE, getOilById } from "@/data/oils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useRecipeStore } from "@/lib/recipe-store";
import { formatPercent } from "@/lib/format";
import type { LiquidMode, MasterOilRecord } from "@/types/soap";
import { cn } from "@/lib/utils";

function MassField({
  value,
  onChange,
  unit,
  id,
  ariaLabel,
}: {
  value: number;
  onChange: (next: number) => void;
  unit: string;
  id?: string;
  ariaLabel?: string;
}) {
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState(stringifyMass(value, unit));

  useEffect(() => {
    if (!focused) setDraft(stringifyMass(value, unit));
  }, [value, unit, focused]);

  return (
    <div className="relative">
      <Input
        id={id}
        inputMode="decimal"
        aria-label={ariaLabel}
        value={draft}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          const parsed = Number.parseFloat(draft.replace(/,/g, ""));
          onChange(Number.isFinite(parsed) && parsed >= 0 ? parsed : 0);
        }}
        onChange={(event) => setDraft(event.target.value)}
        className="h-11 pr-9 font-mono tabular-nums"
      />
      <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-faint">
        {unit}
      </span>
    </div>
  );
}

function stringifyMass(value: number, unit: string): string {
  if (!Number.isFinite(value)) return "0";
  const digits = unit === "oz" ? 3 : 2;
  const rounded = Number(value.toFixed(digits));
  return String(rounded);
}

function OilCard({
  record,
  amount,
  share,
  unit,
  onAmount,
  onRemove,
}: {
  record: MasterOilRecord;
  amount: number;
  share: number;
  unit: "g" | "oz";
  onAmount: (value: number) => void;
  onRemove: () => void;
}) {
  const overMax =
    share * 100 > record.recommended_max_percentage + 0.05 &&
    record.recommended_max_percentage < 100;

  return (
    <article className="rounded-xl bg-surface p-3 shadow-[var(--shadow-border)] sm:p-4">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-base font-medium tracking-tight text-ink">
              {record.name}
            </h3>
            <Badge variant="outline">{record.hardness_profile}</Badge>
            {overMax ? <Badge variant="warn">over {record.recommended_max_percentage}%</Badge> : null}
          </div>
          <p className="mt-0.5 text-xs text-muted italic">
            {record.common_botanical_name}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Remove ${record.name}`}
          onClick={onRemove}
          className="text-muted hover:text-danger"
        >
          <Trash2 />
        </Button>
      </div>

      <div className="mt-3 grid grid-cols-[minmax(0,1fr)_5.5rem] items-end gap-3">
        <div>
          <Label htmlFor={`oil-${record.id}`}>Amount</Label>
          <MassField
            id={`oil-${record.id}`}
            value={amount}
            unit={unit}
            ariaLabel={`${record.name} amount`}
            onChange={onAmount}
          />
        </div>
        <div className="text-right">
          <p className="text-xs font-medium tracking-wide text-muted uppercase">Share</p>
          <p className="mt-2 font-mono text-sm tabular-nums text-ink">
            {formatPercent(share * 100)}
          </p>
        </div>
      </div>

      <dl className="mt-3 grid grid-cols-3 gap-2 text-[11px] text-muted">
        <div>
          <dt className="uppercase tracking-wide">SAP NaOH</dt>
          <dd className="font-mono tabular-nums text-ink-soft">{record.sap_naoh.toFixed(3)}</dd>
        </div>
        <div>
          <dt className="uppercase tracking-wide">Iodine</dt>
          <dd className="font-mono tabular-nums text-ink-soft">{record.iodine}</dd>
        </div>
        <div>
          <dt className="uppercase tracking-wide">Trace</dt>
          <dd className="text-ink-soft capitalize">{record.trace_speed_impact}</dd>
        </div>
      </dl>
    </article>
  );
}

const LIQUID_MODES: { id: LiquidMode; label: string }[] = [
  { id: "concentration", label: "Conc." },
  { id: "ratio", label: "Ratio" },
  { id: "water_percent_oils", label: "% oils" },
];

export function OilFormula() {
  const config = useRecipeStore((s) => s.config);
  const setOilAmount = useRecipeStore((s) => s.setOilAmount);
  const addOil = useRecipeStore((s) => s.addOil);
  const removeOil = useRecipeStore((s) => s.removeOil);
  const scaleOilsTo = useRecipeStore((s) => s.scaleOilsTo);
  const setSuperfat = useRecipeStore((s) => s.setSuperfat);
  const setLiquidMode = useRecipeStore((s) => s.setLiquidMode);
  const setLiquidValue = useRecipeStore((s) => s.setLiquidValue);
  const setNaohRatio = useRecipeStore((s) => s.setNaohRatio);
  const setNaohPurity = useRecipeStore((s) => s.setNaohPurity);
  const setKohPurity = useRecipeStore((s) => s.setKohPurity);
  const setFragrance = useRecipeStore((s) => s.setFragrance);
  const setSodiumLactate = useRecipeStore((s) => s.setSodiumLactate);

  const totalOils = useMemo(
    () => config.oils.reduce((sum, row) => sum + row.amount, 0),
    [config.oils],
  );

  const unused = OIL_DATABASE.filter(
    (oil) => !config.oils.some((row) => row.oilId === oil.id),
  );

  const defaultAddAmount = config.unit === "oz" ? 1.76 : 50;

  const liquidHint =
    config.liquidConfig.mode === "concentration"
      ? "Lye concentration, % of (lye + liquid)"
      : config.liquidConfig.mode === "ratio"
        ? "Water : lye by mass"
        : "Liquid as % of oil weight";

  const liquidMin = config.liquidConfig.mode === "ratio" ? 1 : 20;
  const liquidMax = config.liquidConfig.mode === "ratio" ? 4 : 50;
  const liquidStep = config.liquidConfig.mode === "ratio" ? 0.05 : 0.5;

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-medium tracking-tight">Oils</h2>
            <p className="text-sm text-muted">Workhorse fats for the bench.</p>
          </div>
          <div className="w-32">
            <Label htmlFor="batch-total">Scale to</Label>
            <MassField
              id="batch-total"
              value={totalOils}
              unit={config.unit}
              ariaLabel="Scale total oil weight"
              onChange={scaleOilsTo}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {config.oils.length === 0 ? (
            <p className="rounded-xl border border-dashed border-line-strong bg-surface/60 px-4 py-8 text-center text-sm text-muted">
              Add an oil to start the batch.
            </p>
          ) : (
            config.oils.map((row) => {
              const record = getOilById(row.oilId);
              if (!record) return null;
              return (
                <OilCard
                  key={row.oilId}
                  record={record}
                  amount={row.amount}
                  share={totalOils > 0 ? row.amount / totalOils : 0}
                  unit={config.unit}
                  onAmount={(value) => setOilAmount(row.oilId, value)}
                  onRemove={() => removeOil(row.oilId)}
                />
              );
            })
          )}
        </div>

        {unused.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {unused.map((oil) => (
              <Button
                key={oil.id}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addOil(oil.id, defaultAddAmount)}
              >
                <Plus />
                {oil.name}
              </Button>
            ))}
          </div>
        ) : null}
      </section>

      <Separator />

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="font-display text-xl font-medium tracking-tight">Alkali & liquid</h2>
          <p className="text-sm text-muted">
            Superfat discounts the stoichiometric lye demand, then purity scales the reagent mass.
          </p>
        </div>

        <div className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]">
          <div className="flex items-center justify-between">
            <Label>Superfat</Label>
            <span className="font-mono text-sm tabular-nums">
              {config.superfatPercentage.toFixed(1)}%
            </span>
          </div>
          <Slider
            className="mt-3"
            min={0}
            max={15}
            step={0.5}
            value={[config.superfatPercentage]}
            onValueChange={([value]) => setSuperfat(value ?? 0)}
            aria-label="Superfat percentage"
          />
        </div>

        <div className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]">
          <div className="flex items-center justify-between gap-3">
            <Label>Liquid</Label>
            <div className="flex rounded-md bg-bg-subtle p-1">
              {LIQUID_MODES.map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setLiquidMode(mode.id)}
                  className={cn(
                    "h-8 rounded-sm px-2.5 text-xs font-medium transition-colors duration-150",
                    config.liquidConfig.mode === mode.id
                      ? "bg-surface text-ink shadow-sm"
                      : "text-muted hover:text-ink",
                  )}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>
          <p className="mt-2 text-xs text-muted">{liquidHint}</p>
          <div className="mt-3 flex items-center gap-3">
            <Slider
              min={liquidMin}
              max={liquidMax}
              step={liquidStep}
              value={[config.liquidConfig.value]}
              onValueChange={([value]) => setLiquidValue(value ?? 0)}
              aria-label="Liquid value"
            />
            <span className="w-14 shrink-0 text-right font-mono text-sm tabular-nums">
              {config.liquidConfig.mode === "ratio"
                ? config.liquidConfig.value.toFixed(2)
                : `${config.liquidConfig.value.toFixed(1)}%`}
            </span>
          </div>
        </div>

        <div className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]">
          <div className="flex items-center justify-between">
            <Label>NaOH / KOH split</Label>
            <span className="font-mono text-sm tabular-nums">
              {(config.lyeChoice.naohRatio * 100).toFixed(0)}% NaOH
            </span>
          </div>
          <Slider
            className="mt-3"
            min={0}
            max={1}
            step={0.05}
            value={[config.lyeChoice.naohRatio]}
            onValueChange={([value]) => setNaohRatio(value ?? 1)}
            aria-label="Sodium hydroxide ratio"
          />
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="naoh-purity">NaOH purity</Label>
              <Input
                id="naoh-purity"
                inputMode="decimal"
                className="mt-1 font-mono tabular-nums"
                value={Math.round(config.lyeChoice.naohPurity * 1000) / 10}
                onChange={(event) => {
                  const parsed = Number.parseFloat(event.target.value);
                  if (Number.isFinite(parsed) && parsed > 0) {
                    setNaohPurity(parsed / 100);
                  }
                }}
              />
            </div>
            <div>
              <Label htmlFor="koh-purity">KOH purity</Label>
              <Input
                id="koh-purity"
                inputMode="decimal"
                className="mt-1 font-mono tabular-nums"
                value={Math.round(config.lyeChoice.kohPurity * 1000) / 10}
                onChange={(event) => {
                  const parsed = Number.parseFloat(event.target.value);
                  if (Number.isFinite(parsed) && parsed > 0) {
                    setKohPurity(parsed / 100);
                  }
                }}
              />
            </div>
          </div>
          <p className="mt-2 text-xs text-muted">Purity as percent of the reagent, typically 99 and 90.</p>
        </div>
      </section>

      <Separator />

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl font-medium tracking-tight">Additives</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]">
            <Label htmlFor="fragrance">Fragrance</Label>
            <div className="mt-1">
              <MassField
                id="fragrance"
                value={config.additives?.fragranceGrams ?? 0}
                unit={config.unit}
                ariaLabel="Fragrance amount"
                onChange={setFragrance}
              />
            </div>
          </div>
          <div className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]">
            <Label htmlFor="lactate">Sodium lactate</Label>
            <div className="mt-1">
              <MassField
                id="lactate"
                value={config.additives?.sodiumLactateGrams ?? 0}
                unit={config.unit}
                ariaLabel="Sodium lactate amount"
                onChange={setSodiumLactate}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
