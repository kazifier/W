# WeldCalc — Welding Calculation Sheet

A welding engineering calculation sheet for planning weld metal quantities, consumables,
welding hours and NDT scope across multiple weld scenarios.

Live site: https://site-9ed6c568dc2a405cbf021f2dc10de291.freebuff.page

## What it calculates

For every weld scenario (material, joint configuration, thickness, process, position and extent):

| Output | Basis |
| --- | --- |
| Weld metal cross-section area | Joint geometry + cap reinforcement + root penetration |
| Weld metal volume | Area × length |
| Deposit weight | Volume × material density |
| Gross consumable | Deposit ÷ deposition efficiency |
| Wire length / electrode count / SAW flux / shielding gas | Filler form and size |
| Number of passes | Area ÷ practical bead area |
| Arc time and welder hours | Deposit ÷ arc rate, then ÷ operating factor |
| Hours per metre and per joint | Extent normalisation |
| Heat input and preheat | WPS parameters vs. material limits and carbon equivalent |
| NDT quantities and inspector hours | Linear-metre or per-joint sampling |

## Joint configurations

Square butt, single V, double V, single bevel, double bevel, single U, double U,
single J, double J, single-side and double-side T fillet, single/double lap fillet,
and single-bevel corner — with ISO 9692-1 default angles, gaps, lands and radii.

## NDT scope rule

The sheet applies two sampling bases automatically:

- **Linear metre basis** — outside diameter ≥ 1000 mm, or any straight, longitudinal or
  structural weld. Quantity tested = sample % × total length; radiographs =
  ⌈length ÷ 0.30 m effective film⌉.
- **Per joint basis** — outside diameter < 1000 mm. Joints tested = ⌈% × joint count⌉,
  so a fraction of a joint is never examined; minimum 3 exposures per joint for small bore.

Methods covered: VT, PT, MT, RT, UT, PAUT and PMI/hardness survey.

## Running locally

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production bundle in dist/
```

## Verification

The calculation engine is checked against independent hand calculations:

```bash
npx esbuild scripts/check.ts --bundle --format=esm --platform=node --outfile=/tmp/check.mjs && node /tmp/check.mjs
```

It asserts groove and fillet cross-section areas, deposit mass, arc-time and welding-hour
relationships, heat input, NDT basis resolution and NDT joint counts.

## Layout

```
src/lib/data.ts        Materials, processes, joints, NDT methods, reference constants
src/lib/calc.ts        Geometry, deposit, consumables, time and NDT engine
src/App.tsx            Shell, project state, export
src/components/        Scenarios, Results, NDT plan, Summary sheet, Reference
scripts/check.ts       Numeric verification harness
```

## Limitations

Cross-section areas are theoretical geometry; actual site consumption typically runs 5–15 %
higher because of fit-up variation, repair and rework. Deposition rates and operating factors
are shop-floor averages. This is a planning calculation, not a substitute for a qualified
WPS/PQR. Acceptance criteria remain with the applicable code (ASME B31.3 Ch. VI, API 1104
Cl. 9, ISO 5817).
