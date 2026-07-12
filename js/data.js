// Component database for the GB200 NVL72 explorer.
// Every clickable object in the 3D scenes carries an `infoKey` that points here.
// `drill` marks components that can be zoomed into (a deeper scene level).
// Vera Rubin NVL72 entries live in data-vr.js and are merged in at the bottom.

import { INFO_VR, LEVELS_VR } from './data-vr.js';

export const LEVELS = {
  datacenter: { title: 'AI Factory' },
  rack:       { title: 'GB200 NVL72 Rack' },
  tray:       { title: 'Compute Tray' },
  switchtray: { title: 'NVLink Switch Tray' },
  board:      { title: 'GB200 Superchip (Bianca)' },
  chip:       { title: 'Blackwell B200 GPU' },
  grace:      { title: 'Grace CPU Package' },
  nvswitch:   { title: 'NVLink 5 Switch ASIC' },
  hbm:        { title: 'HBM3e Stack — Exploded' },
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
    blurb: 'These illustrative network racks represent the leaf-and-spine compute fabric linking NVL72 racks. This scale-out network is separate from the NVLink fabric inside each rack. A DGX GB200 rack has 72 single-port 400 Gb/s ConnectX-7 adapters—four in each of its 18 compute trays.',
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
    blurb: 'The room itself: an illustrative data hall arranged around equipment rows and service aisles. Power, liquid-cooling distribution and high-speed network cabling are facility-specific; this scene shows one plausible overhead-busway and in-row-CDU layout rather than a prescribed NVIDIA design.',
    specs: [
      ['Layout', 'Hot / cold aisle rows'],
      ['Power delivery', 'Overhead busway'],
      ['Implementation', 'Site-specific'],
    ],
  },

  /* ============================== RACK LEVEL ============================== */
  rack: {
    tag: 'System', name: 'NVIDIA GB200 NVL72',
    blurb: 'A hybrid-cooled rack that behaves like one giant GPU. Direct liquid cooling handles the high-power silicon while fans cool storage and management hardware. Its 36 Grace CPUs and 72 Blackwell GPUs share one NVLink domain connected through four cable cartridges containing more than 5,000 copper cables.',
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
      ['Cooling', 'Direct-to-chip liquid cold plates'],
    ],
    sources: [['NVIDIA DGX GB hardware guide', 'https://docs.nvidia.com/dgx/dgxgb200-user-guide/hardware.html']],
    drill: 'tray', drillLabel: 'Open compute tray →',
  },
  switchTray: {
    tag: 'Interconnect', name: 'NVLink Switch Tray (1U)',
    blurb: 'The nine switch trays form the NVL72 fabric. Each 1U tray carries two NVLink 5 switch ASICs with 72 ports apiece. NVIDIA rates the switch-tray system at 57.6 Tb/s of full-duplex bandwidth, while SHARP engines accelerate collective operations inside the fabric.',
    specs: [
      ['Per rack', '9 trays'],
      ['ASICs', '2× NVLink 5 switch chips'],
      ['Ports', '2× 72 NVLink ports'],
      ['Full-duplex bandwidth', '57.6 Tb/s per tray'],
      ['In-network compute', 'SHARP collectives'],
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
    blurb: 'A top-of-rack Ethernet switch for out-of-band management. NVIDIA documents two TOR switches connecting the compute-tray BMCs, BlueField-3 BMC interfaces and NVLink switch trays to the management network.',
    specs: [
      ['Role', 'Out-of-band management'],
      ['Connects', 'Compute and switch tray BMCs'],
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
      ['Published capacity', 'Up to 1,400 A'],
      ['Connection', 'Rack components mate to busbar'],
    ],
    sources: [['NVIDIA OCP design contribution', 'https://developer.nvidia.com/blog/nvidia-contributes-nvidia-gb200-nvl72-designs-to-open-compute-project/']],
  },
  spine: {
    tag: 'Interconnect', name: 'Four NVLink Cable Cartridges',
    blurb: 'The copper backbone of the NVL72 is split across four rear cartridges housing more than 5,000 coaxial copper cables. Through rear tray connectors, the cartridges form the all-to-all NVLink fabric between the 72 GPUs and the switch trays.',
    specs: [
      ['Cartridges', '4 rear cable modules'],
      ['Cables', '5,000+ coaxial copper cables'],
      ['Aggregate bandwidth', '130 TB/s'],
    ],
    sources: [['NVIDIA OCP design contribution', 'https://developer.nvidia.com/blog/nvidia-contributes-nvidia-gb200-nvl72-designs-to-open-compute-project/']],
  },
  manifold: {
    tag: 'Cooling', name: 'Liquid Cooling Manifold',
    blurb: 'Vertical supply and return manifolds distribute technology-cooling-system fluid to every compute and switch tray through blind-mate quick-disconnects. A facility CDU isolates and controls this secondary loop; exact temperatures and flow rates depend on the site design.',
    specs: [
      ['Type', 'Direct-to-chip liquid cooling'],
      ['Loop', 'Facility CDU ↔ rack manifold'],
      ['Connection', 'Blind-mate quick disconnects'],
      ['Monitored by', 'Rack and tray leak detection'],
    ],
  },
  rackFrame: {
    tag: 'Structure', name: 'OCP ORv3-Derived Rack Enclosure',
    blurb: 'The 48U layout adapts Open Rack design principles for dense 1U, 19-inch EIA equipment. NVIDIA documents added steel reinforcement, blind-mate slide rails and a rear extension that protects cable bracing and manifold fittings, and contributed the liquid-cooled rack design to the Open Compute Project.',
    specs: [
      ['Format', '48U, OCP ORv3-derived'],
      ['Equipment mounting', 'Adapted 19-inch EIA'],
      ['Added reinforcement', 'More than 100 lb of steel'],
      ['Designed mating force', '6,000 lb across components'],
    ],
    sources: [['NVIDIA OCP design contribution', 'https://developer.nvidia.com/blog/nvidia-contributes-nvidia-gb200-nvl72-designs-to-open-compute-project/']],
  },
  leakTray: {
    tag: 'Safety', name: 'Leakage Drip Pan',
    blurb: 'This bottom pan represents secondary containment for the liquid-cooled rack. NVIDIA documents rack leak detection, but the pan geometry and sensor placement shown here are illustrative rather than official CAD.',
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
    ],
    sources: [['NVIDIA GB200 NVL72 specifications', 'https://www.nvidia.com/en-us/data-center/gb200-nvl72/']],
    drill: 'board', drillLabel: 'Inspect GB200 superchip →',
  },
  gpuColdplate: {
    tag: 'Cooling', name: 'GPU Cold Plate',
    blurb: 'A direct-liquid-cooling assembly sits over each Blackwell package and transfers heat into the tray coolant loop. The geometry shown here is illustrative; NVIDIA’s public user guide identifies the liquid-cooled components but does not publish the internal cold-plate construction.',
    specs: [
      ['Scope', 'One cold plate per GPU'],
      ['Cooling', 'Direct liquid cooling'],
    ],
  },
  cpuColdplate: {
    tag: 'Cooling', name: 'CPU Cold Plate',
    blurb: 'Each Grace CPU has a direct-liquid-cooling assembly connected to the tray coolant loop. Its form in this visualization is illustrative; the NVIDIA hardware guide confirms liquid cooling for the CPU but does not publish the plate’s internal construction.',
    specs: [
      ['Scope', 'One cold plate per Grace CPU'],
      ['Cooling', 'Direct liquid cooling'],
    ],
  },
  coolantLoop: {
    tag: 'Cooling', name: 'Coolant Tubing & Quick-Disconnects',
    blurb: 'Flexible hoses link the cold plates to supply and return couplings at the rear of the tray, where the tray connects to the rack’s liquid-cooling manifolds. Exact coupling and service procedures depend on the production system documentation.',
    specs: [
      ['Couplings', 'Rear supply and return'],
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
    tag: 'Interconnect', name: 'Board-to-Board Coherent Link',
    blurb: 'This connector represents the coherent link between the two GB200 compute boards in a tray. NVIDIA’s SuperPOD reference architecture confirms that the two superchips are bridged for one operating-system instance; the connector geometry and lane-level implementation shown here are illustrative.',
    specs: [
      ['Scope', 'Two GB200 boards per tray'],
      ['Role', 'Coherent board-to-board connection'],
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
      ['Memory', 'Up to 480 GB LPDDR5X nearby'],
      ['Memory bandwidth', 'Up to 512 GB/s'],
      ['NVLink-C2C', '900 GB/s aggregate to 2 GPUs'],
    ],
    sources: [
      ['NVIDIA Grace CPU architecture', 'https://developer.nvidia.com/blog/inside-nvidia-grace-cpu-nvidia-amps-up-superchip-engineering-for-hpc-and-ai/'],
      ['NVIDIA Grace CPU product page', 'https://www.nvidia.com/en-us/data-center/grace-cpu-superchip/'],
    ],
    drill: 'grace', drillLabel: 'Inspect Grace package →',
  },
  lpddr: {
    tag: 'Memory', name: 'LPDDR5X Memory',
    blurb: 'Banks of server-class LPDDR5X packages flank the Grace package, providing up to 480 GB with ECC. NVIDIA specifies up to 512 GB/s of bandwidth and about one-fifth the power of conventional DDR memory.',
    specs: [
      ['Capacity', 'Up to 480 GB per Grace'],
      ['Bandwidth', 'Up to 512 GB/s'],
      ['Type', 'LPDDR5X with ECC'],
      ['Efficiency', 'About 1/5 the power of DDR5'],
    ],
  },
  b200Package: {
    tag: 'GPU', name: 'Blackwell B200 GPU',
    blurb: 'Two reticle-limited dies are joined by a 10 TB/s chip-to-chip link so software sees one GPU, flanked by eight HBM3e packages. Current GB200 NVL72 specifications expose 186 GB of usable HBM3e per B200.',
    specs: [
      ['Transistors', '208 billion'],
      ['Process', 'TSMC 4NP, dual die'],
      ['Memory', '186 GB usable HBM3e'],
      ['Memory bandwidth', '8 TB/s'],
      ['NVFP4 sparse | dense', '20 | 10 PFLOPS'],
    ],
    sources: [
      ['NVIDIA GB200 NVL72 specifications', 'https://www.nvidia.com/en-us/data-center/gb200-nvl72/'],
      ['NVIDIA Blackwell announcement', 'https://nvidianews.nvidia.com/news/nvidia-blackwell-platform-arrives-to-power-a-new-era-of-computing'],
    ],
    drill: 'chip', drillLabel: 'Inspect Blackwell GPU →',
  },
  c2cLink: {
    tag: 'Interconnect', name: 'NVLink-C2C',
    blurb: 'The glowing lanes represent the coherent Grace-to-GPU links. NVIDIA specifies up to 900 GB/s of aggregate NVLink-C2C bandwidth for a GB200 superchip. The coherent connection lets the GPUs access Grace’s LPDDR5X memory without a conventional PCIe-only boundary.',
    specs: [
      ['Superchip aggregate', 'Up to 900 GB/s'],
      ['Coherency', 'Full cache coherence'],
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
    blurb: 'A multilayer board carrying the Grace CPU, two Blackwell GPUs, memory and power delivery. It routes power plus the dense NVLink, NVLink-C2C and PCIe signals into the tray connectors. The internal layer count is not specified in NVIDIA’s public product documentation.',
    specs: [
      ['Construction', 'Multilayer high-density PCB'],
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
    blurb: 'Eight HBM3e packages surround the two GPU dies in this package view. Together they provide 186 GB of usable memory and up to 8 TB/s of bandwidth per B200. The exploded eight-high construction is illustrative because NVIDIA does not publish the exact die-by-die stack organization in the product specification.',
    specs: [
      ['GPU-visible total', '186 GB @ up to 8 TB/s'],
      ['Connection', 'TSVs on silicon interposer'],
    ],
    sources: [['NVIDIA GB200 NVL72 specifications', 'https://www.nvidia.com/en-us/data-center/gb200-nvl72/']],
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
    blurb: 'The green-black laminate carries the assembly, fans signals out to a dense BGA connection field and delivers power into the silicon through package routing and vias. The ball pattern shown here is illustrative.',
    specs: [
      ['Role', 'Signal fan-out + power delivery'],
      ['Underside', 'Dense BGA connection field'],
    ],
  },
  /* =========================== SWITCH TRAY LEVEL ========================== */
  switchTrayChassis: {
    tag: 'Structure', name: 'Switch Tray Chassis (1U)',
    blurb: 'The switch system fits in the same 1U rack pitch as a compute tray. All 144 NVLink ports leave through blind-mate connectors at the rear; only BMC, USB/storage, and switch-management service ports appear at the front.',
    specs: [
      ['Height', '1U (44.45 mm)'],
      ['ASICs', '2× NVLink 5 switch chips'],
      ['Management', 'On-tray BMC and NVOS'],
    ],
  },
  nvswitchPackage: {
    tag: 'Interconnect', name: 'NVLink 5 Switch ASIC',
    blurb: 'One of the two NVLink 5 switch ASICs in a switch tray. Each ASIC exposes 72 NVLink ports, and the pair forms a 1U switch system rated at 57.6 Tb/s full duplex. SHARP engines accelerate collective operations inside the network.',
    specs: [
      ['Ports', '72 NVLink ports per ASIC'],
      ['Tray configuration', '2 ASICs'],
      ['Tray bandwidth', '57.6 Tb/s full duplex'],
      ['In-network compute', 'SHARP collectives'],
    ],
    sources: [
      ['NVIDIA DGX GB hardware guide', 'https://docs.nvidia.com/dgx/dgxgb200-user-guide/hardware.html'],
    ],
    drill: 'nvswitch', drillLabel: 'Inspect switch silicon →',
  },
  swColdplate: {
    tag: 'Cooling', name: 'Switch Cold Plate',
    blurb: 'Each switch ASIC has a liquid cold plate connected to the rack cooling loop. The visualization shows the functional arrangement; NVIDIA’s public guide does not specify the plate material or the ASIC heat load.',
    specs: [
      ['Scope', 'One cold plate per ASIC'],
      ['Cooling', 'Direct liquid cooling'],
    ],
  },
  swBackplane: {
    tag: 'Interconnect', name: 'NVLink Backplane Connectors',
    blurb: 'The dense gold connector field at the rear is where all 144 NVLink ports leave the tray. They blind-mate into the cable spine, whose cartridges fan the lanes out so that every one of the 72 GPUs reaches every switch chip.',
    specs: [
      ['Ports', '2× 72 NVLink ports per tray'],
      ['Tray bandwidth', '57.6 Tb/s full duplex'],
      ['Mating', 'Blind-mate, floating alignment'],
    ],
  },

  /* ============================ GRACE PACKAGE LEVEL ======================= */
  graceDie: {
    tag: 'Silicon', name: 'Grace Compute Die',
    blurb: 'A monolithic die with 72 Arm Neoverse V2 cores connected by NVIDIA’s Scalable Coherency Fabric, which provides 3.2 TB/s of bisection bandwidth. Current NVIDIA specifications list 114 MB of L3 cache. The raised core layout in this scene is an architectural illustration, not a published die floorplan.',
    specs: [
      ['Cores', '72× Arm Neoverse V2'],
      ['Fabric', '3.2 TB/s bisection'],
      ['L3 cache', '114 MB'],
      ['Process', 'TSMC 4N'],
    ],
    sources: [
      ['Inside NVIDIA Grace CPU', 'https://developer.nvidia.com/blog/inside-nvidia-grace-cpu-nvidia-amps-up-superchip-engineering-for-hpc-and-ai/'],
      ['NVIDIA Grace CPU specifications', 'https://www.nvidia.com/en-us/data-center/grace-cpu-superchip/'],
    ],
  },
  graceC2cPhy: {
    tag: 'Interconnect', name: 'NVLink-C2C PHY',
    blurb: 'The glowing strip represents the NVLink-C2C physical interface. A GB200 superchip provides up to 900 GB/s of coherent CPU-to-GPU connectivity, allowing the Blackwell GPUs to access Grace’s LPDDR5X memory.',
    specs: [
      ['Bandwidth', 'Up to 900 GB/s per superchip'],
      ['Coherency', 'Full cache coherence'],
    ],
    sources: [['NVIDIA GB200 NVL72 specifications', 'https://www.nvidia.com/en-us/data-center/gb200-nvl72/']],
  },
  graceMemPhy: {
    tag: 'Memory', name: 'LPDDR5X Controllers & PHY',
    blurb: 'The cyan edge strips represent the memory-controller and PHY regions that drive nearby LPDDR5X packages. Their exact floorplan is illustrative; NVIDIA specifies up to 512 GB/s of CPU-memory bandwidth for the GB200 superchip.',
    specs: [
      ['Bandwidth', 'Up to 512 GB/s'],
      ['Memory', '480 GB LPDDR5X, ECC'],
    ],
  },

  /* =========================== NVSWITCH PACKAGE LEVEL ===================== */
  nvswitchDie: {
    tag: 'Silicon', name: 'NVLink Switch Die',
    blurb: 'This illustrative silicon view represents one 72-port NVLink switch ASIC. The device routes fifth-generation NVLink traffic and supports SHARP in-network acceleration for collective operations; NVIDIA does not publish a detailed physical floorplan in the DGX GB hardware guide.',
    specs: [
      ['Ports', '72 NVLink ports'],
      ['Role', 'NVLink fabric switching'],
      ['In-network compute', 'SHARP collectives'],
    ],
  },
  nvswitchPhy: {
    tag: 'Interconnect', name: 'NVLink 5 SerDes (PHY)',
    blurb: 'The edge strips represent the high-speed physical interfaces that connect the switch ASIC to the rack’s passive-copper NVLink cable cartridges. Their placement and block layout are illustrative.',
    specs: [
      ['Medium', 'Passive copper backplane'],
      ['Ports', '72 per chip'],
    ],
  },

  /* ============================= HBM STACK LEVEL ========================== */
  hbmDramDie: {
    tag: 'Memory', name: 'DRAM Die (Illustrative ×8)',
    blurb: 'Each floating layer represents a thinned DRAM die. This scene deliberately uses an illustrative eight-high stack; NVIDIA specifies 186 GB of usable HBM3e per B200 but does not publish the exact die-by-die capacity mapping in the GB200 product specifications.',
    specs: [
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

Object.assign(LEVELS, LEVELS_VR);
Object.assign(INFO, INFO_VR);
