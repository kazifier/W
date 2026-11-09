# WeldCalc — welding calculation sheet

A browser-based welding calculation sheet. It turns a weld scenario (component, connection,
base metal, joint preparation, process) into weld-metal deposit weight, consumable
requirement, welder hours and an NDT examination plan.

Live: https://site-9ed6c568dc2a405cbf021f2dc10de291.freebuff.page

## What it calculates

| Output | Basis |
| --- | --- |
| Weld cross-section area | Groove geometry (V, double V, bevel, U, J, fillet, corner, square) plus cap reinforcement and root penetration |
| Deposit weight | Area × length × weld-metal density |
| Consumable | Deposit ÷ deposition efficiency, then wire length or electrode count, flux and shielding gas |
| Welder hours | Deposit ÷ deposition rate ÷ operating factor, with position derating |
| Passes | Area ÷ practical bead area |
| Thermal checks | Heat input against the material limit; preheat from carbon equivalent |
| NDT plan | Linear metre for OD ≥ 1000 mm or straight/longitudinal welds; per joint below that |

## Scope of components

- **Pipe** — NPS 1/2" to 48" with schedules 10S, 20, 30, 40, STD, 60, 80, XS, 100, 120, 160 and XXS,
  or a custom outside diameter. Connections: pipe-to-pipe, to flange, to valve, to equipment
  shell, to dished end, to fittings and to a branch connection.
- **Plate** — shell longitudinal seam, shell circumferential seam, shell-to-dished-end, nozzle to
  shell, flat plate butt and structural T. Seam length can be a fixed figure or π × OD.
- **Tube** — exchanger tube-to-tubesheet, strength weld and seal weld, from tube outside diameter,
  wall thickness and tube count.
- **Dissimilar metal joints** — a second base metal is selected and the filler is picked from the
  material-group pair. Weld-metal density comes from the filler; preheat is governed by the
  ferritic side and the heat-input limit is the lower of the two materials.

## Run locally

```bash
npm install
npm run dev
```

## Checks

```bash
npx tsc -b                 # typecheck
npm run build              # production bundle
npx esbuild scripts/check.ts --bundle --format=esm --platform=node --outfile=/tmp/check.mjs --log-level=error && node /tmp/check.mjs
npx esbuild scripts/check-features.ts --bundle --format=esm --platform=node --outfile=/tmp/feat.mjs && node /tmp/feat.mjs
npx esbuild scripts/ssr-check.tsx --bundle --format=cjs --platform=node --jsx=automatic --outfile=scripts/.ssr.cjs && node scripts/.ssr.cjs
```
