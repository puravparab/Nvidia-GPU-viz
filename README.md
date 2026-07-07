# NVIDIA GB200 NVL72 — Interactive 3D Explorer

A web-based 3D visualization of NVIDIA's GB200 NVL72 rack-scale AI system, built with
[Three.js](https://threejs.org/). Explore the machine at four levels of detail, from the
full 120 kW liquid-cooled rack down to the silicon of a single Blackwell GPU package.

## Levels

| Level | What you see |
|---|---|
| **Rack** | The full NVL72: 18 compute trays, 9 NVLink switch trays, 8 power shelves, 48 V busbar, NVLink copper cable spine, and liquid-cooling manifolds |
| **Compute Tray** | A 1U MGX tray with the lid off: two GB200 "Bianca" boards, cold plates, coolant loops, ConnectX-7 NICs, BlueField-3 DPUs, E1.S storage and blind-mate rear connectors |
| **Switch Tray** | Inside an NVLink switch tray: two NVLink 5 switch ASICs (one exposed, one under its cold plate), the rear blind-mate backplane field and coolant loop |
| **GB200 Superchip** | The bare Bianca board: one Grace CPU ringed by LPDDR5X packages, two Blackwell B200 GPUs, glowing NVLink-C2C lanes, VRM banks and NVLink edge connectors |
| **Blackwell GPU** | The B200 package: two reticle-limit compute dies, the 10 TB/s NV-HBI bridge, eight HBM3e stacks, the CoWoS interposer and decoupling capacitor fields |
| **Grace CPU** | The Grace package: a monolithic 72-core Neoverse V2 die with its fabric band, NVLink-C2C PHY edge and LPDDR5X controller strips |
| **NVSwitch ASIC** | The NVLink 5 switch package: one monolithic 50B-transistor die with SerDes PHY banks lining the port edges |
| **HBM3e Stack** | An exploded HBM tower: eight DRAM dies over the base logic die, through-silicon via columns and micro-bump arrays |

Levels form a tree: the main spine is Rack → Compute Tray → GB200 Superchip → Blackwell GPU → HBM3e,
with side branches Rack → Switch Tray → NVSwitch and GB200 Superchip → Grace CPU.

## Interaction

- **Drag** to orbit, **scroll** to zoom, **right-drag** to pan
- **Hover** any component for its name
- **Click** a component to open its description and spec sheet
- **Double-click** (or use the panel button) to zoom into a component that has more detail inside
- Use the **breadcrumb** (top right) or **← / → arrow keys** to move between levels
- During the guided tour, **← / →** step between stops and **Esc** exits

## Running

Everything is static — no build step. Three.js is vendored in `vendor/`. Serve the folder
with any static file server:

```sh
python3 -m http.server 8000
# or
npx serve .
```

then open http://localhost:8000. (A server is required because the app uses ES modules;
opening `index.html` directly from disk will not work.)

## Deploying (Cloudflare Pages)

The site is fully static with no build step, so deployment is trivial.

**Option A — Git integration (auto-deploys on every push):**
1. Cloudflare dashboard → Workers & Pages → Create → Pages → *Connect to Git* → pick this repo
2. Framework preset: **None** · Build command: *(empty)* · Build output directory: `/`
3. Set the production branch (Settings → Builds & deployments) to whichever branch you ship from

**Option B — one-off upload from your machine:**
```sh
npx wrangler login          # or set CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID
npx wrangler pages deploy   # project name & output dir come from wrangler.jsonc
```

`wrangler.jsonc` and `_headers` (long-lived caching for the vendored Three.js) are already set up.

## Accuracy

Geometry and specs are modeled after public NVIDIA documentation and teardowns of the
GB200 NVL72 / DGX GB200: 72 Blackwell GPUs + 36 Grace CPUs in one NVLink domain,
1.44 exaFLOPS FP4, 13.4 TB HBM3e, 130 TB/s aggregate NVLink bandwidth, ~5,000-cable
copper spine, and eight 33 kW power shelves feeding a 48 V DC busbar. It is an
illustrative model, not CAD data.

## Credits

Built by [@notpurav](https://twitter.com/notpurav) with Claude Fable.

## Structure

```
index.html          entry point + import map
css/style.css       UI styling
js/main.js          renderer, controls, picking, navigation
js/data.js          component descriptions & spec sheets
js/common.js        shared materials, geometry helpers, procedural textures
js/scenes/rack.js   rack level
js/scenes/tray.js   compute tray level
js/scenes/board.js  superchip board level
js/scenes/chip.js   GPU package level
vendor/             Three.js r169 (module build + OrbitControls + RoomEnvironment)
```
