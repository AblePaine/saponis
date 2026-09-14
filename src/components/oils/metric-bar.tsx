import { formatScore } from "@/lib/format";
import { cn } from "@/lib/utils";

export function MetricBar({
  label,
  hint,
  value,
  min,
  max,
  ceiling,
}: {
  label: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  ceiling: number;
}) {
  const pct = Math.min(100, Math.max(0, (value / ceiling) * 100));
  const rangeLeft = (min / ceiling) * 100;
  const rangeWidth = ((max - min) / ceiling) * 100;
  const inRange = value >= min && value <= max;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-ink">{label}</p>
          <p className="text-xs text-faint">
            {hint} · target {min}–{max}
          </p>
        </div>
        <span
          className={cn(
            "font-mono text-sm tabular-nums",
            inRange ? "text-ok" : "text-warn",
          )}
        >
          {formatScore(value)}
        </span>
      </div>
      <div className="relative h-4 overflow-hidden rounded-full bg-bg-subtle">
        <div
          className="absolute inset-y-0 bg-ok-soft"
          style={{ left: `${rangeLeft}%`, width: `${rangeWidth}%` }}
        />
        <div
          className={cn(
            "absolute inset-y-1 left-0 rounded-full",
            inRange ? "bg-ok" : "bg-warn",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
