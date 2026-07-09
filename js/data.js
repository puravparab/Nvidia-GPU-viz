// Component database for the GB200 NVL72 explorer.
// Every clickable object in the 3D scenes carries an `infoKey` that points here.
// `drill` marks components that can be zoomed into (a deeper scene level).

export const LEVELS = {
  datacenter: { title: 'AI Factory',               subtitle: 'Many NVL72 racks woven into one supercomputer — click a rack, CDU or spine switch' },
  rack:       { title: 'GB200 NVL72 Rack',         subtitle: 'Rack-scale exaflop AI system — click any component to inspect it' },
  tray:       { title: 'Compute Tray',             subtitle: '1U liquid-cooled MGX tray — lid removed, click components to inspect' },
  switchtray: { title: 'NVLink Switch Tray',       subtitle: '1U switch tray, lid removed — two NVLink 5 ASICs stitch all 72 GPUs together' },
  board:      { title: 'GB200 Superchip (Bianca)', subtitle: 'One Grace CPU + two Blackwell GPUs on a single superchip board' },
  chip:       { title: 'Blackwell B200 GPU',       subtitle: 'Dual-die GPU package with 8 stacks of HBM3e — click the silicon' },
  grace:      { title: 'Grace CPU Package',        subtitle: '72 Arm Neoverse V2 cores purpose-built to keep two Blackwells fed' },
  nvswitch:   { title: 'NVLink 5 Switch ASIC',     subtitle: '50 billion transistors spent entirely on moving data between GPUs' },
  hbm:        { title: 'HBM3e Stack — Exploded',   subtitle: 'Eight DRAM dies on a logic base, joined by thousands of through-silicon vias' },
};

export const INFO = {
  /* ============================== DATACENTER LEVEL ======================== */
  datacenter: {
    tag: 'Cluster', name: 'AI Factory',
    blurb: 'One NVL72 is a scale-up domain of 72 GPUs. To train and serve frontier models you need many of them, so racks are connected by a second, scale-out network into a single supercomputer. NVIDIA’s reference designs tile NVL72 racks into rows — a DGX SuperPOD reaches tens of thousands of GPUs, and the largest AI factories run into the hundreds of thousands.',
    specs: [
      ['Building block', '1 NVL72 = 72 GPUs'],
      ['Scale-up (in rack)', 'NVLink, 130 TB/s'],
      ['Scale-out (between racks)', 'Quantum-X800 IB / Spectrum-X'],
      ['SuperPOD', 'Tens of thousands of GPUs'],
      ['Power', 'Multiple MW per row'],
      ['Cooling', 'Facility water via CDUs'],
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
    blurb: 'A CDU is the bridge between the building’s water and the racks. A heat exchanger isolates the two loops, and pumps push filtered, temperature-controlled coolant through the rack manifolds. In-row units like these sit right beside the racks they serve; a single large CDU can reject on the order of a megawatt of heat.',
    specs: [
      ['Role', 'Facility ↔ rack coolant bridge'],
      ['Isolation', 'Liquid-to-liquid heat exchanger'],
      ['Capacity', '~1 MW class (in-row)'],
      ['Provides', 'Filtered, flow/temp-controlled loop'],
    ],
  },
  spineSwitch: {
    tag: 'Networking', name: 'Scale-out Spine Switch',
    blurb: 'These end-of-row switches form the scale-out fabric that links racks together — a different network from the NVLink inside each rack. NVIDIA uses Quantum-X800 InfiniBand or Spectrum-X Ethernet at 800 Gb/s per port, in a fat-tree so any GPU can reach any other GPU across the whole cluster.',
    specs: [
      ['Fabric', 'Quantum-X800 IB / Spectrum-X'],
      ['Port speed', '800 Gb/s'],
      ['Topology', 'Fat-tree, non-blocking'],
      ['Connects', 'ConnectX-7 / BlueField-3 in every tray'],
    ],
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
    blurb: 'A single liquid-cooled rack that behaves like one giant GPU. 36 Grace CPUs and 72 Blackwell GPUs are fused into one NVLink domain, delivering real-time inference for trillion-parameter models. The rack weighs about 1.36 tonnes and contains more than 5,000 copper cables. It is one tile in a much larger AI factory.',
    specs: [
      ['GPUs / CPUs', '72 Blackwell + 36 Grace'],
      ['FP4 inference', '1,440 PFLOPS (1.4 exaFLOPS)'],
      ['FP8 training', '720 PFLOPS'],
      ['GPU memory', '13.4 TB HBM3e'],
      ['Fast memory', 'Up to 30 TB (HBM + LPDDR5X)'],
      ['NVLink bandwidth', '130 TB/s aggregate'],
      ['Power', '~120 kW, liquid-cooled'],
      ['Form factor', 'NVIDIA MGX rack'],
    ],
    drill: 'datacenter', drillLabel: 'Zoom out to the AI factory →',
  },
  computeTray: {
    tag: 'Compute', name: 'Compute Tray (1U)',
    blurb: 'Each of the 18 compute trays hosts two GB200 superchips — 2 Grace CPUs and 4 Blackwell GPUs — on a liquid-cooled MGX chassis. Trays blind-mate into the 48 V DC busbar, the NVLink spine and the coolant manifolds at the rear, so they slide in and out like drawers with no cabling.',
    specs: [
      ['Per rack', '18 trays'],
      ['Superchips', '2× GB200 (2 CPU + 4 GPU)'],
      ['FP4 compute', '80 PFLOPS per tray'],
      ['HBM3e', '768 GB per tray'],
      ['LPDDR5X', '960 GB per tray'],
      ['Power', '~5.4 kW per tray'],
      ['Cooling', 'Direct-to-chip liquid cold plates'],
    ],
    drill: 'tray', drillLabel: 'Open compute tray →',
  },
  switchTray: {
    tag: 'Interconnect', name: 'NVLink Switch Tray (1U)',
    blurb: 'The nine switch trays in the middle of the rack are the heart of the NVL72 fabric. Each carries two NVLink 5 switch ASICs and provides 144 NVLink ports, letting all 72 GPUs talk to each other at full speed as if they were one chip. SHARP v4 engines perform in-network reductions for collective operations.',
    specs: [
      ['Per rack', '9 trays'],
      ['ASICs', '2× NVLink 5 switch chips'],
      ['Ports', '144 NVLink ports @ 100 GB/s'],
      ['Tray bandwidth', '14.4 TB/s'],
      ['Switch ASIC', '50B transistors, TSMC 4NP'],
      ['In-network compute', '3.6 TFLOPS SHARP v4 (FP8)'],
      ['Cooling', 'Liquid-cooled cold plates'],
    ],
    drill: 'switchtray', drillLabel: 'Open switch tray →',
  },
  powerShelf: {
    tag: 'Power', name: 'Power Shelf (33 kW)',
    blurb: 'Eight 1U power shelves convert facility AC into 48 V DC for the busbar. Each shelf holds six hot-swappable 5.5 kW power supply modules with N+1 redundancy. Moving AC/DC conversion out of the trays lets the compute stay dense and liquid-cooled.',
    specs: [
      ['Per rack', '8 shelves (6 minimum)'],
      ['Output', '33 kW per shelf'],
      ['Modules', '6× 5.5 kW PSUs, hot-swap'],
      ['Input', '415 V three-phase AC'],
      ['Output rail', '48 V DC to busbar'],
      ['Redundancy', 'N+1 per shelf'],
    ],
  },
  mgmtSwitch: {
    tag: 'Networking', name: 'Rack Management Switch',
    blurb: 'A top-of-rack Ethernet switch for out-of-band management. It connects the BMCs of every tray, the power shelves and the leak-detection sensors so operators can monitor and service the rack independently of the compute fabric.',
    specs: [
      ['Role', 'Out-of-band management'],
      ['Connects', 'Tray BMCs, power shelves, sensors'],
      ['Height', '1U'],
    ],
  },
  busbar: {
    tag: 'Power', name: '48 V DC Busbar',
    blurb: 'A vertical copper busbar runs the full height of the rack rear, rated for roughly 1,400 amps. Every tray blind-mates onto it, eliminating hundreds of individual power cables. 48 V distribution cuts conversion losses versus legacy 12 V designs.',
    specs: [
      ['Voltage', '48 V DC'],
      ['Current', '~1,400 A'],
      ['Material', 'Solid copper'],
      ['Connection', 'Blind-mate, tool-less trays'],
    ],
  },
  spine: {
    tag: 'Interconnect', name: 'NVLink Cable Spine',
    blurb: 'The copper backbone of the NVL72: a cartridge of more than 5,000 passive copper cables — about 3.2 km of wire — connecting every GPU to every NVLink switch. Staying electrical instead of optical saves roughly 20 kW per rack that optics would have burned.',
    specs: [
      ['Cables', '5,000+ passive copper pairs'],
      ['Total length', '~2 miles / 3.2 km'],
      ['Aggregate bandwidth', '130 TB/s'],
      ['Power saved vs optics', '~20 kW per rack'],
    ],
  },
  manifold: {
    tag: 'Cooling', name: 'Liquid Cooling Manifold',
    blurb: 'Vertical supply and return manifolds distribute warm-water coolant to every tray through blind-mate quick-disconnects. Liquid moves heat far more efficiently than air, which is what lets 120 kW live in a single rack; coolant enters around 25 °C and leaves around 45 °C.',
    specs: [
      ['Type', 'Direct-to-chip, warm water'],
      ['Supply / return', '~25 °C in, ~45 °C out'],
      ['Connection', 'Blind-mate quick disconnects'],
      ['Heat removed', '~100% of tray heat'],
    ],
  },
  rackFrame: {
    tag: 'Structure', name: 'MGX Rack Enclosure',
    blurb: 'The NVIDIA MGX rack is a modular, open-standard enclosure contributed to the Open Compute Project. Reinforced rails carry over a tonne of equipment, and the modular bay design accepts compute trays, switch trays and power shelves in any MGX-compatible arrangement.',
    specs: [
      ['Standard', 'NVIDIA MGX / OCP'],
      ['Weight loaded', '~1,360 kg (3,000 lb)'],
      ['Components', '~600,000 parts per rack'],
    ],
  },

  /* ============================== TRAY LEVEL ============================== */
  trayChassis: {
    tag: 'Structure', name: 'MGX 1U Tray Chassis',
    blurb: 'A 1U sheet-metal chassis around 44 mm tall — everything inside is cooled by liquid, so there are no bulky heatsinks or loud fans for the main silicon. The rear edge carries the blind-mate connectors for power, coolant and NVLink.',
    specs: [
      ['Height', '1U (44.45 mm)'],
      ['Boards', '2× GB200 Bianca boards'],
      ['Service', 'Tool-less slide-out'],
    ],
  },
  biancaBoard: {
    tag: 'Compute', name: 'GB200 Superchip Board (“Bianca”)',
    blurb: 'The Bianca board is the unit of compute: one Grace CPU and two Blackwell GPUs sharing a coherent memory space over NVLink-C2C. Each compute tray carries two of these boards side by side. Click through to see the bare board.',
    specs: [
      ['CPU', '1× Grace, 72 Arm cores'],
      ['GPUs', '2× Blackwell B200'],
      ['Coherent memory', '864 GB per superchip'],
      ['Board power', '~2.7 kW'],
    ],
    drill: 'board', drillLabel: 'Inspect GB200 superchip →',
  },
  gpuColdplate: {
    tag: 'Cooling', name: 'GPU Cold Plate',
    blurb: 'A nickel-plated copper cold plate sits directly on each Blackwell GPU. Micro-fin channels inside carry coolant that absorbs up to 1,200 W from the silicon a fraction of a millimetre below. Without these, a 1U tray at this density would be impossible.',
    specs: [
      ['Heat absorbed', 'Up to 1,200 W per GPU'],
      ['Material', 'Nickel-plated copper'],
      ['Design', 'Micro-fin liquid channels'],
    ],
  },
  cpuColdplate: {
    tag: 'Cooling', name: 'CPU Cold Plate',
    blurb: 'The Grace CPU gets its own liquid cold plate, plumbed in series with the GPU plates. The Arm CPU draws far less power than the GPUs (~300 W), so it sits downstream in the coolant loop.',
    specs: [
      ['Heat absorbed', '~300 W'],
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
  connectx: {
    tag: 'Networking', name: 'ConnectX-7 NIC (400G)',
    blurb: 'Four ConnectX-7 adapters per tray provide the scale-out fabric: 400 Gb/s InfiniBand/Ethernet per GPU to connect many NVL72 racks into clusters of tens of thousands of GPUs. The OSFP cages sit on the front panel.',
    specs: [
      ['Per tray', '4× ConnectX-7'],
      ['Speed', '400 Gb/s each'],
      ['Fabric', 'InfiniBand NDR / Ethernet'],
      ['Role', 'Scale-out (rack-to-rack)'],
    ],
  },
  bluefield: {
    tag: 'Networking', name: 'BlueField-3 DPU',
    blurb: 'Two BlueField-3 data processing units offload networking, storage and security from the Grace CPUs. Each DPU is itself a 16-core Arm computer with 400 Gb/s connectivity, running the north-south network and tenant isolation.',
    specs: [
      ['Per tray', '2× BlueField-3'],
      ['Speed', '400 Gb/s each'],
      ['Cores', '16× Arm A78 per DPU'],
      ['Role', 'Storage / security / mgmt offload'],
    ],
  },
  nvme: {
    tag: 'Storage', name: 'E1.S NVMe Storage',
    blurb: 'Four E1.S NVMe drives on the front panel give each tray fast local scratch storage for checkpoints and data staging. The E1.S ruler form factor is hot-swappable from the cold aisle.',
    specs: [
      ['Per tray', '4× E1.S NVMe'],
      ['Interface', 'PCIe Gen5'],
      ['Serviceability', 'Front hot-swap'],
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
      ['Memory', '480 GB LPDDR5X on-package'],
      ['Memory bandwidth', 'Up to 512 GB/s'],
      ['NVLink-C2C', '900 GB/s to GPUs'],
      ['Power', '~300 W'],
    ],
    drill: 'grace', drillLabel: 'Inspect Grace package →',
  },
  lpddr: {
    tag: 'Memory', name: 'LPDDR5X Memory',
    blurb: 'A ring of LPDDR5X packages surrounds the Grace die — 480 GB of ECC memory at a fraction of the power an equivalent DDR5 DIMM setup would draw. This is the “capacity tier”: huge models spill from GPU HBM into this pool over NVLink-C2C.',
    specs: [
      ['Capacity', '480 GB per Grace'],
      ['Bandwidth', 'Up to 512 GB/s'],
      ['Type', 'LPDDR5X with ECC'],
      ['Efficiency', '~1/8 the power per byte of DDR5'],
    ],
  },
  b200Package: {
    tag: 'GPU', name: 'Blackwell B200 GPU',
    blurb: 'The largest chip NVIDIA has ever shipped: two reticle-limited dies fused by a 10 TB/s bridge so software sees one giant GPU, flanked by eight HBM3e stacks. Click through to inspect the package silicon.',
    specs: [
      ['Transistors', '208 billion'],
      ['Process', 'TSMC 4NP, dual die'],
      ['Memory', '192 GB HBM3e'],
      ['Memory bandwidth', '8 TB/s'],
      ['FP4 compute', '20 PFLOPS'],
      ['Power', 'Up to 1,200 W'],
    ],
    drill: 'chip', drillLabel: 'Inspect Blackwell GPU →',
  },
  c2cLink: {
    tag: 'Interconnect', name: 'NVLink-C2C',
    blurb: 'The glowing lanes between Grace and each GPU: a 900 GB/s chip-to-chip interconnect — 7× PCIe Gen5 — that is fully cache-coherent. CPU and GPU share one address space, so the GPUs treat Grace’s 480 GB of LPDDR5X as their own extended memory.',
    specs: [
      ['Bandwidth', '900 GB/s bidirectional'],
      ['Coherency', 'Full cache coherence'],
      ['vs PCIe Gen5 x16', '~7× faster'],
    ],
  },
  vrm: {
    tag: 'Power', name: 'Voltage Regulator Modules',
    blurb: 'Banks of power stages and inductors convert the 48 V busbar input down to the ~0.8 V core rails the silicon needs — over 1,000 A flowing into each GPU at full load. VRM placement hugs the packages to minimise resistive losses.',
    specs: [
      ['Input', '48 V DC'],
      ['Output', 'Sub-1 V core rails'],
      ['Current', '1,000+ A per GPU'],
    ],
  },
  boardPcb: {
    tag: 'Structure', name: 'Superchip PCB',
    blurb: 'A high-layer-count board roughly 600 mm long carrying the superchip. Dozens of copper layers route power planes and the ultra-dense NVLink and C2C signal pairs with tight impedance control.',
    specs: [
      ['Length', '~600 mm'],
      ['Layers', 'High-layer-count HDI'],
      ['Signals', 'NVLink 5, C2C, PCIe Gen5'],
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
    blurb: 'Each of the two dies is built at the reticle limit — the largest area a lithography machine can print (~800 mm²). Together they pack 208 billion transistors of Tensor Cores, streaming multiprocessors and the second-generation Transformer Engine with native FP4/FP6 support.',
    specs: [
      ['Transistors', '104 billion per die'],
      ['Process', 'TSMC 4NP'],
      ['Size', 'Reticle-limited (~800 mm²)'],
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
    blurb: 'Each of the eight towers is a stack of eight DRAM dies, thinned to tens of microns and connected vertically by thousands of through-silicon vias. One stack moves ~1 TB/s — all eight together give the GPU its 8 TB/s of memory bandwidth.',
    specs: [
      ['Capacity', '24 GB per stack (8-high)'],
      ['Bandwidth', '~1 TB/s per stack'],
      ['Total', '192 GB @ 8 TB/s'],
      ['Connection', 'TSVs on silicon interposer'],
    ],
    drill: 'hbm', drillLabel: 'Explode the stack →',
  },
  interposer: {
    tag: 'Packaging', name: 'CoWoS-L Interposer',
    blurb: 'Beneath the dies lies TSMC’s CoWoS-L packaging: an interposer with embedded local silicon bridges carrying tens of thousands of micro-wires. It is the only way to wire 8 HBM stacks to the GPU with the density HBM requires; an ordinary PCB could never route this many connections.',
    specs: [
      ['Technology', 'TSMC CoWoS-L'],
      ['Role', 'Die ↔ HBM micro-routing'],
      ['Design', 'Silicon bridges in an RDL interposer'],
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
    blurb: 'The same MGX 1U form factor as the compute trays, but every watt here is spent on networking. In the NVL72 configuration there are no front cables at all — all 144 NVLink ports leave through blind-mate connectors at the rear, straight onto the copper spine.',
    specs: [
      ['Height', '1U (44.45 mm)'],
      ['ASICs', '2× NVLink 5 switch chips'],
      ['Service', 'Tool-less slide-out'],
    ],
  },
  nvswitchPackage: {
    tag: 'Interconnect', name: 'NVLink 5 Switch ASIC',
    blurb: 'One of the two switch chips in the tray: a reticle-class monolithic die with 50 billion transistors — nearly a full GPU’s worth of silicon spent purely on moving data. Each chip switches 7.2 TB/s across 72 NVLink 5 ports, and its SHARP v4 engines execute reduction math inside the network itself.',
    specs: [
      ['Transistors', '50 billion'],
      ['Process', 'TSMC 4NP'],
      ['Ports', '72× NVLink 5 @ 100 GB/s'],
      ['Bandwidth', '7.2 TB/s per chip'],
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
      ['Bandwidth', '14.4 TB/s per tray'],
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
    tag: 'Memory', name: 'DRAM Die (×8)',
    blurb: 'Each floating layer is a complete 3 GB DRAM chip, ground down to tens of microns — several times thinner than a human hair — so that eight of them stack into a tower shorter than a grain of rice. Together they hold the 24 GB this stack contributes.',
    specs: [
      ['Capacity', '3 GB per die'],
      ['Dies per stack', '8 (plus base die)'],
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
