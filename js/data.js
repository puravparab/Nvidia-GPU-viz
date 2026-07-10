// Component database for the GB200 NVL72 explorer.
// Every clickable object in the 3D scenes carries an `infoKey` that points here.
// `drill` marks components that can be zoomed into (a deeper scene level).

export const LEVELS = {
  datacenter: { title: 'AI Factory',               subtitle: 'Many NVL72 racks woven into one supercomputer — click a rack, CDU or fabric switch rack' },
  rack:       { title: 'GB200 NVL72 Rack',         subtitle: 'Rack-scale exaflop AI system — click any component to inspect it' },
  tray:       { title: 'Compute Tray',             subtitle: '1U hybrid-cooled compute tray — lid removed, click components to inspect' },
  switchtray: { title: 'NVLink Switch Tray',       subtitle: '1U switch tray, lid removed — two NVLink 5 ASICs stitch all 72 GPUs together' },
  board:      { title: 'GB200 Superchip (Bianca)', subtitle: 'One Grace CPU + two Blackwell GPUs on a single superchip board' },
  chip:       { title: 'Blackwell B200 GPU',       subtitle: 'Dual-die GPU package with 8 stacks of HBM3e — click the silicon' },
  grace:      { title: 'Grace CPU Package',        subtitle: '72 Arm Neoverse V2 cores purpose-built to keep two Blackwells fed' },
  nvswitch:   { title: 'NVLink 5 Switch ASIC',     subtitle: '50 billion transistors spent entirely on moving data between GPUs' },
  hbm:        { title: 'HBM3e Stack — Exploded',   subtitle: 'Illustrative eight-high DRAM stack on a logic base, joined by through-silicon vias' },
};

export const INFO = {
  /* ============================== DATACENTER LEVEL ======================== */
  datacenter: {
    tag: 'Cluster', name: 'AI Factory',
    blurb: 'One NVL72 is a 72-GPU scale-up domain. Multiple racks connect through a separate 400 Gb/s scale-out fabric. NVIDIA’s GB200 DGX SuperPOD reference building block is a scalable unit of eight NVL72 racks—576 Blackwell GPUs—and larger AI factories replicate those units.',
    specs: [
      ['Building block', '1 NVL72 = 72 GPUs'],
      ['Scale-up (in rack)', 'NVLink, 130 TB/s'],
      ['Scale-out (between racks)', '400 Gb/s ConnectX-7 fabric'],
      ['Reference scalable unit', '8 racks / 576 GPUs'],
      ['Rack IT power', '~120 kW each'],
      ['Cooling', 'Facility water via CDUs'],
    ],
    sources: [
      ['NVIDIA DGX SuperPOD architecture', 'https://docs.nvidia.com/dgx-superpod/reference-architecture-scalable-infrastructure-gb200/latest/dgx-superpod-architecture.html'],
      ['NVIDIA DGX GB200 specifications', 'https://www.nvidia.com/en-us/data-center/dgx-gb200/'],
    ],
    drill: 'rack', drillLabel: 'Enter a single rack →',
  },
  dcRack: {
    tag: 'System', name: 'GB200 NVL72 Rack',
    blurb: 'The highlighted rack is the one you explored. In a deployment it is one identical tile in a row of many — each an independent 72-GPU NVLink domain, all stitched together by the scale-out fabric into one training job. Click through to step back inside it.',
    specs: [
      ['This rack', '72 GPUs, ~120 kW'],
      ['Role', 'One scale-up domain'],
      ['Identical siblings', 'Rows of NVL72 racks'],
    ],
    drill: 'rack', drillLabel: 'Enter this rack →',
  },
  cdu: {
    tag: 'Cooling', name: 'Coolant Distribution Unit',
    blurb: 'A CDU bridges the facility-water loop and the rack technology-cooling loop. A heat exchanger isolates the fluids while pumps regulate secondary-loop flow, pressure, and temperature. This scene uses an illustrative in-row arrangement; actual CDU placement and capacity are site-specific.',
    specs: [
      ['Role', 'Facility ↔ rack coolant bridge'],
      ['Isolation', 'Liquid-to-liquid heat exchanger'],
      ['Capacity', 'Sized to the deployment'],
      ['Provides', 'Filtered, flow/temp-controlled loop'],
    ],
  },
  spineSwitch: {
    tag: 'Networking', name: 'Scale-out Fabric Switch Rack',
    blurb: 'These network racks represent the leaf-and-spine fabric linking NVL72 racks. It is separate from the NVLink fabric inside each rack. A DGX GB200 exposes one 400 Gb/s ConnectX-7 port per GPU for InfiniBand or Ethernet scale-out traffic.',
    specs: [
      ['Endpoint speed', '400 Gb/s per ConnectX-7'],
      ['Rack endpoints', '72× OSFP ConnectX-7'],
      ['Topology', 'Leaf / spine scale-out fabric'],
      ['Separate from', 'In-rack NVLink domain'],
    ],
    sources: [['NVIDIA DGX GB200 specifications', 'https://www.nvidia.com/en-us/data-center/dgx-gb200/']],
  },
  dcFloor: {
    tag: 'Facility', name: 'Data Hall',
    blurb: 'The room itself: a raised-floor or slab data hall laid out in hot and cold aisles. Power comes in as medium-voltage AC and is distributed along overhead busways; liquid cooling and high-speed cabling run in trays above the rows. A single hall like this can draw tens of megawatts.',
    specs: [
      ['Layout', 'Hot / cold aisle rows'],
      ['Power delivery', 'Overhead busway'],
      ['Draw', 'Tens of MW per hall'],
    ],
  },

  /* ============================== RACK LEVEL ============================== */
  rack: {
    tag: 'System', name: 'NVIDIA GB200 NVL72',
    blurb: 'A hybrid-cooled rack that behaves like one giant GPU. Direct liquid cooling handles the high-power silicon while fans cool storage and management hardware. Its 36 Grace CPUs and 72 Blackwell GPUs share one NVLink domain; the rack weighs about 1.36 tonnes and contains more than 5,000 copper cables.',
    specs: [
      ['GPUs / CPUs', '72 Blackwell + 36 Grace'],
      ['NVFP4 sparse | dense', '1,440 | 720 PFLOPS'],
      ['FP8/FP6 sparse | dense', '720 | 360 PFLOPS'],
      ['GPU memory', '13.4 TB HBM3e'],
      ['Fast memory', 'Up to 30.2 TB (HBM + LPDDR5X)'],
      ['NVLink bandwidth', '130 TB/s aggregate'],
      ['Power', '~120 kW, hybrid-cooled'],
      ['Form factor', '48U rack-scale system'],
    ],
    sources: [
      ['NVIDIA GB200 NVL72 specifications', 'https://www.nvidia.com/en-us/data-center/gb200-nvl72/'],
      ['NVIDIA DGX GB hardware guide', 'https://docs.nvidia.com/dgx/dgxgb200-user-guide/hardware.html'],
    ],
    drill: 'datacenter', drillLabel: 'Zoom out to the AI factory →',
  },
  computeTray: {
    tag: 'Compute', name: 'Compute Tray (1U)',
    blurb: 'Each of the 18 compute trays hosts two GB200 superchips—2 Grace CPUs and 4 Blackwell GPUs—in a hybrid-cooled 1U chassis. Trays blind-mate to the nominal 50–51 V busbar, NVLink cable backplane, and coolant manifolds at the rear, so service does not require disconnecting individual rack cables.',
    specs: [
      ['Per rack', '18 trays'],
      ['Superchips', '2× GB200 (2 CPU + 4 GPU)'],
      ['NVFP4 sparse | dense', '80 | 40 PFLOPS per tray'],
      ['HBM3e', '744 GB usable per tray'],
      ['LPDDR5X', '960 GB per tray'],
      ['Power', 'Up to ~6.3 kW (max TDP)'],
      ['Cooling', 'Direct-to-chip liquid cold plates'],
    ],
    sources: [['NVIDIA DGX GB hardware guide', 'https://docs.nvidia.com/dgx/dgxgb200-user-guide/hardware.html']],
    drill: 'tray', drillLabel: 'Open compute tray →',
  },
  switchTray: {
    tag: 'Interconnect', name: 'NVLink Switch Tray (1U)',
    blurb: 'The nine switch trays in the middle of the rack are the heart of the NVL72 fabric. Each carries two NVLink 5 switch ASICs and provides 144 NVLink ports, letting all 72 GPUs talk to each other at full speed as if they were one chip. SHARP v4 engines perform in-network reductions for collective operations.',
    specs: [
      ['Per rack', '9 trays'],
      ['ASICs', '2× NVLink 5 switch chips'],
      ['Ports', '144 NVLink ports @ 100 GB/s'],
      ['Port-rate sum', '14.4 TB/s per tray'],
      ['Switch ASIC', '50B transistors, TSMC 4NP'],
      ['In-network compute', '3.6 TFLOPS SHARP v4 (FP8)'],
      ['Cooling', 'Liquid-cooled cold plates'],
    ],
    sources: [['NVIDIA DGX GB hardware guide', 'https://docs.nvidia.com/dgx/dgxgb200-user-guide/hardware.html']],
    drill: 'switchtray', drillLabel: 'Open switch tray →',
  },
  powerShelf: {
    tag: 'Power', name: 'Power Shelf (33 kW)',
    blurb: 'Eight 1U power shelves convert facility AC into nominal 50–51 V DC for the rack busbar. Each shelf holds six air-cooled, hot-swappable 5.5 kW power supply modules. The eight-shelf arrangement supplies the rack with N+N redundancy.',
    specs: [
      ['Per rack', '8 shelves'],
      ['Output', '33 kW per shelf'],
      ['Modules', '6× 5.5 kW PSUs, hot-swap'],
      ['Input', 'Facility AC power whips'],
      ['Output rail', 'Nominal 50–51 V DC'],
      ['Redundancy', 'N+N across eight shelves'],
    ],
    sources: [['NVIDIA DGX GB hardware guide', 'https://docs.nvidia.com/dgx/dgxgb200-user-guide/hardware.html']],
  },
  mgmtSwitch: {
    tag: 'Networking', name: 'Rack Management Switch',
    blurb: 'A top-of-rack Ethernet switch for out-of-band management. It connects the BMCs of every tray, the power shelves and the leak-detection sensors so operators can monitor and service the rack independently of the compute fabric.',
    specs: [
      ['Role', 'Out-of-band management'],
      ['Connects', 'Tray BMCs, power shelves, sensors'],
      ['Height', '1U'],
      ['Per rack', '2 TOR switches'],
    ],
  },
  busbar: {
    tag: 'Power', name: '50 V DC Busbar',
    blurb: 'A high-current copper busbar assembly runs vertically at the rack rear. Compute, switch, and power trays blind-mate to it, replacing hundreds of individual DC cables. NVIDIA’s DGX guide specifies a nominal 50–51 V distribution rail.',
    specs: [
      ['Voltage', 'Nominal 50–51 V DC'],
      ['Design class', 'High-current rack busbar'],
      ['Material', 'Solid copper'],
      ['Connection', 'Blind-mate, tool-less trays'],
    ],
  },
  spine: {
    tag: 'Interconnect', name: 'Four NVLink Cable Cartridges',
    blurb: 'The copper backbone of the NVL72 is split across four rear cartridges housing more than 5,000 coaxial copper cables—about 3.2 km of wire. They connect every GPU to one port on each of the 18 NVSwitch ASICs through blind-mate tray connectors.',
    specs: [
      ['Cartridges', '4 rear cable modules'],
      ['Cables', '5,000+ passive copper pairs'],
      ['Total length', '~2 miles / 3.2 km'],
      ['Aggregate bandwidth', '130 TB/s'],
    ],
    sources: [['NVIDIA OCP design contribution', 'https://developer.nvidia.com/blog/nvidia-contributes-nvidia-gb200-nvl72-designs-to-open-compute-project/']],
  },
  manifold: {
    tag: 'Cooling', name: 'Liquid Cooling Manifold',
    blurb: 'Vertical supply and return manifolds distribute technology-cooling-system fluid to every compute and switch tray through blind-mate quick-disconnects. A facility CDU isolates and controls this secondary loop; exact temperatures and flow rates depend on the site design.',
    specs: [
      ['Type', 'Direct-to-chip, warm water'],
      ['Loop', 'Facility CDU ↔ rack manifold'],
      ['Connection', 'Blind-mate quick disconnects'],
      ['Monitored by', 'Rack and tray leak detection'],
    ],
  },
  rackFrame: {
    tag: 'Structure', name: 'OCP ORv3-Derived Rack Enclosure',
    blurb: 'The 48U DGX design builds on OCP Open Rack v3 with adaptations for dense 19-inch EIA equipment. Reinforced rails, blind-mate slides, seismic bracing, and a rear extension protect the cable cartridges and manifold fittings. NVIDIA contributed the liquid-cooled rack design to the Open Compute Project.',
    specs: [
      ['Format', '48U, OCP ORv3-derived'],
      ['Equipment mounting', 'Adapted 19-inch EIA'],
      ['Weight loaded', '~1,360 kg (3,000 lb)'],
      ['Components', '~600,000 parts per rack'],
    ],
    sources: [['NVIDIA OCP design contribution', 'https://developer.nvidia.com/blog/nvidia-contributes-nvidia-gb200-nvl72-designs-to-open-compute-project/']],
  },
  leakTray: {
    tag: 'Safety', name: 'Leakage Drip Pan',
    blurb: 'A monitored pan at the bottom of the rack catches any coolant that reaches the base. It works with tray- and rack-level leak sensors so operators can isolate a fault before liquid reaches powered equipment.',
    specs: [
      ['Location', 'Bottom service bay'],
      ['Role', 'Containment + early leak detection'],
    ],
    sources: [['NVIDIA DGX GB hardware guide', 'https://docs.nvidia.com/dgx/dgxgb200-user-guide/hardware.html']],
  },

  /* ============================== TRAY LEVEL ============================== */
  trayChassis: {
    tag: 'Structure', name: 'MGX 1U Tray Chassis',
    blurb: 'A 1U sheet-metal chassis around 44 mm tall. Grace CPUs, Blackwell GPUs, and ConnectX-7 silicon use direct liquid cooling; central fan modules move air across storage, management, and other lower-power components. The rear edge blind-mates power, coolant, and NVLink.',
    specs: [
      ['Height', '1U (44.45 mm)'],
      ['Boards', '2× GB200 Bianca boards'],
      ['Cooling', 'Hybrid liquid + forced air'],
      ['Service', 'Tool-less slide-out'],
    ],
    sources: [['NVIDIA DGX GB hardware guide', 'https://docs.nvidia.com/dgx/dgxgb200-user-guide/hardware.html']],
  },
  biancaBoard: {
    tag: 'Compute', name: 'GB200 Superchip Board (“Bianca”)',
    blurb: 'The Bianca board is the unit of compute: one Grace CPU and two Blackwell GPUs sharing a coherent memory space over NVLink-C2C. Each compute tray carries two of these boards side by side. Click through to see the bare board.',
    specs: [
      ['CPU', '1× Grace, 72 Arm cores'],
      ['GPUs', '2× Blackwell B200'],
      ['Coherent memory', '852 GB usable per superchip'],
      ['Board power', '~2.7 kW'],
    ],
    sources: [['NVIDIA GB200 NVL72 specifications', 'https://www.nvidia.com/en-us/data-center/gb200-nvl72/']],
    drill: 'board', drillLabel: 'Inspect GB200 superchip →',
  },
  gpuColdplate: {
    tag: 'Cooling', name: 'GPU Cold Plate',
    blurb: 'A black production cold-plate assembly clamps a nickel-plated copper microchannel plate to each Blackwell package. Coolant carries away up to roughly 1,200 W per GPU; the dark upper housing provides pressure, fittings, and protection around the plate.',
    specs: [
      ['Heat absorbed', 'Up to 1,200 W per GPU'],
      ['Material', 'Nickel-plated copper'],
      ['Design', 'Micro-fin liquid channels'],
    ],
  },
  cpuColdplate: {
    tag: 'Cooling', name: 'CPU Cold Plate',
    blurb: 'Each Grace CPU has its own direct-liquid-cooling assembly connected to the tray manifold. It is smaller than the two neighboring Blackwell cold plates because the CPU dissipates substantially less heat than the GPUs.',
    specs: [
      ['Relative load', 'Lower than adjacent GPUs'],
      ['Material', 'Nickel-plated copper'],
    ],
  },
  coolantLoop: {
    tag: 'Cooling', name: 'Coolant Tubing & Quick-Disconnects',
    blurb: 'Flexible hoses link the cold plates to rear quick-disconnect couplings that blind-mate with the rack manifolds. The couplings are dripless — trays can be pulled while the rest of the rack keeps running.',
    specs: [
      ['Couplings', 'Dripless blind-mate QDs'],
      ['Loop', 'Supply + return per tray'],
    ],
  },
  airCooling: {
    tag: 'Cooling', name: 'Air-Cooling Fan Modules',
    blurb: 'A central bank of hot-swappable fans pulls air through the front I/O and storage zone. The compute silicon is liquid-cooled, but E1.S drives, management electronics, and other lower-power components still require directed airflow.',
    specs: [
      ['Role', 'Cool air-cooled tray components'],
      ['Air path', 'Front I/O → fan wall → rear'],
      ['Main silicon', 'Direct liquid-cooled'],
    ],
    sources: [['NVIDIA DGX GB hardware guide', 'https://docs.nvidia.com/dgx/dgxgb200-user-guide/hardware.html']],
  },
  trayPower: {
    tag: 'Power', name: 'Tray Power Distribution Board',
    blurb: 'The rear busbar clip feeds a central power-distribution board through paired high-current conductors. The PDB steps the rack busbar supply down to 12 V DC and fans it out to the Bianca boards through yellow RapidLock 12 V/GND connector pairs placed beside each package’s voltage regulators, plus feeds for networking, storage, fans and management.',
    specs: [
      ['Input', 'Rack busbar (nominal 48–51 V DC)'],
      ['Output', '12 V DC via RapidLock pairs'],
      ['Source', 'Rear blind-mate busbar clip'],
      ['Loads', 'Compute, networking, storage, fans'],
    ],
    sources: [
      ['NVIDIA DGX GB hardware guide', 'https://docs.nvidia.com/dgx/dgxgb200-user-guide/hardware.html'],
      ['SemiAnalysis GB200 hardware architecture', 'https://newsletter.semianalysis.com/p/gb200-hardware-architecture-and-component'],
    ],
  },
  graceGraceLink: {
    tag: 'Interconnect', name: 'Grace–Grace Coherent Link',
    blurb: 'The tan connector near the front edge carries a coherent NVLink connection to the sibling Bianca board in the same tray — up to 600 GB/s bidirectional. It lets the two Grace CPUs share memory, storage and NICs like a dual-socket server, which is why deployments can depopulate down to a single frontend NIC per tray.',
    specs: [
      ['Bandwidth', 'Up to 600 GB/s bidirectional'],
      ['Coherency', 'Shared memory across boards'],
      ['Enables', 'NIC/storage sharing per tray'],
    ],
    sources: [['SemiAnalysis GB200 hardware architecture', 'https://newsletter.semianalysis.com/p/gb200-hardware-architecture-and-component']],
  },
  connectx: {
    tag: 'Networking', name: 'ConnectX-7 NIC (400G)',
    blurb: 'Four single-port ConnectX-7 adapters per tray provide the east-west scale-out fabric: one 400 Gb/s InfiniBand or Ethernet endpoint per GPU. The NIC silicon rides a mezzanine that mates to Mirror-Mezz connectors directly atop each Bianca board — sharing the boards’ cold plate — and braided DensiLink runs carry the lanes forward to the OSFP cages on the front panel.',
    specs: [
      ['Per tray', '4× ConnectX-7'],
      ['Speed', '400 Gb/s each'],
      ['Fabric', 'InfiniBand NDR / Ethernet'],
      ['Role', 'Scale-out (rack-to-rack)'],
      ['Cooling', 'NIC silicon liquid-cooled'],
      ['Front-panel link', 'DensiLink cable runs'],
    ],
    sources: [
      ['NVIDIA DGX GB hardware guide', 'https://docs.nvidia.com/dgx/dgxgb200-user-guide/hardware.html'],
      ['SemiAnalysis GB200 hardware architecture', 'https://newsletter.semianalysis.com/p/gb200-hardware-architecture-and-component'],
    ],
  },
  bluefield: {
    tag: 'Networking', name: 'BlueField-3 DPU',
    blurb: 'Two BlueField-3 DPUs offload storage, management, security, and north-south networking from the Grace CPUs. Each presents a dual-port 400 Gb/s-class InfiniBand/Ethernet interface plus a dedicated BMC management connection.',
    specs: [
      ['Per tray', '2× BlueField-3'],
      ['Interface', 'Dual-port 400 Gb/s-class'],
      ['Cores', '16× Arm A78 per DPU'],
      ['Role', 'Storage / security / mgmt offload'],
    ],
    sources: [['NVIDIA DGX GB hardware guide', 'https://docs.nvidia.com/dgx/dgxgb200-user-guide/hardware.html']],
  },
  nvme: {
    tag: 'Storage', name: 'E1.S NVMe Storage',
    blurb: 'E1.S ruler drives in the front bay give each tray fast local scratch storage for checkpoints and data staging, hot-swappable from the cold aisle. The DGX configuration ships four 3.84 TB drives as a RAID-0 cache plus an M.2 boot device; the chassis supports up to eight bays.',
    specs: [
      ['Per tray', '4× E1.S NVMe (up to 8 bays)'],
      ['Capacity', '4× 3.84 TB cache'],
      ['Boot', '1× 1.92 TB M.2 NVMe'],
      ['Layout', 'Software RAID 0 cache'],
      ['Serviceability', 'Front hot-swap'],
    ],
    sources: [
      ['NVIDIA DGX GB hardware guide', 'https://docs.nvidia.com/dgx/dgxgb200-user-guide/hardware.html'],
      ['SemiAnalysis GB200 hardware architecture', 'https://newsletter.semianalysis.com/p/gb200-hardware-architecture-and-component'],
    ],
  },
  nvlinkConnector: {
    tag: 'Interconnect', name: 'NVLink Backplane Connectors',
    blurb: 'High-density gold-plated connectors at the tray rear blind-mate into the NVLink cable spine. Every GPU exposes 18 NVLink 5 links — 1.8 TB/s — through these connectors to the switch trays.',
    specs: [
      ['Per GPU', '18 NVLink 5 links'],
      ['Bandwidth', '1.8 TB/s per GPU'],
      ['Mating', 'Blind-mate, floating alignment'],
    ],
  },
  hmc: {
    tag: 'Management', name: 'Host Management Controller',
    blurb: 'A BMC module supervises the tray: power sequencing, telemetry, leak detection and remote firmware management, reachable over the out-of-band network even when the host is down.',
    specs: [
      ['Role', 'BMC / telemetry / leak detect'],
      ['Network', 'Dedicated 1G management'],
    ],
  },

  /* ============================== BOARD LEVEL ============================= */
  graceCpu: {
    tag: 'CPU', name: 'Grace CPU',
    blurb: 'A 72-core Arm Neoverse V2 processor purpose-built to feed GPUs. Its LPDDR5X memory is soldered right beside the die for bandwidth and efficiency no DIMM system can match, and NVLink-C2C makes that memory directly addressable by both Blackwell GPUs.',
    specs: [
      ['Cores', '72× Arm Neoverse V2'],
      ['Memory', '480 GB usable LPDDR5X nearby'],
      ['Memory bandwidth', 'Up to 512 GB/s'],
      ['NVLink-C2C', '900 GB/s aggregate to 2 GPUs'],
      ['Power', '~300 W'],
    ],
    drill: 'grace', drillLabel: 'Inspect Grace package →',
  },
  lpddr: {
    tag: 'Memory', name: 'LPDDR5X Memory',
    blurb: 'Two banks of LPDDR5X packages flank the Grace package — 480 GB of ECC memory at a fraction of the power an equivalent DDR5 DIMM setup would draw. This is the “capacity tier”: huge models spill from GPU HBM into this pool over NVLink-C2C.',
    specs: [
      ['Capacity', '480 GB per Grace'],
      ['Bandwidth', 'Up to 512 GB/s'],
      ['Type', 'LPDDR5X with ECC'],
      ['Efficiency', '~1/8 the power per byte of DDR5'],
    ],
  },
  b200Package: {
    tag: 'GPU', name: 'Blackwell B200 GPU',
    blurb: 'Two reticle-limited dies are fused by a 10 TB/s bridge so software sees one GPU, flanked by eight HBM3e stacks. Current GB200 NVL72 specifications expose 186 GB of usable HBM3e per B200; package photos show eight physical memory stacks.',
    specs: [
      ['Transistors', '208 billion'],
      ['Process', 'TSMC 4NP, dual die'],
      ['Memory', '186 GB usable HBM3e'],
      ['Memory bandwidth', '8 TB/s'],
      ['NVFP4 sparse | dense', '20 | 10 PFLOPS'],
      ['Power', 'Up to 1,200 W'],
    ],
    sources: [
      ['NVIDIA GB200 NVL72 specifications', 'https://www.nvidia.com/en-us/data-center/gb200-nvl72/'],
      ['NVIDIA Blackwell announcement', 'https://nvidianews.nvidia.com/news/nvidia-blackwell-platform-arrives-to-power-a-new-era-of-computing'],
    ],
    drill: 'chip', drillLabel: 'Inspect Blackwell GPU →',
  },
  c2cLink: {
    tag: 'Interconnect', name: 'NVLink-C2C',
    blurb: 'The glowing lanes represent two coherent Grace-to-GPU links. Each Blackwell connection carries 450 GB/s bidirectionally, for 900 GB/s aggregate across the superchip. CPU and GPUs share one address space, making Grace’s LPDDR5X directly accessible to CUDA.',
    specs: [
      ['Per GPU', '450 GB/s bidirectional'],
      ['Superchip aggregate', '900 GB/s bidirectional'],
      ['Coherency', 'Full cache coherence'],
      ['vs PCIe Gen5 x16', '~7× faster'],
    ],
    sources: [
      ['NVIDIA GB200 specifications', 'https://www.nvidia.com/en-us/data-center/gb200-nvl72/'],
      ['GB200 tray topology manual', 'https://www.supermicro.com/manuals/superserver/1U/MNL-2880.pdf'],
    ],
  },
  vrm: {
    tag: 'Power', name: 'Voltage Regulator Modules',
    blurb: 'Banks of power stages and inductors convert the rack’s nominal 50 V distribution rail down to the sub-1 V core rails the silicon needs. VRM placement hugs the packages to minimise resistive losses at the very high currents demanded by each GPU.',
    specs: [
      ['Input', 'Nominal 50–51 V DC'],
      ['Output', 'Sub-1 V core rails'],
      ['Load', 'High-current GPU core rails'],
    ],
  },
  boardPcb: {
    tag: 'Structure', name: 'Superchip PCB',
    blurb: 'A 22-layer HDI board carrying the superchip. Its copper layers route power planes and the ultra-dense NVLink and C2C signal pairs with tight impedance control; the module blind-mates to the tray through high-density connectors.',
    specs: [
      ['Layers', '22-layer HDI'],
      ['Signals', 'NVLink 5, C2C, PCIe Gen5'],
      ['Mounting', 'High-density mezzanine connectors'],
    ],
  },
  boardNvlink: {
    tag: 'Interconnect', name: 'NVLink Edge Connectors',
    blurb: 'The board’s rear edge carries the high-density connectors that pipe all 36 NVLink 5 links (18 per GPU) out to the tray’s backplane and onward to the switch spine.',
    specs: [
      ['Links', '36× NVLink 5 (2 GPUs)'],
      ['Bandwidth', '3.6 TB/s per board'],
    ],
  },

  /* ============================== CHIP LEVEL ============================== */
  gpuDie: {
    tag: 'Silicon', name: 'Blackwell Compute Die',
    blurb: 'Each of the two dies is built at the lithography reticle limit. Together the pair packs 208 billion transistors of Tensor Cores, streaming multiprocessors, and the second-generation Transformer Engine with native FP4/FP6 support.',
    specs: [
      ['Package total', '208 billion across 2 dies'],
      ['Process', 'TSMC 4NP'],
      ['Die scale', 'Reticle-limited'],
      ['Features', 'Transformer Engine v2, FP4/FP6'],
    ],
  },
  nvhbi: {
    tag: 'Interconnect', name: 'NV-HBI Die-to-Die Bridge',
    blurb: 'The seam down the middle: NV-High Bandwidth Interface joins the two dies at 10 TB/s with full coherence. It is fast enough that software — and CUDA — sees a single unified GPU, not two chiplets. This is how Blackwell beat the reticle limit.',
    specs: [
      ['Bandwidth', '10 TB/s'],
      ['Latency', 'Near-monolithic'],
      ['Result', 'One GPU to software'],
    ],
  },
  hbmStack: {
    tag: 'Memory', name: 'HBM3e Stack',
    blurb: 'Eight HBM3e packages surround the two GPU dies. Each is illustrated as an eight-high DRAM stack joined by through-silicon vias. Together they deliver up to 8 TB/s and 186 GB of usable memory per B200; the nominal physical capacity is about 24 GB per stack.',
    specs: [
      ['Physical capacity', '~24 GB per stack'],
      ['Bandwidth', '~1 TB/s per stack'],
      ['GPU-visible total', '186 GB @ up to 8 TB/s'],
      ['Connection', 'TSVs on silicon interposer'],
    ],
    drill: 'hbm', drillLabel: 'Explode the stack →',
  },
  interposer: {
    tag: 'Packaging', name: 'CoWoS Advanced Package',
    blurb: 'Beneath the dies lies TSMC CoWoS advanced packaging, providing the dense local interconnect needed to connect the dual GPU dies and eight HBM stacks. The exact interposer construction is not publicly detailed in NVIDIA’s product specifications.',
    specs: [
      ['Technology', 'TSMC CoWoS'],
      ['Role', 'Die ↔ HBM micro-routing'],
      ['Public detail', 'Exact variant not specified'],
    ],
  },
  substrate: {
    tag: 'Packaging', name: 'Package Substrate',
    blurb: 'The green-black laminate that carries the whole assembly and fans signals out to thousands of solder balls on the underside. It also delivers the chip’s power — hundreds of watts to over a kilowatt — up into the silicon through dense via arrays.',
    specs: [
      ['Role', 'Signal fan-out + power delivery'],
      ['Underside', 'Thousands of BGA balls'],
    ],
  },
  /* =========================== SWITCH TRAY LEVEL ========================== */
  switchTrayChassis: {
    tag: 'Structure', name: 'Switch Tray Chassis (1U)',
    blurb: 'The switch system fits in the same 1U rack pitch as a compute tray. All 144 NVLink ports leave through blind-mate connectors at the rear; only BMC, USB/storage, and switch-management service ports appear at the front.',
    specs: [
      ['Height', '1U (44.45 mm)'],
      ['ASICs', '2× NVLink 5 switch chips'],
      ['Service', 'Tool-less slide-out'],
    ],
  },
  nvswitchPackage: {
    tag: 'Interconnect', name: 'NVLink 5 Switch ASIC',
    blurb: 'One of the two switch chips in the tray: a reticle-class monolithic die with 50 billion transistors spent on moving data. Its 72 NVLink 5 ports sum to 7.2 TB/s of advertised bidirectional port rate, and SHARP v4 engines execute reduction math inside the network itself.',
    specs: [
      ['Transistors', '50 billion'],
      ['Process', 'TSMC 4NP'],
      ['Ports', '72× NVLink 5 @ 100 GB/s'],
      ['Port-rate sum', '7.2 TB/s per chip'],
      ['In-network compute', 'SHARP v4 (FP8)'],
    ],
    drill: 'nvswitch', drillLabel: 'Inspect switch silicon →',
  },
  swColdplate: {
    tag: 'Cooling', name: 'Switch Cold Plate',
    blurb: 'Each switch ASIC gets its own liquid cold plate, plumbed to the same rack manifolds as the compute trays. Dense SerDes running flat-out generate several hundred watts per chip — far too much for air in a 1U box.',
    specs: [
      ['Heat absorbed', 'Several hundred W per ASIC'],
      ['Material', 'Nickel-plated copper'],
    ],
  },
  swBackplane: {
    tag: 'Interconnect', name: 'NVLink Backplane Connectors',
    blurb: 'The dense gold connector field at the rear is where all 144 NVLink ports leave the tray. They blind-mate into the cable spine, whose cartridges fan the lanes out so that every one of the 72 GPUs reaches every switch chip.',
    specs: [
      ['Ports', '144× NVLink 5 per tray'],
      ['Port-rate sum', '14.4 TB/s per tray'],
      ['Mating', 'Blind-mate, floating alignment'],
    ],
  },

  /* ============================ GRACE PACKAGE LEVEL ======================= */
  graceDie: {
    tag: 'Silicon', name: 'Grace Compute Die',
    blurb: 'A monolithic die with 72 Arm Neoverse V2 cores arranged on a mesh, tied together by NVIDIA’s Scalable Coherency Fabric — 3.2 TB/s of bisection bandwidth — and 117 MB of shared L3 cache. Built on TSMC 4N, it exists for one job: keeping two Blackwell GPUs supplied with data.',
    specs: [
      ['Cores', '72× Arm Neoverse V2'],
      ['Fabric', '3.2 TB/s bisection'],
      ['L3 cache', '117 MB'],
      ['Process', 'TSMC 4N'],
    ],
  },
  graceC2cPhy: {
    tag: 'Interconnect', name: 'NVLink-C2C PHY',
    blurb: 'The glowing strip along the die edge is where NVLink-C2C leaves the chip: 900 GB/s of coherent bandwidth to the two Blackwell GPUs a few centimetres away. This edge is why the GPUs can treat Grace’s 480 GB of LPDDR5X as their own memory.',
    specs: [
      ['Bandwidth', '900 GB/s bidirectional'],
      ['Coherency', 'Full cache coherence'],
    ],
  },
  graceMemPhy: {
    tag: 'Memory', name: 'LPDDR5X Controllers & PHY',
    blurb: 'Memory controllers and PHYs line the die edges, driving the LPDDR5X packages that sit millimetres away on the board. Short traces are the trick: they enable DDR5-class bandwidth — up to 512 GB/s — at a fraction of the I/O power.',
    specs: [
      ['Bandwidth', 'Up to 512 GB/s'],
      ['Memory', '480 GB LPDDR5X, ECC'],
    ],
  },

  /* =========================== NVSWITCH PACKAGE LEVEL ===================== */
  nvswitchDie: {
    tag: 'Silicon', name: 'NVLink Switch Die',
    blurb: 'A single monolithic die — no chiplets, because every nanosecond of switching latency is felt by 72 GPUs at once. Its 50 billion transistors implement a non-blocking crossbar, banks of SerDes, and SHARP v4 arithmetic engines that run all-reduce operations inside the switch, roughly doubling effective bandwidth for collectives.',
    specs: [
      ['Transistors', '50 billion'],
      ['Process', 'TSMC 4NP'],
      ['Crossbar', 'Non-blocking, 72 ports'],
      ['SHARP v4', '3.6 TFLOPS FP8 in-network'],
    ],
  },
  nvswitchPhy: {
    tag: 'Interconnect', name: 'NVLink 5 SerDes (PHY)',
    blurb: 'The strips along the die edges are the port PHYs: high-speed SerDes driving ~200 Gb/s PAM4 lanes directly onto passive copper. Running electrical instead of optical at this speed is an engineering feat — and it is what saves ~20 kW per rack.',
    specs: [
      ['Signalling', '~200 Gb/s PAM4 lanes'],
      ['Medium', 'Passive copper, no retimers'],
      ['Ports', '72 per chip'],
    ],
  },

  /* ============================= HBM STACK LEVEL ========================== */
  hbmDramDie: {
    tag: 'Memory', name: 'DRAM Die (Illustrative ×8)',
    blurb: 'Each floating layer represents a DRAM die thinned to tens of microns. Eight layers form a nominal ~24 GB physical HBM3e stack; reserved capacity and repair resources mean the complete B200 exposes 186 GB usable across its eight stacks.',
    specs: [
      ['Nominal capacity', '~3 GB per illustrated die'],
      ['Illustrated stack', '8 DRAM layers + base die'],
      ['Thickness', 'Tens of microns each'],
    ],
  },
  hbmBaseDie: {
    tag: 'Silicon', name: 'Base Logic Die',
    blurb: 'The foundation of the stack. It carries the PHY, control and test logic: translating the GPU’s requests into DRAM commands for the eight dies above, and driving the 1,024-bit interface down into the interposer.',
    specs: [
      ['Interface', '1,024-bit to interposer'],
      ['Role', 'PHY, control, repair logic'],
    ],
  },
  hbmTsv: {
    tag: 'Interconnect', name: 'Through-Silicon Vias',
    blurb: 'The vertical columns are TSVs: thousands of copper conductors drilled straight through every DRAM die. They are what makes stacking work — signals travel micrometres instead of centimetres, at a fraction of the energy a PCB trace would burn.',
    specs: [
      ['Count', 'Thousands per stack'],
      ['Function', 'Vertical power + data'],
      ['Benefit', 'µm-scale paths, minimal energy'],
    ],
  },
  hbmBumps: {
    tag: 'Packaging', name: 'Micro-bumps',
    blurb: 'Between each pair of dies sit arrays of solder micro-bumps at a pitch of tens of microns — the physical joints that bond the tower together and carry every TSV connection from one layer to the next.',
    specs: [
      ['Pitch', 'Tens of microns'],
      ['Role', 'Die-to-die bonding + signal'],
    ],
  },

  capacitors: {
    tag: 'Power', name: 'Decoupling Capacitors',
    blurb: 'The fields of tiny components around the silicon are decoupling capacitors — local energy reservoirs that smooth the power supply when tens of billions of transistors switch simultaneously. Without them, voltage droop would crash the chip at every clock burst.',
    specs: [
      ['Role', 'Transient current supply'],
      ['Response', 'Nanosecond-scale'],
    ],
  },
};
