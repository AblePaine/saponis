# Candle Studio — engine spec (Tier 1 Build 2)

Bench 05 on Saponis. Scope source: goal GOAL.md Tier 1 module #2 —
"Candlemaking bench → Saponis (dual-basis FO engine, vessel-fill × SG)" —
plus the gap analysis in `candlemaking-brief-2026-09-29.md` (engines A + B).
This is a bench on saponis.app, **not** a standalone site (the brief's
RED-LIGHT verdict for a standalone property stands).

## What it does

1. **Dual-basis fragrance-oil engine (brief engine A).** The maker must pick
   the convention — FO load as **% of wax weight** or **% of finished
   weight** — and the result prints _both_ percentages on every output, with
   the chosen convention named. Formulas:
   - Basis = wax: `FO = wax × p/100`; `finished = wax + FO`;
     `FO % of finished = p / (100 + p) × 100`.
   - Basis = finished: `FO = finished × p/100`; `wax = finished − FO`;
     `FO % of wax = p / (100 − p) × 100` (p ≥ 100 is invalid, flagged).
2. **Vessel-fill × SG (brief engine B).** Input is the _weighed water fill_
   of the vessel (grams of water to the intended fill line), not the jar's
   fluid-ounce label:
   `finished fill per vessel = water mass × wax SG × (1 − headspace %)`.
   Batch totals scale by vessel count; **waste/kettle-heel %** inflates the
   melt amounts only, never the fill.
3. **Optional user-supplied caps.** A maker may enter their wax supplier's
   max FO load (% of wax) and/or an IFRA cap for the specific oil (% of
   finished). The engine only _flags_ against numbers the user typed —
   Saponis seeds **no** fragrance limits of its own.

## Data

`src/data/candle-waxes.ts` — wax records carry a specific gravity used only
for the water→wax conversion. Every value is stamped **SEED / FIXTURE**
(midpoint of the range quoted in the 2026-09-29 brief for soy; estimated
seed values for the rest) and must be replaced with the supplier's published
SG for the actual wax SKU before being treated as authoritative. A custom
SG override is a first-class input for exactly that reason.

## Out of scope (deliberate)

- No wick recommendations (brief engine C — commoditized, and a lookup is
  not a burn test).
- No pour temperatures, cure times, or burn-performance claims.
- No safety guarantees in copy. The bench is a calculation tool: it shows
  its formulas and conventions, and the maker's own test burns decide.

## Files

- `src/data/candle-waxes.ts` — SG seed library.
- `src/lib/candle-engine.ts` — pure TS core (zero React imports).
- `src/lib/candle-engine.test.ts` — node:test suite (registered in
  `package.json` `test` script, same as the other engines).
- `src/components/calculator/candle-calculator.tsx` — UI on the shared
  bench shell.
- `src/routes/candles.tsx` — `/candles` route.
