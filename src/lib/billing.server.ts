/**
 * Stripe billing (server-only).
 *
 * Host env — never VITE_*, never a .env file in this workspace:
 *   STRIPE_SECRET_KEY       sk_live_… / sk_test_…
 *   STRIPE_WEBHOOK_SECRET   whsec_… (endpoint: /api/stripe-webhook)
 *   STRIPE_PRICE_MONTHLY    optional Price id; otherwise $12/mo price_data
 *   STRIPE_PRICE_YEARLY     optional Price id; otherwise $99/yr price_data
 *
 * Auth is the platform Better Auth broker (Google / X), not Supabase.
 * Do not set SUPABASE_URL or SUPABASE_ANON_KEY — they are unused.
 */
import Stripe from "stripe";
import { getSql } from "@/lib/db";
import { env } from "@/lib/env.server";
import {
  MONTHLY_USD,
  YEARLY_USD,
  type Entitlements,
  type PriceInterval,
} from "./billing-types.ts";

const ACTIVE = new Set(["active", "trialing"]);

export function stripeConfigured(): boolean {
  return Boolean(env("STRIPE_SECRET_KEY"));
}

export function getStripe(): Stripe {
  const key = env("STRIPE_SECRET_KEY");
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(key);
}

export async function readEntitlements(userId: string): Promise<Entitlements> {
  if (!stripeConfigured()) {
    return {
      pro: true,
      checkoutEnabled: false,
      portalEnabled: false,
      interval: null,
      status: "unlocked",
      source: "unlocked",
    };
  }

  const sql = await getSql();
  const rows = await sql<{
    status: string;
    price_interval: string | null;
  }>`
    select status, price_interval
    from subscriptions
    where user_id = ${userId}
    limit 1
  `;
  const row = rows[0];
  const status = row?.status ?? "inactive";
  const interval =
    row?.price_interval === "year" || row?.price_interval === "month"
      ? row.price_interval
      : null;
  const pro = ACTIVE.has(status);
  return {
    pro,
    checkoutEnabled: !pro,
    portalEnabled: Boolean(row?.status) && status !== "inactive",
    interval,
    status,
    source: "stripe",
  };
}

export async function upsertCustomerId(
  userId: string,
  customerId: string,
): Promise<void> {
  const sql = await getSql();
  await sql`
    insert into subscriptions (user_id, stripe_customer_id, status, updated_at)
    values (${userId}, ${customerId}, 'inactive', now())
    on conflict (user_id) do update
      set stripe_customer_id = excluded.stripe_customer_id,
          updated_at = now()
  `;
}

export async function getStripeCustomerId(userId: string): Promise<string | null> {
  const sql = await getSql();
  const rows = await sql<{ stripe_customer_id: string | null }>`
    select stripe_customer_id from subscriptions where user_id = ${userId} limit 1
  `;
  return rows[0]?.stripe_customer_id ?? null;
}

export async function applySubscriptionSnapshot(params: {
  customerId: string;
  userId?: string | null;
  subscriptionId: string | null;
  status: string;
  interval: string | null;
  periodEnd: Date | null;
}): Promise<void> {
  const sql = await getSql();
  let userId = params.userId ?? null;
  if (!userId) {
    const rows = await sql<{ user_id: string }>`
      select user_id from subscriptions
      where stripe_customer_id = ${params.customerId}
      limit 1
    `;
    userId = rows[0]?.user_id ?? null;
  }
  if (!userId) return;

  await sql`
    insert into subscriptions (
      user_id,
      stripe_customer_id,
      stripe_subscription_id,
      status,
      price_interval,
      current_period_end,
      updated_at
    )
    values (
      ${userId},
      ${params.customerId},
      ${params.subscriptionId},
      ${params.status},
      ${params.interval},
      ${params.periodEnd ? params.periodEnd.toISOString() : null},
      now()
    )
    on conflict (user_id) do update
      set stripe_customer_id = excluded.stripe_customer_id,
          stripe_subscription_id = excluded.stripe_subscription_id,
          status = excluded.status,
          price_interval = excluded.price_interval,
          current_period_end = excluded.current_period_end,
          updated_at = now()
  `;
}

export function lineItemFor(
  interval: PriceInterval,
): Stripe.Checkout.SessionCreateParams.LineItem {
  const monthlyId = env("STRIPE_PRICE_MONTHLY");
  const yearlyId = env("STRIPE_PRICE_YEARLY");
  if (interval === "month" && monthlyId) return { price: monthlyId, quantity: 1 };
  if (interval === "year" && yearlyId) return { price: yearlyId, quantity: 1 };
  return {
    quantity: 1,
    price_data: {
      currency: "usd",
      unit_amount: (interval === "year" ? YEARLY_USD : MONTHLY_USD) * 100,
      recurring: { interval },
      product_data: {
        name: "Saponis Pro",
        description:
          "FDA + EU/UK ingredient labels and mold volumetric batch sizing.",
      },
    },
  };
}

function subscriptionPeriodEnd(sub: Stripe.Subscription): Date | null {
  const unix = sub.items.data[0]?.current_period_end;
  return typeof unix === "number" ? new Date(unix * 1000) : null;
}

export async function handleStripeEvent(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerId =
        typeof session.customer === "string" ? session.customer : session.customer?.id;
      const subscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id;
      if (!customerId) break;
      const userId =
        (session.client_reference_id || session.metadata?.userId || "").trim() || null;
      let interval: string | null = session.metadata?.interval ?? null;
      let status = "active";
      let periodEnd: Date | null = null;
      if (subscriptionId && stripeConfigured()) {
        const sub = await getStripe().subscriptions.retrieve(subscriptionId);
        status = sub.status;
        interval = sub.items.data[0]?.price.recurring?.interval ?? interval;
        periodEnd = subscriptionPeriodEnd(sub);
      }
      await applySubscriptionSnapshot({
        customerId,
        userId,
        subscriptionId: subscriptionId ?? null,
        status,
        interval,
        periodEnd,
      });
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
      await applySubscriptionSnapshot({
        customerId,
        subscriptionId: sub.id,
        status: event.type === "customer.subscription.deleted" ? "canceled" : sub.status,
        interval: sub.items.data[0]?.price.recurring?.interval ?? null,
        periodEnd: subscriptionPeriodEnd(sub),
      });
      break;
    }
    default:
      break;
  }
}
