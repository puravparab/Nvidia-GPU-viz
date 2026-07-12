// Guided tours: an ordered walk from the whole rack down to the silicon.
// Each stop names a level, the component whose info panel to open, a camera
// position/target, and a line of narration. TOUR covers GB200; TOUR_VR covers
// the Vera Rubin NVL72 system.

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

export const TOUR_VR = [
  {
    level: 'vrRack', info: 'vrRack',
    pos: [1.85, 1.9, 4.05], target: [0, 1.2, 0],
    text: 'This is the Vera Rubin NVL72 — the second-generation Oberon rack. 72 Rubin GPUs, 36 Vera CPUs and 36 NVLink 6 switch chips act as one accelerator, drawing 180–220 kW with every tray 100% liquid-cooled.',
  },
  {
    level: 'vrRack', info: 'vrComputeTray',
    pos: [0.75, 1.55, 1.5], target: [0, 1.42, 0.4],
    text: 'Eighteen fanless 1U compute trays. Note the fronts: no vents, because there is no air cooling left — just the Orchid networking bays, the BlueField-4 bay and their 800G cages.',
  },
  {
    level: 'vrRack', info: 'vrSwitchTray',
    pos: [0.65, 1.1, 1.35], target: [0, 0.97, 0.4],
    text: 'Nine NVLink 6 switch trays with four ASICs each — double GB200’s switch silicon — stitch the 72 GPUs into a 260 TB/s fabric using bidirectional 400G signaling over the same copper backplane.',
  },
  {
    level: 'vrRack', info: 'vrPowerShelf',
    pos: [0.8, 2.05, 1.4], target: [0, 1.87, 0.3],
    text: 'Four 3U power shelves — 110 kW each, six 18.3 kW modules apiece, N+1 — feed a liquid-cooled 50 V busbar rated beyond 5,000 A.',
  },
  {
    level: 'vrRack', info: 'vrSpine',
    pos: [-2.4, 1.7, -3.0], target: [0, 1.0, -0.3],
    text: 'Around the back: the same ~5,000-cable NVLink backplane as Grace Blackwell now carries twice the bandwidth, because each copper pair signals in both directions at once.',
  },
  {
    level: 'vrTray', info: 'vrComputeTray',
    pos: [0.55, 0.62, 0.85], target: [0, 0, 0],
    text: 'Inside a compute tray: not a single internal cable. Two Strata modules at the rear, a PCB midplane across the middle, and the front modules blind-mate into it — assembly dropped from 2 hours to about 5 minutes.',
  },
  {
    level: 'vrTray', info: 'vrMidplane',
    pos: [0.25, 0.42, 0.35], target: [0, 0.02, 0.04],
    text: 'The green midplane is the piece that made it possible: PCIe Gen6 crosses it through Paladin HD2 connectors, over quartz-glass PCB good enough to replace the flyover looms.',
  },
  {
    level: 'vrTray', info: 'vrOrchid',
    pos: [0.3, 0.35, 0.8], target: [0.12, 0.02, 0.3],
    text: 'Four Orchid modules — stacked pairs left and right — each carry two 800G ConnectX-9 NICs, two OSFP cages and an E1.S drive: 1.6 Tb/s of scale-out per GPU, double GB300.',
  },
  {
    level: 'vrBoard', info: 'vrStrata',
    pos: [0.34, 0.5, 0.62], target: [0, 0, -0.03],
    text: 'The Strata module, successor to Bianca: two Rubin GPUs, one Vera CPU and eight socketed SOCAMM memory modules, fed 50 V directly at ~4,800 W per board.',
  },
  {
    level: 'vrBoard', info: 'vrSocamm',
    pos: [0.05, 0.35, 0.42], target: [0, 0, 0.06],
    text: 'The SOCAMM sticks are serviceable LPDDR5X — up to 1.5 TB per Vera at ~1.2 TB/s. NVIDIA buys the DRAM itself, hedging memory prices for the whole fleet.',
  },
  {
    level: 'vrVera', info: 'vrVeraDie',
    pos: [0.75, 0.95, 1.2], target: [0, 0.02, 0],
    text: 'Vera up close: 91 printed Olympus cores — NVIDIA’s custom Arm design returns — with 88 enabled and SMT for 176 threads, flanked by disaggregated memory and I/O chiplets.',
  },
  {
    level: 'vrChip', info: 'vrRubinDie',
    pos: [0.4, 0.85, 0.95], target: [0, 0.06, 0],
    text: 'Rubin: two 3nm reticle-limit dies, 336 billion transistors, 35 dense FP4 PFLOPS — 3.5× GB200 — or an effective 50 with the new adaptive sparsity engine.',
  },
  {
    level: 'vrChip', info: 'vrNvlink6Chiplet',
    pos: [0.35, 0.6, 1.05], target: [0, 0.07, 0.25],
    text: 'The I/O moved off-die: an NVLink 6 chiplet at this end carries 36 400G SerDes to the fabric, and a C2C chiplet at the other end runs 1.8 TB/s to Vera.',
  },
  {
    level: 'vrChip', info: 'vrHbm4',
    pos: [1.15, 0.8, 0.95], target: [0.35, 0.08, 0],
    text: 'Eight HBM4 stacks: 288 GB at a targeted 22 TB/s — 2.75× Blackwell — on a doubled 2048-bit bus per stack pushed to 10.8 GT/s.',
  },
  {
    level: 'vrHbm', info: 'vrHbmDram',
    pos: [1.45, 1.25, 1.9], target: [0, 0.75, 0],
    text: 'Inside one stack: an illustrative twelve-high DRAM tower on a base die whose interface doubled to 2048 bits — the lever behind the bandwidth jump.',
  },
  {
    level: 'vrSwitchtray', info: 'vrNvswitchPkg',
    pos: [0.5, 0.6, 0.8], target: [0, 0, -0.05],
    text: 'One more branch: the NVLink 6 switch tray. Four monolithic 28.8 Tb/s ASICs, every fabric lane routed over a 32-layer board — the single cyan cable to the management module is the last flyover in the whole rack.',
  },
  {
    level: 'vrRack', info: 'vrRack',
    pos: [2.25, 1.95, 3.85], target: [0, 1.2, 0],
    text: 'That’s the Vera Rubin NVL72 — extreme co-design from the 220 kW rack to 3nm silicon. Explore freely: every component is clickable, and the title menu switches you back to GB200.',
  },
];
