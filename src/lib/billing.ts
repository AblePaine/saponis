import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import type { Entitlements, PriceInterval } from "@/lib/billing-types";

export type { Entitlements, PriceInterval };
export { MONTHLY_USD, YEARLY_USD } from "@/lib/billing-types";

export const getBillingState = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<Entitlements> => {
    const { readEntitlements } = await import("@/lib/billing.server");
    return readEntitlements(context.userId);
  });

export const startCheckout = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { interval: PriceInterval }) => {
    if (data.interval !== "month" && data.interval !== "year") {
      throw new Error("Invalid interval");
    }
    return data;
  })
  .handler(async ({ context, data }) => {
    const {
      getStripe,
      getStripeCustomerId,
      lineItemFor,
      stripeConfigured,
      upsertCustomerId,
    } = await import("@/lib/billing.server");
    const { getSessionUser } = await import("@/lib/auth/verify.server");
    const { getRequest } = await import("@tanstack/react-start/server");

    if (!stripeConfigured()) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }

    const request = getRequest();
    if (!request) throw new Error("Missing request");
    const host =
      request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    const proto = request.headers.get("x-forwarded-proto") ?? "https";
    if (!host) throw new Error("Missing host");
    const origin = `${proto}://${host}`;

    const stripe = getStripe();
    const sessionUser = await getSessionUser();
    let customerId = await getStripeCustomerId(context.userId);
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: sessionUser?.email ?? undefined,
        metadata: { userId: context.userId },
      });
      customerId = customer.id;
      await upsertCustomerId(context.userId, customerId);
    }

    const checkout = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      client_reference_id: context.userId,
      metadata: { userId: context.userId, interval: data.interval },
      line_items: [lineItemFor(data.interval)],
      allow_promotion_codes: true,
      success_url: `${origin}/app?checkout=success`,
      cancel_url: `${origin}/app?checkout=cancel`,
      billing_address_collection: "auto",
    });
    if (!checkout.url) throw new Error("Stripe did not return a checkout URL");
    return { url: checkout.url };
  });

export const startBillingPortal = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const {
      getStripe,
      getStripeCustomerId,
      stripeConfigured,
    } = await import("@/lib/billing.server");
    const { getRequest } = await import("@tanstack/react-start/server");
    if (!stripeConfigured()) throw new Error("STRIPE_SECRET_KEY is not set");
    const customerId = await getStripeCustomerId(context.userId);
    if (!customerId) throw new Error("No Stripe customer on this account");
    const request = getRequest();
    if (!request) throw new Error("Missing request");
    const host =
      request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    const proto = request.headers.get("x-forwarded-proto") ?? "https";
    if (!host) throw new Error("Missing host");
    const origin = `${proto}://${host}`;
    const portal = await getStripe().billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/app`,
    });
    return { url: portal.url };
  });

export const billingSearchSchema = z.object({
  checkout: z.enum(["success", "cancel"]).optional(),
});
