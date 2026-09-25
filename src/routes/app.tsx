import { useLayoutEffect, useMemo, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { OIL_DATABASE } from "@/data/oils";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { billingSearchSchema } from "@/lib/billing";
import { computeBatch } from "@/lib/calcEngine";
import { STORAGE_KEY, parseStoredRecipe, useRecipeStore } from "@/lib/recipe-store";
import { useEntitlements } from "@/lib/use-entitlements";
import { DirectoryHeader } from "@/components/oils/directory-header";
import { LabelGenerator } from "@/components/pro/LabelGenerator";
import { MoldCalculator } from "@/components/pro/MoldCalculator";
import { UpgradePanel } from "@/components/pro/upgrade-panel";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/app")({
  validateSearch: billingSearchSchema,
  head: () => ({
    meta: [
      { title: "Pro bench — Saponis" },
      {
        name: "description",
        content:
          "Saponis Pro: FDA and EU/UK labels plus batch sizing for your mold.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProBench,
});

function ProBench() {
  const { checkout } = Route.useSearch();
  const { user, isPending } = useCurrentUserState();
  const { entitlements, isPending: billingPending, refresh } = useEntitlements();
  const config = useRecipeStore((state) => state.config);
  const setConfig = useRecipeStore((state) => state.setConfig);
  const [booted, setBooted] = useState(false);

  useLayoutEffect(() => {
    const stored = parseStoredRecipe(localStorage.getItem(STORAGE_KEY));
    if (stored) setConfig(stored);
    setBooted(true);
  }, [setConfig]);

  const result = useMemo(() => computeBatch(config, OIL_DATABASE), [config]);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col px-4 py-6 sm:px-6 lg:px-8">
      <DirectoryHeader current="pro" />

      <p className="mt-8 text-xs font-medium tracking-[0.22em] text-muted uppercase">
        Pro tools
      </p>
      <h1 className="mt-1 font-display text-3xl font-medium tracking-tight sm:text-4xl">
        Labels and molds
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        FDA labels and EU/UK declarations in one click, plus batches sized to your
        actual mold — loaf, slab, cylinder, or by water weight. The soap calculator
        stays free.
      </p>

      {checkout === "success" ? (
        <p className="mt-4 rounded-xl bg-ok-soft p-3 text-sm text-ok">
          Checkout complete. Tools unlock as soon as Stripe confirms the subscription.
        </p>
      ) : null}
      {checkout === "cancel" ? (
        <p className="mt-4 rounded-xl bg-warn-soft p-3 text-sm text-warn">
          Checkout canceled. You can subscribe any time.
        </p>
      ) : null}

      {isPending || !booted ? (
        <PendingPanel />
      ) : !user ? (
        <GuestPanel />
      ) : billingPending || !entitlements ? (
        <PendingPanel />
      ) : !entitlements.pro ? (
        <div className="mt-6">
          <UpgradePanel entitlements={entitlements} />
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          <UpgradePanel entitlements={entitlements} onUnlocked={refresh} />
          <div className="grid items-start gap-4 lg:grid-cols-2">
            <LabelGenerator config={config} result={result} />
            <MoldCalculator />
          </div>
        </div>
      )}
    </main>
  );
}

function PendingPanel() {
  return (
    <div className="mt-6 space-y-3" aria-hidden="true">
      <div className="h-36 animate-pulse rounded-2xl bg-surface" />
      <div className="h-64 animate-pulse rounded-2xl bg-surface" />
    </div>
  );
}

function GuestPanel() {
  return (
    <section className="mt-6 rounded-2xl bg-surface p-5 shadow-[var(--shadow-border)]">
      <p className="text-xs font-medium tracking-[0.22em] text-muted uppercase">
        Sign in required
      </p>
      <h2 className="mt-1 font-display text-xl font-medium tracking-tight">
        Passwordless access
      </h2>
      <p className="mt-2 text-sm text-muted">
        Sign in with Google or X — no passwords. Subscribers get labels and mold
        sizing; everyone else can upgrade right here.
      </p>
      <div className="mt-5 flex flex-col gap-3">
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
      <Link
        to="/soap"
        search={{}}
        className="mt-5 inline-flex h-12 items-center text-sm font-medium text-primary"
      >
        Stay on the free soap bench
      </Link>
    </section>
  );
}
