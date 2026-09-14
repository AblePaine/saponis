import { Link, useRouterState } from "@tanstack/react-router";
import { UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export function AuthSlot() {
  const { user, isPending } = useCurrentUserState();
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  if (isPending) {
    return (
      <div
        className="size-8 shrink-0 animate-pulse rounded-full bg-bg-subtle"
        aria-hidden="true"
      />
    );
  }
  if (user) {
    return (
      <div className="max-w-44 min-w-0 overflow-hidden sm:max-w-none">
        <UserButton />
      </div>
    );
  }
  if (pathname === "/login") return null;
  return (
    <Link
      to="/login"
      className="inline-flex h-12 shrink-0 items-center rounded-md px-3 text-sm font-medium text-muted hover:text-ink"
    >
      Sign in
    </Link>
  );
}
