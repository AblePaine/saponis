# Saponis

Cold-process soap formulation bench — stoichiometric lye, liquid, fatty acids, and quality scores.

**Site:** [saponis.app](https://saponis.app)

Public calculator stays free. Pro adds FDA / EU-UK ingredient labels and mold volumetric batch sizing.

## Stack

TanStack Start, React, Tailwind. Auth is Google / X (Better Auth). Billing is Stripe when server secrets are set.

## Run

```bash
npm install
npm run dev
```

```bash
npm run build
npm run typecheck
```

## Host

This app builds with the Vercel Nitro preset. Point **saponis.app** at that production host. Stripe secrets (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`) are server-only — never `VITE_` prefixed.

Webhook path: `/api/stripe-webhook`.
