import { Link } from "@tanstack/react-router";
import { DirectoryHeader } from "@/components/oils/directory-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function ComingBench({
  kicker,
  title,
  status,
  statusLabel,
  summary,
  specs,
}: {
  kicker: string;
  title: string;
  status: "calibrating" | "next";
  statusLabel: string;
  summary: string;
  specs: string[];
}) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-4 py-6 sm:px-6 lg:px-8">
      <DirectoryHeader current="hub" />
      <p className="mt-8 text-xs font-medium tracking-[0.22em] text-muted uppercase">
        {kicker}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <h1 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
          {title}
        </h1>
        <Badge variant={status === "calibrating" ? "warn" : "outline"}>{statusLabel}</Badge>
      </div>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">{summary}</p>
      <ul className="mt-6 flex flex-col gap-2 rounded-2xl bg-surface p-5 text-sm text-muted shadow-[var(--shadow-border)]">
        {specs.map((spec) => (
          <li key={spec}>{spec}</li>
        ))}
      </ul>
      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <Button asChild className="h-12">
          <Link to="/soap" search={{}}>Open soap bench</Link>
        </Button>
        <Button asChild variant="outline" className="h-12">
          <Link to="/" search={{}}>Back to hub</Link>
        </Button>
      </div>
    </main>
  );
}
