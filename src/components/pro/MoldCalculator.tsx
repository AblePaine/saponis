import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { MassField } from "@/components/calculator/mass-field";
import { SpecCard } from "@/components/oils/spec-card";
import { formatMass, gramsToRecipeUnit } from "@/lib/format";
import {
  BATTER_DENSITY_G_CM3,
  EMPTY_MOLD,
  OIL_FRACTION_OF_BATTER,
  computeMold,
  type FillMode,
  type LengthUnit,
  type MoldShape,
} from "@/lib/mold-engine";
import { encodeRecipe } from "@/lib/recipe-url";
import { STORAGE_KEY, useRecipeStore } from "@/lib/recipe-store";
import { cn } from "@/lib/utils";

const SHAPES: { id: MoldShape; label: string }[] = [
  { id: "loaf", label: "Loaf" },
  { id: "slab", label: "Slab" },
  { id: "cylinder", label: "Cylinder" },
  { id: "water_fill", label: "Water fill" },
];

export function MoldCalculator() {
  const navigate = useNavigate();
  const unit = useRecipeStore((s) => s.config.unit);
  const oils = useRecipeStore((s) => s.config.oils);
  const scaleOilsTo = useRecipeStore((s) => s.scaleOilsTo);
  const [mold, setMold] = useState(EMPTY_MOLD);
  const [fill, setFill] = useState<FillMode>("headspace");

  const result = useMemo(() => computeMold(mold, fill), [mold, fill]);
  const target = gramsToRecipeUnit(result.oilWeightGrams, unit);
  const canInject = oils.length > 0 && result.oilWeightGrams > 0;

  function inject() {
    if (!canInject) return;
    scaleOilsTo(target);
    const next = useRecipeStore.getState().config;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore quota */
    }
    void navigate({ to: "/", search: { r: encodeRecipe(next) } });
  }

  return (
    <SpecCard kicker="Volumetric" title="Mold to batch">
      <div className="grid grid-cols-2 gap-1 rounded-lg bg-bg-subtle p-1 sm:grid-cols-4">
        {SHAPES.map((shape) => (
          <button
            key={shape.id}
            type="button"
            onClick={() => setMold((current) => ({ ...current, shape: shape.id }))}
            className={cn(
              "h-12 rounded-md px-2 text-xs font-medium sm:text-sm",
              mold.shape === shape.id
                ? "bg-surface text-ink shadow-sm"
                : "text-muted hover:text-ink",
            )}
          >
            {shape.label}
          </button>
        ))}
      </div>

      {mold.shape !== "water_fill" ? (
        <div className="mt-4 flex rounded-lg bg-bg-subtle p-1">
          {(["in", "cm"] as LengthUnit[]).map((lengthUnit) => (
            <button
              key={lengthUnit}
              type="button"
              onClick={() => setMold((current) => ({ ...current, unit: lengthUnit }))}
              className={cn(
                "h-12 flex-1 rounded-md text-sm font-medium",
                mold.unit === lengthUnit
                  ? "bg-surface text-ink shadow-sm"
                  : "text-muted hover:text-ink",
              )}
            >
              {lengthUnit === "in" ? "Inches" : "Centimetres"}
            </button>
          ))}
        </div>
      ) : null}

      <div className="mt-4 grid grid-cols-2 gap-3">
        {mold.shape === "cylinder" ? (
          <>
            <Dim
              id="diameter"
              label="Diameter"
              value={mold.diameter}
              unit={mold.unit}
              onChange={(diameter) => setMold((current) => ({ ...current, diameter }))}
            />
            <Dim
              id="cyl-h"
              label="Height"
              value={mold.height}
              unit={mold.unit}
              onChange={(height) => setMold((current) => ({ ...current, height }))}
            />
          </>
        ) : mold.shape === "water_fill" ? (
          <div className="col-span-2">
            <Dim
              id="water"
              label="Water fill weight"
              value={mold.waterGrams}
              unit="g"
              onChange={(waterGrams) => setMold((current) => ({ ...current, waterGrams }))}
            />
          </div>
        ) : (
          <>
            <Dim
              id="length"
              label="Length"
              value={mold.length}
              unit={mold.unit}
              onChange={(length) => setMold((current) => ({ ...current, length }))}
            />
            <Dim
              id="width"
              label="Width"
              value={mold.width}
              unit={mold.unit}
              onChange={(width) => setMold((current) => ({ ...current, width }))}
            />
            <Dim
              id="height"
              label="Height"
              value={mold.height}
              unit={mold.unit}
              onChange={(height) => setMold((current) => ({ ...current, height }))}
            />
          </>
        )}
      </div>

      <div className="mt-4 flex rounded-lg bg-bg-subtle p-1">
        {(
          [
            { id: "brim", label: "Fill to brim" },
            { id: "headspace", label: "10% headspace" },
          ] as const
        ).map((mode) => (
          <button
            key={mode.id}
            type="button"
            onClick={() => setFill(mode.id)}
            className={cn(
              "h-12 flex-1 rounded-md px-2 text-sm font-medium",
              fill === mode.id
                ? "bg-surface text-ink shadow-sm"
                : "text-muted hover:text-ink",
            )}
          >
            {mode.label}
          </button>
        ))}
      </div>

      <dl className="mt-4 divide-y divide-line">
        <Row
          label="Volume"
          value={`${result.volumeCm3.toLocaleString("en-US", {
            maximumFractionDigits: 1,
          })} cm³`}
        />
        <Row
          label={`Batter × ${BATTER_DENSITY_G_CM3}`}
          value={formatMass(result.batterGrams, "g")}
        />
        <Row
          label={`Oil charge × ${OIL_FRACTION_OF_BATTER}`}
          value={formatMass(target, unit)}
        />
      </dl>

      <Button
        type="button"
        size="lg"
        className="mt-4 h-12 w-full"
        disabled={!canInject}
        onClick={inject}
      >
        Size my recipe to this mold
      </Button>
      {!canInject ? (
        <p className="mt-2 text-xs text-muted">
          Add at least one oil on the soap bench first, so this can scale your recipe
          to fit the mold.
        </p>
      ) : null}
    </SpecCard>
  );
}

function Dim({
  id,
  label,
  value,
  unit,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  unit: string;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="mt-1">
        <MassField id={id} value={value} unit={unit} ariaLabel={label} onChange={onChange} />
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-3 text-sm">
      <dt className="text-muted">{label}</dt>
      <dd className="font-mono tabular-nums text-ink">{value}</dd>
    </div>
  );
}
