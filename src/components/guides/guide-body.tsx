import type { ReactNode } from "react";
import { TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GuideBlock, GuideSection } from "@/data/guides";

/** Minimal inline markup: **bold** and *italic*. Unmatched markers render literally. */
function renderInline(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*\n]+\*\*|\*[^*\n]+\*)/g);
  return parts.map((part, i) => {
    if (part.length >= 5 && part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-ink">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.length >= 3 && part.startsWith("*") && part.endsWith("*")) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return <span key={i}>{part}</span>;
  });
}

function Paragraph({ text }: { text: string }) {
  return <p className="text-sm leading-relaxed text-ink">{renderInline(text)}</p>;
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2.5 text-sm leading-relaxed">
          <span
            aria-hidden="true"
            className="mt-[7px] size-1.5 shrink-0 rounded-full bg-muted"
          />
          <span className="text-ink">{renderInline(item)}</span>
        </li>
      ))}
    </ul>
  );
}

function OrderedList({ items }: { items: string[] }) {
  return (
    <ol className="flex flex-col gap-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 text-sm leading-relaxed">
          <span
            aria-hidden="true"
            className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-soft font-mono text-xs font-medium text-primary"
          >
            {i + 1}
          </span>
          <span className="text-ink">{renderInline(item)}</span>
        </li>
      ))}
    </ol>
  );
}

function DataTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-line">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-line text-xs tracking-wide text-muted uppercase">
            {headers.map((header, i) => (
              <th key={i} className="px-3 py-2.5 font-medium whitespace-nowrap">
                {renderInline(header)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="border-b border-line last:border-0">
              {row.map((cell, ci) => (
                <td key={ci} className="px-3 py-2.5 align-top text-ink">
                  {renderInline(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Block({ block }: { block: GuideBlock }) {
  switch (block.kind) {
    case "paragraph":
      return <Paragraph text={block.text} />;
    case "list":
      return <BulletList items={block.items} />;
    case "ordered":
      return <OrderedList items={block.items} />;
    case "table":
      return <DataTable headers={block.headers} rows={block.rows} />;
  }
}

function GuideSectionCard({ section, index }: { section: GuideSection; index: number }) {
  const warning = section.accent === "warning";
  return (
    <section
      className={cn(
        "rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5",
        warning && "border border-warn/60",
      )}
    >
      <div className="flex items-center gap-2">
        {warning ? (
          <TriangleAlert className="size-4 shrink-0 text-warn" aria-hidden="true" />
        ) : null}
        <p className="text-xs font-medium tracking-[0.22em] text-muted uppercase">
          {String(index + 1).padStart(2, "0")}
        </p>
      </div>
      <h2 className="mt-1 font-display text-xl font-medium tracking-tight text-ink">
        {section.heading}
      </h2>
      <div className="mt-3 flex flex-col gap-3">
        {section.blocks.map((block, bi) => (
          <Block key={bi} block={block} />
        ))}
      </div>
    </section>
  );
}

export function GuideBody({
  sections,
  keyNumbers,
}: {
  sections: GuideSection[];
  keyNumbers: string[];
}) {
  return (
    <div className="mt-4 flex flex-col gap-4">
      {sections.map((section, i) => (
        <GuideSectionCard key={section.heading} section={section} index={i} />
      ))}
      <section className="rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5">
        <p className="text-xs font-medium tracking-[0.22em] text-muted uppercase">
          Key numbers
        </p>
        <ul className="mt-3 flex flex-col gap-2">
          {keyNumbers.map((item, i) => (
            <li key={i} className="flex gap-2.5 text-sm leading-relaxed">
              <span
                aria-hidden="true"
                className="mt-[7px] size-1.5 shrink-0 rounded-full bg-primary"
              />
              <span className="font-medium text-ink">{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
