import { METRIC_KEYS, QUALITY_RANGES } from "@/lib/quality-ranges";
import { formatScore } from "@/lib/format";
import { cn } from "@/lib/utils";
import { StepCard } from "@/components/calculator/step-card";
import type { BatchResult } from "@/types/soap";

export function StepMetrics({ result }: { result: BatchResult }) {
  return (
    <StepCard
      step={3}
      title="Performance"
      subtitle="Live bars against recommended soapmaking ranges."
    >
      <div className="flex flex-col gap-4">
        {METRIC_KEYS.map((key) => {
          const meta = QUALITY_RANGES[key];
          const value = result.qualityScores[key];
          const pct = Math.min(100, Math.max(0, (value / meta.ceiling) * 100));
          const rangeLeft = (meta.min / meta.ceiling) * 100;
          const rangeWidth = ((meta.max - meta.min) / meta.ceiling) * 100;
          const inRange = value >= meta.min && value <= meta.max;
          return (
            <div key={key} className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-3">
                <div>
                  <p className="text-sm text-ink">{meta.label}</p>
                  <p className="text-xs text-faint">
                    Target {meta.min}–{meta.max}
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
        })}
      </div>
    </StepCard>
  );
}
