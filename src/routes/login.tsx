import { Link, Navigate, createFileRoute } from "@tanstack/react-router";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Button } from "@/components/ui/button";
import { DirectoryHeader } from "@/components/oils/directory-header";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Saponis Pro" },
      {
        name: "description",
        content: "Passwordless sign-in for Saponis Pro. No passwords to reset.",
      },
    ],
  }),
  component: Login,
});

function Login() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 py-6 sm:px-6">
        <DirectoryHeader />
        <div className="mt-10 h-64 animate-pulse rounded-2xl bg-surface" aria-hidden="true" />
      </main>
    );
  }
  if (user) {
    return <Navigate to="/app" search={{}} />;
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 py-6 sm:px-6">
      <DirectoryHeader />
      <section className="mt-10 rounded-2xl bg-surface p-5 shadow-[var(--shadow-border)]">
        <p className="text-xs font-medium tracking-[0.22em] text-muted uppercase">
          Account
        </p>
        <h1 className="mt-1 font-display text-3xl font-medium tracking-tight">
          Sign in
        </h1>
        <p className="mt-2 text-sm text-muted">
          Passwordless. Continue with Google or X. No passwords, no reset tickets.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          {authEnabled ? (
            GROK_PROVIDERS.map((provider) => (
              <Button
                key={provider.providerId}
                type="button"
                size="lg"
                className="h-12 w-full"
                onClick={() => signIn(provider.providerId, { callbackURL: "/app" })}
              >
                Continue with {provider.label}
              </Button>
            ))
          ) : (
            <p className="text-sm text-muted">Sign-in is disabled in this build.</p>
          )}
        </div>
        <p className="mt-6 text-xs text-faint">
          Pro is $12 / month or $99 / year after you sign in. The public calculator
          stays free.
        </p>
      </section>
      <Link
        to="/soap"
        search={{}}
        className="mt-6 inline-flex h-12 items-center text-sm font-medium text-primary"
      >
        Back to soap bench
      </Link>
    </main>
  );
}
