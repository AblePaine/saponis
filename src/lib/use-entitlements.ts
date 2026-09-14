import { useEffect, useState } from "react";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getBillingState, type Entitlements } from "@/lib/billing";

const GUEST: Entitlements = {
  pro: false,
  checkoutEnabled: false,
  portalEnabled: false,
  interval: null,
  status: null,
  source: "stripe",
};

export function useEntitlements() {
  const { user, isPending: authPending } = useCurrentUserState();
  const [entitlements, setEntitlements] = useState<Entitlements | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authPending) return;
    if (!user) {
      setEntitlements(GUEST);
      return;
    }
    let cancelled = false;
    getBillingState()
      .then((next) => {
        if (!cancelled) {
          setEntitlements(next);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : "Billing lookup failed";
        setError(message);
        setEntitlements(GUEST);
      });
    return () => {
      cancelled = true;
    };
  }, [authPending, user]);

  return {
    entitlements,
    isPending: authPending || (Boolean(user) && entitlements === null),
    error,
    refresh: () => {
      if (!user) return;
      void getBillingState()
        .then(setEntitlements)
        .catch(() => setEntitlements(GUEST));
    },
  };
}
