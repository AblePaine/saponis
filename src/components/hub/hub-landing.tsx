import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { OIL_DATABASE } from "@/data/oils";
import { BrandMark } from "@/components/brand-mark";
import { AuthSlot } from "@/components/auth-slot";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const FAT_COUNT = OIL_DATABASE.length;

const NAV = [
  { to: "/soap" as const, label: "Soap" },
  { to: "/oils" as const, label: "Oils" },
  { to: "/guides" as const, label: "Guides" },
  { to: "/app" as const, label: "Pro bench" },
];

type BenchStatus = "online" | "calibrating" | "next";

const BENCHES: {
  id: string;
  kicker: string;
  title: string;
  status: BenchStatus;
  statusLabel: string;
  specs: string[];
  href?: "/soap" | "/balms" | "/emulsions" | "/surfactants";
  cta: string;
}[] = [
  {
    id: "soap",
    kicker: "01 · Soap",
    title: "Cold-process & hot-process soap",
    status: "online",
    statusLabel: "Live now",
    specs: [
      `${FAT_COUNT} verified fats & butters`,
      "Lye math for NaOH, KOH, or a blend of both",
      "INCI & FDA labels, ready to print",
      "Batch sized to your mold",
    ],
    href: "/soap",
    cta: "Open soap bench",
  },
  {
    id: "balms",
    kicker: "02 · Balms",
    title: "Balms, salves & waxes",
    status: "calibrating",
    statusLabel: "Almost ready",
    specs: [
      "Wax, butter, and oil ratios that actually set",
      "Know when it melts — and when it holds in the jar",
      "A heads-up before a batch goes grainy",
    ],
    href: "/balms",
    cta: "Preview spec",
  },
  {
    id: "emulsions",
    kicker: "03 · Creams",
    title: "Emulsions & creams",
    status: "next",
    statusLabel: "Coming soon",
    specs: [
      "The right emulsifier blend for your oil phase",
      "Preservative amounts that stay skin-safe",
      "Water adjusted for what evaporates off",
    ],
    href: "/emulsions",
    cta: "Preview spec",
  },
  {
    id: "surfactants",
    kicker: "04 · Cleansers",
    title: "Surfactant cleansers",
    status: "next",
    statusLabel: "Coming soon",
    specs: [
      "Cleansing strength dialed to your recipe",
      "Surfactants that play nice together",
      "A gentleness score for skin",
    ],
    href: "/surfactants",
    cta: "Preview spec",
  },
];

const TELEMETRY = [
  `${FAT_COUNT} fats in the library, SAP to 4 decimals`,
  "Lye amounts that don't drift",
  "Labels that follow ISO 22716 and FDA rules",
  "Runs in your browser — your recipes stay on your device",
];

function statusVariant(status: BenchStatus): "ok" | "warn" | "outline" {
  if (status === "online") return "ok";
  if (status === "calibrating") return "warn";
  return "outline";
}

export function HubLanding() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col px-4 py-6 sm:px-6 lg:px-8">
      <header className="border-b border-line pb-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <BrandMark />
            <div className="min-w-0">
              <p className="text-xs font-medium tracking-[0.22em] text-muted uppercase">
                Recipe lab
              </p>
              <p className="font-display text-xl font-medium tracking-tight text-ink">
                Saponis
              </p>
            </div>
          </div>
          <AuthSlot />
        </div>
        <p className="mt-3 flex items-center gap-2 font-mono text-xs leading-relaxed text-muted">
          <span className="size-1.5 shrink-0 rounded-full bg-ok" aria-hidden="true" />
          Everything's checked and working · v2.0
        </p>
        <nav className="mt-3 flex gap-1 overflow-x-auto">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              search={item.to === "/soap" || item.to === "/app" ? {} : undefined}
              className="inline-flex h-12 shrink-0 items-center rounded-md px-3 text-sm font-medium text-muted hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <section className="mt-8 max-w-3xl">
        <h1 className="font-display text-3xl font-medium tracking-tight text-ink sm:text-5xl sm:leading-tight">
          Soap and cosmetic recipes, minus the guesswork.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
          Get your lye right, dial in your superfat, and print labels the rules
          actually accept — without touching a spreadsheet.
        </p>
      </section>

      <ul className="mt-8 grid gap-4 md:grid-cols-2">
        {BENCHES.map((bench) => (
          <li key={bench.id}>
            <article
              className={cn(
                "flex h-full flex-col rounded-2xl bg-surface p-5 shadow-[var(--shadow-border)]",
                bench.status === "online" && "ring-1 ring-primary/25",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs font-medium tracking-[0.22em] text-muted uppercase">
                  {bench.kicker}
                </p>
                <Badge variant={statusVariant(bench.status)}>{bench.statusLabel}</Badge>
              </div>
              <h2 className="mt-3 font-display text-xl font-medium tracking-tight text-ink">
                {bench.title}
              </h2>
              <ul className="mt-3 flex flex-col gap-1.5 text-sm leading-relaxed text-muted">
                {bench.specs.map((spec) => (
                  <li key={spec}>{spec}</li>
                ))}
              </ul>
              <div className="mt-5 pt-1">
                {bench.status === "online" && bench.href === "/soap" ? (
                  <Button asChild className="h-12 w-full">
                    <Link to="/soap" search={{}}>
                      {bench.cta}
                      <ArrowRight />
                    </Link>
                  </Button>
                ) : bench.href ? (
                  <Button asChild variant="outline" className="h-12 w-full">
                    <Link to={bench.href}>{bench.cta}</Link>
                  </Button>
                ) : (
                  <Button type="button" variant="outline" className="h-12 w-full" disabled>
                    {bench.cta}
                  </Button>
                )}
              </div>
            </article>
          </li>
        ))}
      </ul>

      <section
        aria-label="System telemetry"
        className="mt-8 rounded-2xl bg-bg-subtle px-4 py-4 sm:px-5"
      >
        <p className="text-xs font-medium tracking-[0.22em] text-muted uppercase">
          Under the hood
        </p>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {TELEMETRY.map((item) => (
            <li
              key={item}
              className="font-mono text-xs leading-relaxed text-ink-soft"
            >
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8 mb-10">
        <p className="text-xs font-medium tracking-[0.22em] text-muted uppercase">
          Reference shelf
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Link
            to="/oils"
            className={cn(
              "inline-flex h-12 items-center justify-between rounded-xl bg-surface px-4 text-sm font-medium text-ink shadow-[var(--shadow-border)]",
              "sm:min-w-56",
            )}
          >
            Oil library
            <ArrowRight className="size-4 text-muted" />
          </Link>
          <Link
            to="/oils/compare"
            className={cn(
              "inline-flex h-12 items-center justify-between rounded-xl bg-surface px-4 text-sm font-medium text-ink shadow-[var(--shadow-border)]",
              "sm:min-w-56",
            )}
          >
            Oil swap tables
            <ArrowRight className="size-4 text-muted" />
          </Link>
          <Link
            to="/soap"
            search={{}}
            className={cn(
              "inline-flex h-12 items-center justify-between rounded-xl bg-surface px-4 text-sm font-medium text-ink shadow-[var(--shadow-border)]",
              "sm:min-w-56",
            )}
          >
            Open soap bench
            <ArrowRight className="size-4 text-muted" />
          </Link>
        </div>
      </section>
    </main>
  );
}
