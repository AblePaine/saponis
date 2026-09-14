import { AlertTriangle, Droplets, FlaskConical, Scale } from "lucide-react";
import { getOilById } from "@/data/oils";
import { Badge } from "@/components/ui/badge";
import {
  DANGER_UNSATURATED_SOLUTION,
  FATTY_ACID_KEYS,
  WARNING_EXCESS_WATER,
  WARNING_STRIPPING_BAR,
  type BatchResult,
  type FattyAcidKey,
  type QualityScoreKey,
  type RecipeConfig,
} from "@/types/soap";
import { formatMass, formatPercent, formatRatio, formatScore } from "@/lib/format";
import { cn } from "@/lib/utils";

const FA_LABELS: Record<FattyAcidKey, string> = {
  lauric: "Lauric C12",
  myristic: "Myristic C14",
  palmitic: "Palmitic C16",
  stearic: "Stearic C18",
  ricinoleic: "Ricinoleic",
  oleic: "Oleic C18:1",
  linoleic: "Linoleic C18:2",
  linolenic: "Linolenic C18:3",
};

interface QualityMeta {
  label: string;
  hint: string;
  min: number;
  max: number;
  ceiling: number;
}

const QUALITY_META: Record<QualityScoreKey, QualityMeta> = {
  hardness: { label: "Hardness", hint: "Lauric + myristic + palmitic + stearic", min: 29, max: 54, ceiling: 80 },
  cleansing: { label: "Cleansing", hint: "Lauric + myristic", min: 12, max: 22, ceiling: 80 },
  conditioning: { label: "Conditioning", hint: "Oleic + linoleic + linolenic + ricinoleic", min: 44, max: 69, ceiling: 100 },
  bubbly: { label: "Bubbly", hint: "Lauric + myristic + ricinoleic", min: 14, max: 32, ceiling: 80 },
  creamy: { label: "Creamy", hint: "Palmitic + stearic + ricinoleic", min: 16, max: 48, ceiling: 80 },
  longevity: { label: "Longevity", hint: "Palmitic + stearic", min: 21, max: 50, ceiling: 80 },
  iodine: { label: "Iodine", hint: "Weighted iodine value", min: 41, max: 70, ceiling: 120 },
  ins: { label: "INS", hint: "Weighted INS value", min: 136, max: 165, ceiling: 280 },
};

function alertTone(alert: string): "danger" | "warn" {
  return alert.startsWith("DANGER_") ? "danger" : "warn";
}

function alertCopy(alert: string): { title: string; body: string } {
  if (alert === DANGER_UNSATURATED_SOLUTION) {
    return {
      title: "Lye too concentrated",
      body: "Water ratio is too low to safely dissolve the alkali. Increase liquid before mixing.",
    };
  }
  if (alert === WARNING_EXCESS_WATER) {
    return {
      title: "High liquid content",
      body: "A wet batter makes soft bars, a long cure, and soda ash. Tighten the water if you want a firmer bar.",
    };
  }
  if (alert === WARNING_STRIPPING_BAR) {
    return {
      title: "Stripping profile",
      body: "Cleansing is above 22 with a thin superfat. Raise superfat or cut coconut / lauric oils.",
    };
  }
  if (alert.startsWith("UNKNOWN_OIL")) {
    return { title: "Unknown oil", body: alert.replace(/^UNKNOWN_OIL:\s*/, "") };
  }
  return { title: "Notice", body: alert };
}

function QualityBar({
  metric,
  value,
}: {
  metric: QualityScoreKey;
  value: number;
}) {
  const meta = QUALITY_META[metric];
  const pct = Math.min(100, Math.max(0, (value / meta.ceiling) * 100));
  const rangeLeft = (meta.min / meta.ceiling) * 100;
  const rangeWidth = ((meta.max - meta.min) / meta.ceiling) * 100;
  const inRange = value >= meta.min && value <= meta.max;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm text-ink-soft">{meta.label}</span>
        <span
          className={cn(
            "font-mono text-sm tabular-nums",
            inRange ? "text-ink" : "text-warn",
          )}
        >
          {formatScore(value)}
        </span>
      </div>
      <div className="relative h-2 overflow-hidden rounded-full bg-bg-subtle">
        <div
          className="absolute inset-y-0 rounded-full bg-primary-soft"
          style={{ left: `${rangeLeft}%`, width: `${rangeWidth}%` }}
        />
        <div
          className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary shadow-sm"
          style={{ left: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Scale;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-surface p-3 shadow-[var(--shadow-border)] sm:p-4">
      <div className="flex items-center gap-2 text-muted">
        <Icon className="size-4" />
        <span className="text-xs font-medium tracking-wide uppercase">{label}</span>
      </div>
      <p className="mt-2 font-mono text-lg tabular-nums tracking-tight text-ink sm:text-xl">
        {value}
      </p>
    </div>
  );
}

export function BatchResults({
  config,
  result,
}: {
  config: RecipeConfig;
  result: BatchResult;
}) {
  const unit = config.unit;
  const saponified = config.oils.flatMap((row) => {
    const record = getOilById(row.oilId);
    if (!record) return [];
    const names: string[] = [];
    if (config.lyeChoice.naohRatio > 0) names.push(record.inci_names.saponified_naoh);
    if (config.lyeChoice.naohRatio < 1) names.push(record.inci_names.saponified_koh);
    return names;
  });
  const uniqueInci = [...new Set(saponified)];

  return (
    <div className="flex flex-col gap-5">
      {result.safetyAlerts.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {result.safetyAlerts.map((alert) => {
            const tone = alertTone(alert);
            const copy = alertCopy(alert);
            return (
              <li
                key={alert}
                className={cn(
                  "flex gap-3 rounded-xl px-3 py-3 sm:px-4",
                  tone === "danger" ? "bg-danger-soft text-danger" : "bg-warn-soft text-warn",
                )}
              >
                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                <div>
                  <p className="text-sm font-medium">{copy.title}</p>
                  <p className="text-sm opacity-90">{copy.body}</p>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="flex gap-3 rounded-xl bg-ok-soft px-3 py-3 text-ok sm:px-4">
          <FlaskConical className="mt-0.5 size-4 shrink-0" />
          <p className="text-sm">
            No safety flags on this batter. Still weigh alkali with PPE and add lye to liquid, never the reverse.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <Stat icon={Scale} label="Oils" value={formatMass(result.totalOilWeight, unit)} />
        <Stat
          icon={FlaskConical}
          label="Dry lye"
          value={formatMass(result.dryLyeWeight.total, unit)}
        />
        <Stat icon={Droplets} label="Liquid" value={formatMass(result.liquidWeight, unit)} />
        <Stat icon={Scale} label="Batch" value={formatMass(result.totalBatchWeight, unit)} />
      </div>

      <section className="rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5">
        <h2 className="font-display text-lg font-medium tracking-tight">Lye ledger</h2>
        <dl className="mt-3 divide-y divide-line">
          <LedgerRow label="NaOH" value={formatMass(result.dryLyeWeight.naoh, unit)} />
          <LedgerRow label="KOH" value={formatMass(result.dryLyeWeight.koh, unit)} />
          <LedgerRow
            label="Concentration"
            value={formatPercent(result.lyeConcentrationPercent)}
          />
          <LedgerRow label="Water : lye" value={formatRatio(result.waterToLyeRatio)} />
          <LedgerRow
            label="Water as % oils"
            value={formatPercent(result.waterAsPercentOils)}
          />
        </dl>
      </section>

      <section className="rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-display text-lg font-medium tracking-tight">Quality fingerprint</h2>
          <span className="text-[11px] tracking-wide text-faint uppercase">Typical band</span>
        </div>
        <div className="mt-4 flex flex-col gap-3">
          {(Object.keys(QUALITY_META) as QualityScoreKey[]).map((key) => (
            <QualityBar key={key} metric={key} value={result.qualityScores[key]} />
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5">
        <h2 className="font-display text-lg font-medium tracking-tight">Fatty acids</h2>
        <ul className="mt-3 flex flex-col gap-2">
          {FATTY_ACID_KEYS.map((key) => {
            const value = result.fattyAcids[key];
            return (
              <li key={key} className="flex items-center gap-3">
                <span className="w-28 shrink-0 text-xs text-muted sm:w-32">
                  {FA_LABELS[key]}
                </span>
                <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-bg-subtle">
                  <div
                    className="h-full rounded-full bg-primary/80"
                    style={{ width: `${Math.min(100, value)}%` }}
                  />
                </div>
                <span className="w-12 text-right font-mono text-xs tabular-nums text-ink-soft">
                  {formatPercent(value, 1)}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      {uniqueInci.length > 0 ? (
        <section>
          <h2 className="font-display text-lg font-medium tracking-tight">Saponified INCI</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {uniqueInci.map((name) => (
              <Badge key={name} variant="outline" className="normal-case tracking-normal">
                {name}
              </Badge>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function LedgerRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-2.5">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="font-mono text-sm tabular-nums text-ink">{value}</dd>
    </div>
  );
}
