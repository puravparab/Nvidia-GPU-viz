# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A browser-based 3D visualization of NVIDIA's rack-scale AI systems — GB200 NVL72 and Vera Rubin NVL72, switchable via the header-title dropdown — built directly on Three.js (r169, vendored). No framework, no build step, no package manager — everything is static ES modules loaded via an import map in `index.html`.

## Running

Must be served over HTTP (ES modules won't load from `file://`):

```sh
python3 -m http.server 8000   # or: npx serve .
```

Then open http://localhost:8000. There is no build, lint, or test tooling — editing a source file and reloading the browser is the full dev loop. (`package-lock.json` is empty; there are no npm dependencies.)

## Architecture

The app renders one "level" at a time. Levels form two disjoint trees, one per system, defined by the `PARENT`/`PRIMARY_CHILD` maps in `main.js`:

- **GB200**: datacenter → rack → tray → board → chip → hbm, with branches rack → switchtray → nvswitch and board → grace.
- **Vera Rubin** (levels prefixed `vr`, scenes under `js/scenes/vr/`, INFO entries in `js/data-vr.js`): vrRack → vrTray → vrBoard → vrChip → vrHbm, with branches vrRack → vrSwitchtray → vrNvswitch and vrBoard → vrVera.

A level's system is determined by its name prefix (`systemOf` in `main.js`); the header title dropdown jumps between the two roots. Each level is an independent Three.js scene graph.

- **`js/main.js`** owns the singleton renderer, camera, `OrbitControls`, lights, and the environment map. It is the only place that touches WebGL. It handles level switching, raycaster-based picking (hover highlight + click-to-inspect + double-click-to-drill), and the info panel. Built scenes are cached in `cache[level]` after first build.

- **`js/scenes/{rack,tray,board,chip}.js`** — one `build<Level>()` function each. A builder returns `{ group, camera, defaultInfo }`:
  - `group`: a `THREE.Group` containing the whole scene.
  - `camera`: `{ pos, target, min, max }` — initial camera placement and orbit distance clamps for this level.
  - `defaultInfo`: the `INFO` key shown in the panel when the level opens.
  Builders are registered in the `BUILDERS` map in `main.js`.

- **`js/common.js`** — the shared toolkit every scene depends on. Cached material factory (`mat`), geometry helpers (`box`, `cyl`, `slab`, `led`, `tube`), procedural canvas textures (`dieTexture`, `ventTexture`), the `M` named-material palette, the NVIDIA `GREEN` constant, and `mark(obj, infoKey)`.

- **`js/data.js`** — pure data. `LEVELS` (titles/subtitles) and `INFO` (the component database: every clickable part's tag, name, blurb, spec table, and optional drill target).

### Two conventions that tie it all together

1. **Interactivity via `userData.infoKey`.** `mark(obj, 'someKey')` stamps `userData.infoKey` onto an object. The raycaster in `main.js` (`findInteractive`) walks up the parent chain until it finds an `infoKey`, then looks it up in `INFO`. So marking a parent `Group` makes the whole subtree one clickable component. **Every `infoKey` used in a scene must have a matching entry in `INFO` (`js/data.js`)** — an unmatched key silently does nothing on hover/click.

2. **Drilling between levels.** An `INFO` entry with a `drill` field (e.g. `drill: 'tray'`) becomes zoom-in-able: double-clicking it, or the panel's drill button, calls `setLevel(drill)`. `drillLabel` is the button text.

3. **`noHighlight` opt-out.** A scene sets `root.userData.noHighlight = new Set([mesh.id, ...])` to exclude background geometry (floors, reflection pools, labels) from shadow-casting, hover highlighting, and picking. Referenced by mesh `.id`.

## Modeling notes

Geometry is illustrative, not CAD — hand-built from primitives in the scene files and modeled after public NVIDIA docs/teardowns. When adding or editing components, reuse the `M` palette and `common.js` helpers rather than constructing raw `MeshStandardMaterial`/`BoxGeometry` inline, so materials stay cached (shared GPU state) and the visual language stays consistent.
