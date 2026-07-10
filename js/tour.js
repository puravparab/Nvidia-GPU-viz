// Guided tour: an ordered walk from the whole rack down to the silicon.
// Each stop names a level, the component whose info panel to open, a camera
// position/target, and a line of narration.

export const TOUR = [
  {
    level: 'rack', info: 'rack',
    pos: [1.85, 1.9, 4.05], target: [0, 1.2, 0],
    text: 'This is one GB200 NVL72 — a full rack that behaves like a single 72-GPU accelerator. The high-power silicon is liquid-cooled while lower-power components remain air-cooled; rack draw is about 120 kW.',
  },
  {
    level: 'rack', info: 'computeTray',
    pos: [0.75, 1.55, 1.5], target: [0, 1.42, 0.4],
    text: 'The workhorses: 18 slim 1U compute trays. Each holds two GB200 superchips—four Blackwell GPUs and two Grace CPUs—and slides out through blind-mate power, coolant, and NVLink connections.',
  },
  {
    level: 'rack', info: 'switchTray',
    pos: [0.65, 1.1, 1.35], target: [0, 0.97, 0.4],
    text: 'The nine NVLink switch trays stitch all 72 GPUs into one fabric. Each Blackwell GPU has up to 1.8 TB/s of bidirectional NVLink connectivity, giving the rack one 72-GPU scale-up domain.',
  },
  {
    level: 'switchtray', info: 'nvswitchPackage',
    pos: [0.5, 0.6, 0.8], target: [0, 0, -0.05],
    text: 'Pop one open: the 1U tray contains two NVLink 5 switch ASICs with 72 ports each. NVIDIA rates the tray at 57.6 Tb/s full duplex, and SHARP engines accelerate collective operations inside the network.',
  },
  {
    level: 'rack', info: 'powerShelf',
    pos: [0.8, 2.0, 1.4], target: [0, 1.8, 0.3],
    text: 'Eight power shelves convert facility AC into nominal 50–51 V DC, 33 kW each. Six hot-swappable modules per shelf provide N+N rack-level redundancy.',
  },
  {
    level: 'rack', info: 'spine',
    pos: [-2.4, 1.7, -3.0], target: [0, 1.0, -0.3],
    text: 'Around the back: the copper busbar that powers the rack, the liquid-cooling manifolds, and four NVLink cartridges containing more than 5,000 coaxial copper cables.',
  },
  {
    level: 'tray', info: 'computeTray',
    pos: [0.55, 0.62, 0.85], target: [0, 0, 0],
    text: 'Inside a compute tray with the lid off. Two GB200 boards sit side by side; black production cold-plate assemblies hide the Grace and Blackwell packages underneath.',
  },
  {
    level: 'tray', info: 'coolantLoop',
    pos: [0.3, 0.38, -0.42], target: [0, 0.02, -0.12],
    text: 'Coolant flows through those plates and connects to the rack manifolds at the rear. A central fan wall still cools storage, management, and other lower-power components.',
  },
  {
    level: 'tray', info: 'connectx',
    pos: [0.18, 0.32, 0.78], target: [0.05, 0.02, 0.35],
    text: 'The front panel carries ConnectX-7 NICs, BlueField-3 DPUs and local NVMe drives — the tray’s window to the rest of the datacenter.',
  },
  {
    level: 'board', info: 'graceCpu',
    pos: [-0.09, 0.33, 0.4], target: [-0.09, 0, 0],
    text: 'The bare GB200 superchip board. Under the silver lid on the centreline sits the Grace CPU: 72 Arm cores flanked by banks of LPDDR5X memory.',
  },
  {
    level: 'grace', info: 'graceDie',
    pos: [0.75, 0.95, 1.2], target: [0, 0.02, 0],
    text: 'The Grace die up close: 72 Neoverse V2 cores connected by NVIDIA’s Scalable Coherency Fabric, with 114 MB of L3 cache. The raised tile layout is an architectural illustration, not a published floorplan.',
  },
  {
    level: 'board', info: 'c2cLink',
    pos: [0.05, 0.32, 0.3], target: [0.05, 0, 0],
    text: 'The glowing lanes represent NVLink-C2C: up to 900 GB/s of aggregate coherent connectivity across the Grace CPU and the two Blackwell GPUs.',
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
    text: 'The green seam represents NV-HBI, the 10 TB/s die-to-die link that lets software see the two Blackwell dies as one unified GPU.',
  },
  {
    level: 'chip', info: 'hbmStack',
    pos: [1.15, 0.8, 0.95], target: [0.35, 0.08, 0],
    text: 'Eight HBM3e packages feed the GPU with up to 8 TB/s of memory bandwidth and expose 186 GB of usable capacity. Seventy-two B200 packages fill the rack you started at.',
  },
  {
    level: 'hbm', info: 'hbmTsv',
    pos: [1.3, 1.1, 1.7], target: [0, 0.65, 0],
    text: 'Peel one open: the illustrated eight-high DRAM stack sits on a logic base and is stitched together by through-silicon vias—the vertical wiring that makes HBM bandwidth possible.',
  },
  {
    level: 'rack', info: 'rack',
    pos: [2.25, 1.95, 3.85], target: [0, 1.2, 0],
    text: 'That’s the GB200 NVL72 — from a 120 kW rack down to nanometre silicon. One more step back…',
  },
  {
    level: 'datacenter', info: 'datacenter',
    pos: [6.5, 5.2, 8.5], target: [0, 0.8, 0],
    text: 'And one last step back: in production, this rack is a single tile. Rows of NVL72s, coolant distribution units and a scale-out fabric fuse tens of thousands of GPUs into one AI factory. Explore freely: every component is clickable.',
  },
];
