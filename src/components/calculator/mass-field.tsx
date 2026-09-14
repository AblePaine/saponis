import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";

function stringifyMass(value: number, unit: string): string {
  if (!Number.isFinite(value)) return "0";
  const digits = unit === "oz" ? 3 : unit === "%" ? 1 : 2;
  return String(Number(value.toFixed(digits)));
}

export function MassField({
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
        className="h-12 pr-10 font-mono tabular-nums"
      />
      <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-faint">
        {unit}
      </span>
    </div>
  );
}
