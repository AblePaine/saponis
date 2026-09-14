import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MONTHLY_USD, YEARLY_USD, type Entitlements } from "@/lib/billing-types";
import { startBillingPortal, startCheckout } from "@/lib/billing";

export function UpgradePanel({
  entitlements,
  onUnlocked,
}: {
  entitlements: Entitlements;
  onUnlocked?: () => void;
}) {
  const [busy, setBusy] = useState<"month" | "year" | "portal" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function checkout(interval: "month" | "year") {
    setBusy(interval);
    setError(null);
    try {
      const { url } = await startCheckout({ data: { interval } });
      window.location.assign(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
      setBusy(null);
    }
  }

  async function portal() {
    setBusy("portal");
    setError(null);
    try {
      const { url } = await startBillingPortal();
      window.location.assign(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Portal failed");
      setBusy(null);
    }
  }

  if (entitlements.source === "unlocked") {
    return (
      <section className="rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5">
        <p className="text-xs font-medium tracking-[0.22em] text-muted uppercase">
          Billing
        </p>
        <h2 className="mt-1 font-display text-xl font-medium tracking-tight">
          Pro tools unlocked
        </h2>
        <p className="mt-2 text-sm text-muted">
          Stripe keys are not set on this host, so signed-in accounts can use the
          label engine and mold converter. To take payments, set these server
          secrets (never <span className="font-mono">VITE_</span> prefixed):
        </p>
        <ul className="mt-3 space-y-1 font-mono text-xs text-ink">
          <li>STRIPE_SECRET_KEY</li>
          <li>STRIPE_WEBHOOK_SECRET</li>
          <li>STRIPE_PRICE_MONTHLY (optional)</li>
          <li>STRIPE_PRICE_YEARLY (optional)</li>
        </ul>
        <p className="mt-3 text-xs text-faint">
          Webhook endpoint: /api/stripe-webhook — events checkout.session.completed,
          customer.subscription.updated, customer.subscription.deleted. Auth is
          passwordless Google / X via the app broker; Supabase variables are not
          used.
        </p>
        {onUnlocked ? (
          <p className="sr-only">Preview billing bypass active.</p>
        ) : null}
      </section>
    );
  }

  if (entitlements.pro) {
    return (
      <section className="rounded-2xl bg-ok-soft p-4 text-ok sm:p-5">
        <p className="text-xs font-medium tracking-[0.22em] uppercase">Plan</p>
        <h2 className="mt-1 font-display text-xl font-medium tracking-tight">
          Saponis Pro
        </h2>
        <p className="mt-1 text-sm">
          {entitlements.interval === "year"
            ? `$${YEARLY_USD} / year`
            : entitlements.interval === "month"
              ? `$${MONTHLY_USD} / month`
              : "Active"}
        </p>
        {entitlements.portalEnabled ? (
          <Button
            type="button"
            variant="secondary"
            className="mt-4 h-12"
            disabled={busy !== null}
            onClick={() => void portal()}
          >
            {busy === "portal" ? "Opening…" : "Manage billing"}
          </Button>
        ) : null}
        {error ? <p className="mt-2 text-sm text-danger">{error}</p> : null}
      </section>
    );
  }

  return (
    <section className="rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5">
      <p className="text-xs font-medium tracking-[0.22em] text-muted uppercase">
        Saponis Pro
      </p>
      <h2 className="mt-1 font-display text-xl font-medium tracking-tight">
        Unlock labels and mold math
      </h2>
      <p className="mt-2 text-sm text-muted">
        FDA input declarations, EU/UK saponified INCI, and volumetric mold charging.
        Cancel or update the card any time in the Stripe customer portal.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          disabled={busy !== null}
          onClick={() => void checkout("month")}
          className="rounded-xl bg-bg-subtle p-4 text-left"
        >
          <p className="font-display text-2xl font-medium">${MONTHLY_USD}</p>
          <p className="text-sm text-muted">per month</p>
          <p className="mt-3 text-sm font-medium text-primary">
            {busy === "month" ? "Redirecting…" : "Subscribe monthly"}
          </p>
        </button>
        <button
          type="button"
          disabled={busy !== null}
          onClick={() => void checkout("year")}
          className="rounded-xl bg-primary p-4 text-left text-primary-fg"
        >
          <p className="font-display text-2xl font-medium">${YEARLY_USD}</p>
          <p className="text-sm opacity-80">per year</p>
          <p className="mt-3 text-sm font-medium">
            {busy === "year" ? "Redirecting…" : "Subscribe yearly"}
          </p>
        </button>
      </div>
      {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
    </section>
  );
}
