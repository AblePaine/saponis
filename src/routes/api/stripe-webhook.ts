import { createFileRoute } from "@tanstack/react-router";

async function post({ request }: { request: Request }) {
  const { env } = await import("@/lib/env.server");
  const { getStripe, handleStripeEvent, stripeConfigured } = await import(
    "@/lib/billing.server"
  );
  if (!stripeConfigured()) {
    return new Response("Stripe is not configured", { status: 503 });
  }
  const secret = env("STRIPE_WEBHOOK_SECRET");
  if (!secret) {
    return new Response("STRIPE_WEBHOOK_SECRET is not set", { status: 503 });
  }
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing stripe-signature", { status: 400 });
  }
  const payload = await request.text();
  let event;
  try {
    event = getStripe().webhooks.constructEvent(payload, signature, secret);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }
  await handleStripeEvent(event);
  return Response.json({ received: true });
}

export const Route = createFileRoute("/api/stripe-webhook")({
  server: {
    handlers: {
      POST: post,
    },
  },
});
