import { CopyBlock } from "@/components/oils/copy-block";
import { SpecCard } from "@/components/oils/spec-card";
import { OIL_DATABASE } from "@/data/oils";
import { formatMass } from "@/lib/format";
import { euSaponifiedLabel, fdaInputLabel } from "@/lib/label-engine";
import type { BatchResult, RecipeConfig } from "@/types/soap";

export function LabelGenerator({
  config,
  result,
}: {
  config: RecipeConfig;
  result: BatchResult;
}) {
  const fda = fdaInputLabel(config, result, OIL_DATABASE);
  const eu = euSaponifiedLabel(config, result, OIL_DATABASE);
  const empty = result.totalOilWeight <= 0;

  return (
    <div className="flex flex-col gap-4">
      <SpecCard kicker="US FDA" title="Input method">
        {empty ? (
          <p className="text-sm text-muted">Add oils on the calculator first.</p>
        ) : (
          <>
            <CopyBlock
              label="Declaration"
              value={fda.text}
              hint="Raw oils, water, alkali, additives — descending weight."
            />
            <ul className="mt-3 divide-y divide-line">
              {fda.lines.map((line) => (
                <li
                  key={`${line.name}-fda`}
                  className="flex items-baseline justify-between gap-3 py-2 text-sm"
                >
                  <span>
                    {line.name}
                    {line.footnote ? "*" : ""}
                  </span>
                  <span className="font-mono tabular-nums text-muted">
                    {formatMass(line.grams, "g")}
                  </span>
                </li>
              ))}
            </ul>
            {fda.lines.some((line) => line.footnote) ? (
              <p className="mt-2 text-xs text-faint">
                *None remains in finished soap.
              </p>
            ) : null}
          </>
        )}
      </SpecCard>

      <SpecCard kicker="EU / UK 1223/2009" title="Saponified salts">
        {empty ? (
          <p className="text-sm text-muted">Add oils on the calculator first.</p>
        ) : (
          <>
            <CopyBlock
              label="Declaration"
              value={eu.text}
              hint="INCI salts, Aqua after 15% cure loss, glycerin at 10.5% of oils."
            />
            <ul className="mt-3 divide-y divide-line">
              {eu.lines.map((line) => (
                <li
                  key={`${line.name}-eu`}
                  className="flex items-baseline justify-between gap-3 py-2 text-sm"
                >
                  <span>{line.name}</span>
                  <span className="font-mono tabular-nums text-muted">
                    {formatMass(line.grams, "g")}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </SpecCard>
    </div>
  );
}
