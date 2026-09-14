import type { MasterOilRecord } from "@/types/soap";
import { METRIC_KEYS, QUALITY_RANGES } from "@/lib/quality-ranges";
import { oilQuality, usageAdvisory } from "@/lib/oil-specs";
import { Badge } from "@/components/ui/badge";
import { MetricBar } from "@/components/oils/metric-bar";

const TAG_VARIANT = {
  hardening: "warn",
  softening: "ok",
  brittle: "danger",
} as const;

export function QualityMatrix({ oil }: { oil: MasterOilRecord }) {
  const scores = oilQuality(oil);
  const advisory = usageAdvisory(oil);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4">
        {METRIC_KEYS.map((key) => {
          const meta = QUALITY_RANGES[key];
          return (
            <MetricBar
              key={key}
              label={meta.label}
              hint={meta.hint}
              value={scores[key]}
              min={meta.min}
              max={meta.max}
              ceiling={meta.ceiling}
            />
          );
        })}
      </div>
      <div className="rounded-xl bg-bg-subtle/80 p-3">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium text-ink">
            Max {advisory.maxPercent}% of oils
          </p>
          {advisory.tags.map((tag) => (
            <Badge key={tag} variant={TAG_VARIANT[tag]}>
              {tag}
            </Badge>
          ))}
        </div>
        <ul className="mt-2 flex flex-col gap-1 text-sm text-muted">
          {advisory.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
