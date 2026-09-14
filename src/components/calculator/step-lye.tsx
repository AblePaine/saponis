import { useState } from "react";
import { Info } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useRecipeStore } from "@/lib/recipe-store";
import { cn } from "@/lib/utils";
import { MassField } from "@/components/calculator/mass-field";
import { SliderField } from "@/components/calculator/slider-field";
import { StepCard } from "@/components/calculator/step-card";
import type { LiquidMode } from "@/types/soap";

const LYE_TYPES = [
  { id: "naoh" as const, label: "NaOH", hint: "Bar soap" },
  { id: "koh" as const, label: "KOH", hint: "Liquid soap" },
  { id: "blend" as const, label: "Dual-lye", hint: "Custom blend" },
];

const LIQUID_MODES: { id: LiquidMode; label: string; hint: string }[] = [
  { id: "concentration", label: "Conc.", hint: "Default 33%" },
  { id: "ratio", label: "Ratio", hint: "Default 2:1" },
  { id: "water_percent_oils", label: "% oils", hint: "Legacy 38%" },
];

export function StepLye() {
  const config = useRecipeStore((s) => s.config);
  const setSuperfat = useRecipeStore((s) => s.setSuperfat);
  const setLiquidMode = useRecipeStore((s) => s.setLiquidMode);
  const setLiquidValue = useRecipeStore((s) => s.setLiquidValue);
  const setNaohRatio = useRecipeStore((s) => s.setNaohRatio);
  const setLyeType = useRecipeStore((s) => s.setLyeType);
  const setNaohPurity = useRecipeStore((s) => s.setNaohPurity);
  const setKohPurity = useRecipeStore((s) => s.setKohPurity);
  const setFragrance = useRecipeStore((s) => s.setFragrance);
  const setSodiumLactate = useRecipeStore((s) => s.setSodiumLactate);
  const [kohInfo, setKohInfo] = useState(false);

  const ratio = config.lyeChoice.naohRatio;
  const lyeType = ratio >= 0.999 ? "naoh" : ratio <= 0.001 ? "koh" : "blend";
  const liquid = config.liquidConfig;

  const liquidMin = liquid.mode === "ratio" ? 1 : 18;
  const liquidMax = liquid.mode === "ratio" ? 4 : 50;
  const liquidStep = liquid.mode === "ratio" ? 0.05 : 0.5;

  return (
    <StepCard
      step={2}
      title="Lye & liquid"
      subtitle="Alkali type, purity, superfat, and water."
    >
      <Label>Lye type</Label>
      <div className="mt-1 grid grid-cols-3 gap-1 rounded-lg bg-bg-subtle p-1">
        {LYE_TYPES.map((type) => (
          <button
            key={type.id}
            type="button"
            onClick={() => setLyeType(type.id)}
            className={cn(
              "flex h-14 flex-col items-center justify-center rounded-md px-1 text-center transition-colors duration-150",
              lyeType === type.id
                ? "bg-surface text-ink shadow-sm"
                : "text-muted hover:text-ink",
            )}
          >
            <span className="text-xs font-medium sm:text-sm">{type.label}</span>
            <span className="text-xs text-faint">{type.hint}</span>
          </button>
        ))}
      </div>

      {lyeType === "blend" ? (
        <div className="mt-4">
          <Label htmlFor="naoh-share">NaOH share of alkali</Label>
          <div className="mt-2">
            <SliderField
              id="naoh-share"
              min={0}
              max={100}
              step={5}
              value={Math.round(ratio * 100)}
              onChange={(value) => setNaohRatio(value / 100)}
              unit="%"
              ariaLabel="Sodium hydroxide share of alkali"
            />
          </div>
        </div>
      ) : null}

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="naoh-purity">NaOH purity</Label>
          <Input
            id="naoh-purity"
            inputMode="decimal"
            className="mt-1 h-12 font-mono tabular-nums"
            value={Math.round(config.lyeChoice.naohPurity * 1000) / 10}
            onChange={(event) => {
              const parsed = Number.parseFloat(event.target.value);
              if (Number.isFinite(parsed) && parsed > 0) setNaohPurity(parsed / 100);
            }}
          />
        </div>
        <div>
          <div className="flex items-center gap-1">
            <Label htmlFor="koh-purity">KOH purity</Label>
            <button
              type="button"
              className="relative flex size-8 items-center justify-center rounded-md text-muted after:absolute after:top-1/2 after:left-1/2 after:size-12 after:-translate-x-1/2 after:-translate-y-1/2 hover:text-ink"
              aria-label="Why KOH defaults to 90%"
              aria-expanded={kohInfo}
              onClick={() => setKohInfo((open) => !open)}
            >
              <Info className="size-4" />
            </button>
          </div>
          <Input
            id="koh-purity"
            inputMode="decimal"
            className="mt-1 h-12 font-mono tabular-nums"
            value={Math.round(config.lyeChoice.kohPurity * 1000) / 10}
            onChange={(event) => {
              const parsed = Number.parseFloat(event.target.value);
              if (Number.isFinite(parsed) && parsed > 0) setKohPurity(parsed / 100);
            }}
          />
        </div>
      </div>
      {kohInfo ? (
        <p className="mt-3 rounded-lg bg-bg-subtle px-3 py-3 text-sm text-muted">
          Potassium hydroxide is typically sold at 90% purity. Enter the assay on
          your bottle — the engine inflates the dose so the true alkali mass is
          correct.
        </p>
      ) : null}

      <div className="mt-5">
        <Label htmlFor="superfat">Superfat</Label>
        <div className="mt-2">
          <SliderField
            id="superfat"
            min={0}
            max={20}
            step={0.5}
            value={config.superfatPercentage}
            onChange={setSuperfat}
            unit="%"
            ariaLabel="Superfat percentage"
          />
        </div>
      </div>

      <div className="mt-5">
        <Label>Liquid</Label>
        <div className="mt-1 grid grid-cols-3 gap-1 rounded-lg bg-bg-subtle p-1">
          {LIQUID_MODES.map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => setLiquidMode(mode.id)}
              className={cn(
                "flex h-14 flex-col items-center justify-center rounded-md px-1 text-center transition-colors duration-150",
                liquid.mode === mode.id
                  ? "bg-surface text-ink shadow-sm"
                  : "text-muted hover:text-ink",
              )}
            >
              <span className="text-xs font-medium sm:text-sm">{mode.label}</span>
              <span className="text-xs text-faint">{mode.hint}</span>
            </button>
          ))}
        </div>
        <div className="mt-3">
          <SliderField
            id="liquid-value"
            min={liquidMin}
            max={liquidMax}
            step={liquidStep}
            value={liquid.value}
            onChange={setLiquidValue}
            unit={liquid.mode === "ratio" ? ":1" : "%"}
            ariaLabel="Liquid value"
          />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div>
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
        <div>
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
    </StepCard>
  );
}
