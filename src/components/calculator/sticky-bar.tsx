import { formatMass } from "@/lib/format";
import { safetyLabel, safetyLevel } from "@/lib/safety";
import { cn } from "@/lib/utils";
import type { BatchResult, RecipeConfig } from "@/types/soap";

export function StickyBar({
  config,
  result,
}: {
  config: RecipeConfig;
  result: BatchResult;
}) {
  const level = safetyLevel(result);
  return (
    <div className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm lg:hidden">
      <dl className="grid grid-cols-4 gap-1 px-2 py-2">
        <div className="min-w-0 text-center">
          <dt className="text-xs tracking-wide text-muted uppercase">Total</dt>
          <dd className="truncate font-mono text-sm tabular-nums text-ink">
            {formatMass(result.totalBatchWeight, config.unit)}
          </dd>
        </div>
        <div className="min-w-0 text-center">
          <dt className="text-xs tracking-wide text-muted uppercase">Dry lye</dt>
          <dd className="truncate font-mono text-sm tabular-nums text-ink">
            {formatMass(result.dryLyeWeight.total, config.unit)}
          </dd>
        </div>
        <div className="min-w-0 text-center">
          <dt className="text-xs tracking-wide text-muted uppercase">Liquid</dt>
          <dd className="truncate font-mono text-sm tabular-nums text-ink">
            {formatMass(result.liquidWeight, config.unit)}
          </dd>
        </div>
        <div className="flex min-w-0 flex-col items-center justify-center">
          <dt className="sr-only">Safety</dt>
          <span
            className={cn(
              "inline-flex h-12 min-w-16 items-center justify-center rounded-full px-2 text-xs font-medium tracking-wide uppercase",
              level === "safe" && "bg-ok-soft text-ok",
              level === "caution" && "bg-warn-soft text-warn",
              level === "hazard" && "bg-danger-soft text-danger",
            )}
          >
            {safetyLabel(level)}
          </span>
        </div>
      </dl>
    </div>
  );
}
