# Saponis

Formulation hub — stoichiometric soap, with balm, emulsion, and surfactant benches on deck.

**Site:** [saponis.app](https://saponis.app)

- Hub: `/`
- Soap bench: `/soap` (legacy `/?r=` and `/?oil=` links redirect here)
- Oil library: `/oils`

Public soap bench stays free. Pro adds FDA / EU-UK ingredient labels and mold volumetric batch sizing.

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
