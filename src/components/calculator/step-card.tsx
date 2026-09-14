import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function StepCard({
  step,
  title,
  subtitle,
  children,
  defaultOpen = true,
}: {
  step: number;
  title: string;
  subtitle: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="rounded-2xl bg-surface shadow-[var(--shadow-border)]">
      <button
        type="button"
        className="flex min-h-14 w-full items-center gap-3 px-4 py-3 text-left"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-soft font-mono text-sm font-medium text-primary">
          {step}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-display text-lg font-medium tracking-tight text-ink">
            {title}
          </span>
          <span className="block text-sm text-muted">{subtitle}</span>
        </span>
        <ChevronDown
          className={cn(
            "size-5 shrink-0 text-muted transition-transform duration-200",
            open ? "rotate-0" : "-rotate-90",
          )}
        />
      </button>
      {open ? <div className="border-t border-line px-4 pt-4 pb-4">{children}</div> : null}
    </section>
  );
}
