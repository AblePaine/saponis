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

## Out of scope (deliberate, core bench)

- No wick recommendations on the core batch bench (the expansion below
  ships engine C as a *test card*, not a recommendation — see its notes).
- No cure times or burn-performance claims.
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

---

# Expansion — the rest of the brief's engine sequence (2026-10-31)

Green-lit by Brad 2026-10-31 as the "Candle Studio expansion (Tier 1
Build 2)". The 2026-09-29 brief's build order was **A → B → E → D → C**;
A + B shipped as the core bench above. This expansion completes the
sequence on the same `/candles` page, below the batch bench, with the
same parity wiring (agent tool + REST route + OpenAPI + manifest +
llms.txt per engine) and the same data posture (seed values stamped
SEED, caps user-supplied only). Each tool keeps its state in its own
query param — the batch bench owns `?r=`; these use `?f=`, `?b=`, `?w=`
(see `src/lib/bench-url.ts`).

## E — multi-format fragrance card (`fo-card-engine.ts`)

One oil run through the formats the maker selects — candle, wax melt,
reed diffuser, bar soap. Per format: the split at the desired load
(**% of finished**, the IFRA convention, reusing `dualBasisSplit`),
the load re-expressed as % of wax for the wax formats, and the
**binding cap** — the lower of the user-entered IFRA cap (% of
finished) and the wax supplier's hold limit converted from % of wax,
`p/(100+p)`. No cap entered = no ceiling, stated on the card. This is
the engine the brief said is "the only reason this belongs on Saponis":
the same percent is a different answer in each format.

## D — wax blend window (`candle-blend-engine.ts`)

Mass-weighted blend arithmetic over a seed profile library
(`src/data/candle-blend-profiles.ts`: melt band, pour window, relative
hardness, frost tendency per wax class): blend SG (one click sends it
to the batch bench's custom-SG field), weighted melt band, pour window
widened by component melt divergence, hardness/frost bands,
container/pillar suitability. Stearic and vybar effects are heuristics
and are labelled as such wherever they print. Outputs are estimates
for comparing blends, stamped as such — the pour window is a range to
start testing in, not a promise.

## C — wick starting point + burn-test card (`wick-engine.ts`)

Shipped in the only form consistent with this bench's doctrine: not a
wick oracle but a **test card**. Per series (CD, ECO, LX, HTP, wooden —
seed ladder data in `src/data/wick-guide.ts`, seeded from the structure
of supplier-published per-wax/per-diameter charts), a three-wick matrix
— one size down, the seeded start, one up — for the vessel diameter,
shifted by wax family (beeswax +1, container paraffin −1) and by
fragrance load (≥12% shifts +1). Attached is the burn-test protocol,
computed from the diameter: first burn ≈ 1 hour per inch of diameter,
melt pool to the walls at ¼″–½″ depth, three full cycles before
judging, one variable changed at a time. Above ≈4¼″ the card advises
pricing a double-wick test. The protocol is the deliverable; the table
is a first guess with its seed stamp on it.

## Expansion files

- `src/data/candle-blend-profiles.ts`, `src/data/wick-guide.ts` — seed libraries.
- `src/lib/fo-card-engine.ts`, `src/lib/candle-blend-engine.ts`,
  `src/lib/wick-engine.ts` — pure TS cores + node:test suites (registered
  in `package.json`).
- `src/components/calculator/candle-studio-tools.tsx` — the three tools
  (steps 5–7) on the shared bench shell.
- Agent parity: tools `fo_card_calculate`, `candle_blend_calculate`,
  `wick_start_calculate`; REST `POST /api/fo-card/calculate`,
  `/api/candle-blend/calculate`, `/api/wick/calculate`.
