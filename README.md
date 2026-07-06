# NVIDIA GB200 NVL72 — Interactive 3D Explorer

A web-based 3D visualization of NVIDIA's GB200 NVL72 rack-scale AI system, built with
[Three.js](https://threejs.org/). Explore the machine at four levels of detail, from the
full 120 kW liquid-cooled rack down to the silicon of a single Blackwell GPU package.

## Levels

| Level | What you see |
|---|---|
| **Rack** | The full NVL72: 18 compute trays, 9 NVLink switch trays, 8 power shelves, 48 V busbar, NVLink copper cable spine, and liquid-cooling manifolds |
| **Compute Tray** | A 1U MGX tray with the lid off: two GB200 "Bianca" boards, cold plates, coolant loops, ConnectX-7 NICs, BlueField-3 DPUs, E1.S storage and blind-mate rear connectors |
| **GB200 Superchip** | The bare Bianca board: one Grace CPU with its 16 LPDDR5X packages, two Blackwell B200 GPUs, glowing NVLink-C2C lanes, VRM banks and NVLink edge connectors |
| **Blackwell GPU** | The B200 package: two reticle-limit compute dies, the 10 TB/s NV-HBI bridge, eight HBM3e stacks, the CoWoS interposer and decoupling capacitor fields |

## Interaction

- **Drag** to orbit, **scroll** to zoom, **right-drag** to pan
- **Hover** any component for its name
- **Click** a component to open its description and spec sheet
- **Double-click** (or use the panel button) to zoom into a component that has more detail inside
- Use the **breadcrumb** (top right) to jump between levels

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
