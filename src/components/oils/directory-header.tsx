import { Link } from "@tanstack/react-router";
import { AuthSlot } from "@/components/auth-slot";
import { BrandMark } from "@/components/brand-mark";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Hub", current: "hub" },
  { to: "/soap", label: "Soap", current: "calculator" },
  { to: "/oils", label: "Oils", current: "library" },
  { to: "/oils/compare", label: "Compare", current: "compare" },
  { to: "/app", label: "Pro", current: "pro" },
] as const;

export function DirectoryHeader({
  current,
}: {
  current?: "hub" | "calculator" | "library" | "compare" | "pro";
}) {
  return (
    <header className="border-b border-line pb-4">
      <div className="flex items-center justify-between gap-3">
        <Link to="/" search={{}} className="flex min-w-0 items-center gap-3">
          <BrandMark />
          <div className="min-w-0">
            <p className="text-xs font-medium tracking-[0.22em] text-muted uppercase">
              {current === "calculator" ? "Cold-process bench" : "Formulation hub"}
            </p>
            <p className="font-display text-xl font-medium tracking-tight text-ink">Saponis</p>
          </div>
        </Link>
        <AuthSlot />
      </div>
      <nav className="mt-3 flex gap-1 overflow-x-auto">
        {NAV.map((item) => {
          const active = current === item.current;
          return (
            <Link
              key={item.to}
              to={item.to}
              search={
                item.to === "/soap" || item.to === "/app" || item.to === "/" ? {} : undefined
              }
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
