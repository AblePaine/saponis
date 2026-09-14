import { Link } from "@tanstack/react-router";
import { AuthSlot } from "@/components/auth-slot";
import { cn } from "@/lib/utils";

function Mark() {
  return (
    <svg viewBox="0 0 32 32" className="size-8 shrink-0" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="currentColor" className="text-primary" />
      <path
        d="M10 20c0-5 6-9 6-13 0 4 6 8 6 13 0 3.3-2.7 6-6 6s-6-2.7-6-6z"
        fill="currentColor"
        className="text-primary-fg"
      />
      <path
        d="M16 9c.4 2.2-.2 4-1.4 5.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        className="text-primary"
        strokeLinecap="round"
      />
    </svg>
  );
}

const NAV = [
  { to: "/", label: "Calculator" },
  { to: "/oils", label: "Oils" },
  { to: "/oils/compare", label: "Compare" },
  { to: "/app", label: "Pro" },
] as const;

export function DirectoryHeader({
  current,
}: {
  current?: "calculator" | "library" | "compare" | "pro";
}) {
  return (
    <header className="border-b border-line pb-4">
      <div className="flex items-center justify-between gap-3">
        <Link to="/" search={{}} className="flex min-w-0 items-center gap-3">
          <Mark />
          <div className="min-w-0">
            <p className="text-xs font-medium tracking-[0.22em] text-muted uppercase">
              Cold-process bench
            </p>
            <p className="font-display text-xl font-medium tracking-tight text-ink">Saponis</p>
          </div>
        </Link>
        <AuthSlot />
      </div>
      <nav className="mt-3 flex gap-1 overflow-x-auto">
        {NAV.map((item) => {
          const active =
            (item.to === "/" && current === "calculator") ||
            (item.to === "/oils" && current === "library") ||
            (item.to === "/oils/compare" && current === "compare") ||
            (item.to === "/app" && current === "pro");
          return (
            <Link
              key={item.to}
              to={item.to}
              search={item.to === "/" || item.to === "/app" ? {} : undefined}
              className={cn(
                "inline-flex h-12 shrink-0 items-center rounded-md px-3 text-sm font-medium",
                active ? "bg-primary-soft text-primary" : "text-muted hover:text-ink",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
