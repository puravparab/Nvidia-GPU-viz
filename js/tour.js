// Guided tour: an ordered walk from the whole rack down to the silicon.
// Each stop names a level, the component whose info panel to open, a camera
// position/target, and a line of narration.

export const TOUR = [
  {
    level: 'rack', info: 'rack',
    pos: [1.55, 1.6, 3.35], target: [0, 1.05, 0],
    text: 'This is one GB200 NVL72 — a full rack that behaves like a single 72-GPU accelerator. Everything in it is liquid-cooled, and the whole thing draws about 120 kW.',
  },
  {
    level: 'rack', info: 'computeTray',
    pos: [0.75, 1.55, 1.5], target: [0, 1.42, 0.4],
    text: 'The workhorses: 18 slim 1U compute trays. Each holds two GB200 superchips — four Blackwell GPUs and two Grace CPUs — and slides out like a drawer, with no cables to unplug.',
  },
  {
    level: 'rack', info: 'switchTray',
    pos: [0.65, 1.1, 1.35], target: [0, 0.97, 0.4],
    text: 'The nine NVLink switch trays in the middle stitch all 72 GPUs into one fabric. Any GPU can talk to any other at 1.8 TB/s — that is what makes the rack one big GPU.',
  },
  {
    level: 'switchtray', info: 'nvswitchPackage',
    pos: [0.5, 0.6, 0.8], target: [0, 0, -0.05],
    text: 'Pop one open: two NVLink 5 switch ASICs, 50 billion transistors each, spent entirely on moving data — 7.2 TB/s per chip, with SHARP engines doing math inside the network.',
  },
  {
    level: 'rack', info: 'powerShelf',
    pos: [0.8, 2.0, 1.4], target: [0, 1.8, 0.3],
    text: 'Eight power shelves convert facility AC into 48 V DC, 33 kW each, using hot-swappable supply modules with N+1 redundancy.',
  },
  {
    level: 'rack', info: 'spine',
    pos: [-2.4, 1.7, -3.0], target: [0, 1.0, -0.3],
    text: 'Around the back: the copper busbar that powers every tray, the coolant manifolds, and the NVLink spine — more than 5,000 copper cables, roughly two miles of wire.',
  },
  {
    level: 'tray', info: 'computeTray',
    pos: [0.55, 0.62, 0.85], target: [0, 0, 0],
    text: 'Inside a compute tray with the lid off. Two GB200 boards sit side by side; the silver cold plates hide the silicon underneath.',
  },
  {
    level: 'tray', info: 'coolantLoop',
    pos: [0.3, 0.38, -0.42], target: [0, 0.02, -0.12],
    text: 'Coolant flows through those plates and out through dripless quick-disconnects at the rear — no fans are needed for the main silicon.',
  },
  {
    level: 'tray', info: 'connectx',
    pos: [0.18, 0.32, 0.78], target: [0.05, 0.02, 0.35],
    text: 'The front panel carries ConnectX-7 NICs, BlueField-3 DPUs and local NVMe drives — the tray’s window to the rest of the datacenter.',
  },
  {
    level: 'board', info: 'graceCpu',
    pos: [-0.07, 0.33, 0.38], target: [-0.07, 0, 0],
    text: 'The bare GB200 superchip board. Under the silver lid on the centreline sits the Grace CPU: 72 Arm cores flanked by banks of LPDDR5X memory.',
  },
  {
    level: 'grace', info: 'graceDie',
    pos: [0.75, 0.95, 1.2], target: [0, 0.02, 0],
    text: 'The Grace die up close: 72 identical Neoverse V2 core tiles on a mesh, 117 MB of L3, and PHY strips on the edges where 900 GB/s leaves for the GPUs.',
  },
  {
    level: 'board', info: 'c2cLink',
    pos: [0.05, 0.32, 0.3], target: [0.05, 0, 0],
    text: 'The glowing lanes are NVLink-C2C: 900 GB/s of cache-coherent bandwidth that fuses CPU and GPU memory into a single pool.',
  },
  {
    level: 'board', info: 'b200Package',
    pos: [0.38, 0.24, 0.28], target: [0.16, 0, 0.02],
    text: 'And the stars of the show: two Blackwell B200 packages side by side at the rear edge, next to the blind-mate connectors. Let’s zoom into one.',
  },
  {
    level: 'chip', info: 'gpuDie',
    pos: [0.4, 0.85, 0.95], target: [0, 0.06, 0],
    text: 'Two compute dies, each built at the reticle limit — the largest area a lithography machine can print. Together: 208 billion transistors.',
  },
  {
    level: 'chip', info: 'nvhbi',
    pos: [0.05, 0.75, 0.75], target: [0, 0.07, 0],
    text: 'The green seam is NV-HBI, a 10 TB/s die-to-die bridge. It is fast enough that software sees one giant GPU, not two chiplets.',
  },
  {
    level: 'chip', info: 'hbmStack',
    pos: [1.15, 0.8, 0.95], target: [0.35, 0.08, 0],
    text: 'Eight HBM3e towers — each a stack of eight DRAM dies — feed the GPU 8 TB/s of memory bandwidth. 72 of these packages fill the rack you started at.',
  },
  {
    level: 'hbm', info: 'hbmTsv',
    pos: [1.3, 1.1, 1.7], target: [0, 0.65, 0],
    text: 'Peel one open: eight DRAM dies on a logic base, stitched together by thousands of through-silicon vias — the vertical wiring that makes 8 TB/s possible.',
  },
  {
    level: 'rack', info: 'rack',
    pos: [2.1, 1.75, 2.9], target: [0, 1.05, 0],
    text: 'That’s the GB200 NVL72 — from a 120 kW rack down to nanometre silicon. One more step back…',
  },
  {
    level: 'datacenter', info: 'datacenter',
    pos: [6.5, 5.2, 8.5], target: [0, 0.8, 0],
    text: 'And one last step back: in production, this rack is a single tile. Rows of NVL72s, coolant distribution units and a scale-out fabric fuse tens of thousands of GPUs into one AI factory. Explore freely: every component is clickable.',
  },
];
