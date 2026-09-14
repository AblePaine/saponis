import { FATTY_ACID_KEYS, type FattyAcidProfile } from "@/types/soap";
import {
  FAMILY_LABEL,
  FATTY_ACID_META,
  unlistedFattyAcids,
  type FattyAcidFamily,
} from "@/lib/oil-specs";
import { formatPercent } from "@/lib/format";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const FAMILY_BAR: Record<FattyAcidFamily, string> = {
  saturated: "bg-primary",
  monounsaturated: "bg-ink-soft",
  polyunsaturated: "bg-warn",
  hydroxy: "bg-ok",
};

export function FattySpectrum({ profile }: { profile: FattyAcidProfile }) {
  const unlisted = unlistedFattyAcids(profile);
  const max = Math.max(
    1,
    ...FATTY_ACID_KEYS.map((key) => profile[key]),
    unlisted,
  );

  return (
    <Tabs defaultValue="visual">
      <TabsList className="w-full">
        <TabsTrigger value="visual">Spectrum</TabsTrigger>
        <TabsTrigger value="table">Table</TabsTrigger>
      </TabsList>
      <TabsContent value="visual" className="mt-4">
        <ul className="flex flex-col gap-2.5">
          {FATTY_ACID_KEYS.map((key) => {
            const meta = FATTY_ACID_META[key];
            const value = profile[key];
            return (
              <li key={key} className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-xs text-muted sm:w-28">
                  {meta.label}
                  <span className="mt-0.5 block font-mono text-faint">{meta.chain}</span>
                </span>
                <div className="h-3 min-w-0 flex-1 overflow-hidden rounded-full bg-bg-subtle">
                  <div
                    className={cn("h-full rounded-full", FAMILY_BAR[meta.family])}
                    style={{ width: `${(value / max) * 100}%` }}
                  />
                </div>
                <span className="w-14 text-right font-mono text-xs tabular-nums text-ink">
                  {formatPercent(value)}
                </span>
              </li>
            );
          })}
          {unlisted > 0.05 ? (
            <li className="flex items-center gap-3">
              <span className="w-24 shrink-0 text-xs text-muted sm:w-28">
                Unlisted
                <span className="mt-0.5 block font-mono text-faint">C8–C10+</span>
              </span>
              <div className="h-3 min-w-0 flex-1 overflow-hidden rounded-full bg-bg-subtle">
                <div
                  className="h-full rounded-full bg-line-strong"
                  style={{ width: `${(unlisted / max) * 100}%` }}
                />
              </div>
              <span className="w-14 text-right font-mono text-xs tabular-nums text-ink">
                {formatPercent(unlisted)}
              </span>
            </li>
          ) : null}
        </ul>
        <ul className="mt-4 flex flex-wrap gap-3 text-xs text-muted">
          {(Object.keys(FAMILY_LABEL) as FattyAcidFamily[]).map((family) => (
            <li key={family} className="inline-flex items-center gap-1.5">
              <span className={cn("size-2 rounded-full", FAMILY_BAR[family])} />
              {FAMILY_LABEL[family]}
            </li>
          ))}
        </ul>
      </TabsContent>
      <TabsContent value="table" className="mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs tracking-wide text-muted uppercase">
                <th className="py-2 pr-3 font-medium">Acid</th>
                <th className="py-2 pr-3 font-medium">Chain</th>
                <th className="py-2 pr-3 font-medium">Family</th>
                <th className="py-2 pr-3 font-medium">Role</th>
                <th className="py-2 text-right font-medium">%</th>
              </tr>
            </thead>
            <tbody>
              {FATTY_ACID_KEYS.map((key) => {
                const meta = FATTY_ACID_META[key];
                return (
                  <tr key={key} className="border-b border-line last:border-0">
                    <td className="py-2 pr-3 text-ink">{meta.label}</td>
                    <td className="py-2 pr-3 font-mono text-xs tabular-nums">{meta.chain}</td>
                    <td className="py-2 pr-3 text-muted">{FAMILY_LABEL[meta.family]}</td>
                    <td className="py-2 pr-3 text-muted">{meta.contribution}</td>
                    <td className="py-2 text-right font-mono tabular-nums">
                      {formatPercent(profile[key])}
                    </td>
                  </tr>
                );
              })}
              {unlisted > 0.05 ? (
                <tr>
                  <td className="py-2 pr-3 text-ink">Unlisted</td>
                  <td className="py-2 pr-3 font-mono text-xs">C8–C10+</td>
                  <td className="py-2 pr-3 text-muted">—</td>
                  <td className="py-2 pr-3 text-muted">Caprylic/capric and minors</td>
                  <td className="py-2 text-right font-mono tabular-nums">
                    {formatPercent(unlisted)}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </TabsContent>
    </Tabs>
  );
}
