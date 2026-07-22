# Depth Charge

A roguelike take on Minesweeper, played on a submarine's sonar console.

Descend the trench one floor at a time. Each floor is a Minesweeper board rendered
as a sonar readout: **tap** to ping a cell, numbers count the charges in the eight
cells around it, **long-press** (or flip to FLAG mode) to mark a suspected charge.
**Tap a revealed number** whose flags match its count to sweep the rest at once.

Hidden under one safe cell is the **exit hatch** — reveal it to unlock the descent,
then choose to drop immediately or press your luck for more salvage. Every mine hit
costs **hull integrity**; run out and the dark takes the pod. Spend salvage at the
**supply station** between floors, and the deeper you go the nastier the trench gets:
volatile charges that hit twice as hard, and drifting contacts that refuse to sit still.

This is not a reskin of anything in this repository — it is a fresh, self-contained
project.

## Design

- **Aesthetic:** an abyssal sonar console. Deep blue-black surfaces (OKLCH), a single
  bioluminescent phosphor accent, warm anglerfish-amber for danger. The grid *is* the
  instrument, not an underwater scene.
- **Type:** Chakra Petch (display/UI) + IBM Plex Mono (numeric readouts), self-hosted.
- **Mobile-first:** touch controls with tap / long-press / scroll discrimination and a
  thumb-reachable control bar; scales up to a framed console on desktop.
- **Accessibility:** honours `prefers-reduced-motion`, semantic roles/labels, visible
  focus states, WCAG-minded contrast.

## Modes

- **Free Dive** — a fresh, randomly seeded trench each run.
- **Daily Dive** — everyone gets the same seeded trench for the current UTC day.

Best depth, best salvage, run totals, and equipment unlocks persist in `localStorage`.

## Tech

Vite + React 18 + TypeScript. The game engine (`src/engine`) is pure, framework-free,
and deterministic (seeded RNG), with a Vitest suite covering the tricky invariants:
first-click safety, adjacency, exit placement, flood fill, chording, detonation, and
drifter movement.

```
src/
  engine/     pure game logic — rng, board gen, reveal/flood/chord, economy, config, tests
  state/      reducer, actions, React context, localStorage persistence
  audio/      hand-rolled WebAudio SFX + ambient drone (no samples)
  components/ Board (pointer-delegated), Cell (memoised), HUD, ItemBar, Toast
  screens/    Title, Run, Shop, GameOver
  styles/     design tokens + application styles
```

## Develop

```bash
npm install
npm run dev       # dev server
npm test          # engine unit tests
npm run build     # typecheck + production build to dist/
npm run preview   # serve the production build
```
