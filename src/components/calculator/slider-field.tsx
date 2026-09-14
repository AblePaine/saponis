import { Slider } from "@/components/ui/slider";
import { MassField } from "@/components/calculator/mass-field";

export function SliderField({
  min,
  max,
  step,
  value,
  onChange,
  unit,
  ariaLabel,
  id,
}: {
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  unit: string;
  ariaLabel: string;
  id?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <Slider
        className="min-h-12 flex-1"
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={([next]) => onChange(next ?? min)}
        aria-label={ariaLabel}
      />
      <div className="w-24 shrink-0">
        <MassField
          id={id}
          value={value}
          unit={unit}
          ariaLabel={ariaLabel}
          onChange={(next) => onChange(Math.min(max, Math.max(min, next)))}
        />
      </div>
    </div>
  );
}
