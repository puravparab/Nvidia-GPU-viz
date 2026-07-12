// Component database for the Vera Rubin NVL72 explorer levels.
// Same shape as data.js: every clickable object in the VR scenes carries an
// `infoKey` pointing here. Keys are namespaced `vr*` so the two systems share
// one INFO dictionary. Specs follow the CES 2026 announcement and the
// SemiAnalysis Vera Rubin deep dive.

const SA = ['SemiAnalysis Vera Rubin deep dive', 'https://newsletter.semianalysis.com/p/vera-rubin-extreme-co-design-an-evolution'];
const NV = ['NVIDIA Vera Rubin POD overview', 'https://developer.nvidia.com/blog/nvidia-vera-rubin-pod-seven-chips-five-rack-scale-systems-one-ai-supercomputer/'];

export const LEVELS_VR = {
  vrRack:       { title: 'VR NVL72 Rack' },
  vrTray:       { title: 'VR Compute Tray' },
  vrSwitchtray: { title: 'NVLink 6 Switch Tray' },
  vrBoard:      { title: 'Strata Module' },
  vrChip:       { title: 'Rubin GPU' },
  vrVera:       { title: 'Vera CPU Package' },
  vrNvswitch:   { title: 'NVLink 6 Switch ASIC' },
  vrHbm:        { title: 'HBM4 Stack — Exploded' },
};

export const INFO_VR = {
  /* ============================== RACK LEVEL ============================== */
  vrRack: {
    tag: 'System', name: 'NVIDIA Vera Rubin NVL72',
    blurb: 'The second-generation Oberon rack: 72 Rubin GPUs, 36 Vera CPUs and 36 NVLink 6 switch ASICs behave as one distributed accelerator. The compute trays are 100% liquid-cooled and fanless, the trays are cableless inside, and rack power roughly doubles over GB200 to 180–220 kW.',
    specs: [
      ['GPUs / CPUs', '72 Rubin + 36 Vera'],
      ['FP4 inference | dense', '3.6 | 2.5 EFLOPS'],
      ['HBM4 capacity', '~20.7 TB @ 22 TB/s each'],
      ['NVLink 6 aggregate', '260 TB/s (2× GB200)'],
      ['NVSwitch chips', '36 (4 per switch tray)'],
      ['Power', '180–220 kW, 100% liquid-cooled'],
      ['Coolant', 'Up to 45 °C inlet, chiller-less capable'],
      ['Form factor', '48U Oberon rack'],
    ],
    sources: [NV, SA],
  },
  vrComputeTray: {
    tag: 'Compute', name: 'Compute Tray (1U)',
    blurb: 'Each of the 18 compute trays holds two Strata modules — 4 Rubin GPUs and 2 Vera CPUs — plus four Orchid networking modules, a BlueField-4 module, power delivery and management modules, all blind-mating to a PCB midplane. The cableless modular design cut assembly time from 2 hours to about 5 minutes.',
    specs: [
      ['Per rack', '18 trays'],
      ['Silicon', '4× Rubin + 2× Vera'],
      ['Modules', '2 Strata · 4 Orchid · BF-4 · PDM · mgmt'],
      ['Internal cables', 'None — Paladin HD2 board-to-board'],
      ['Scale-out', '8× ConnectX-9 (1.6 Tb/s per GPU)'],
      ['Cooling', '100% liquid, fanless chassis'],
    ],
    sources: [SA],
    drill: 'vrTray', drillLabel: 'Open compute tray →',
  },
  vrSwitchTray: {
    tag: 'Interconnect', name: 'NVLink 6 Switch Tray (1U)',
    blurb: 'Nine switch trays each carry four NVLink 6 switch ASICs — double the switch silicon of GB200 — for 115.2 Tb/s per tray. Bidirectional 400G SerDes double the fabric bandwidth without doubling the copper. All NVLink signals run over the PCB; the only flyover cable left in the whole rack connects the tray to its management module.',
    specs: [
      ['Per rack', '9 trays'],
      ['ASICs', '4× NVLink 6 switch chips'],
      ['Tray bandwidth', '115.2 Tb/s aggregate'],
      ['SerDes', '400G simultaneous bidirectional'],
      ['Board', '32-layer M8+ CCL, quartz-class glass'],
      ['In-network compute', 'SHARP, 3.6 TFLOPS per ASIC'],
    ],
    sources: [SA],
    drill: 'vrSwitchtray', drillLabel: 'Open switch tray →',
  },
  vrPowerShelf: {
    tag: 'Power', name: 'Power Shelf (110 kW, 3U)',
    blurb: 'Four 3U power shelves feed the rack in an N+1 arrangement — two above the compute stack and two below. Each shelf packs six 18.3 kW hot-swap PSUs with built-in capacitors, takes three-phase 415–480 VAC from two 100 A whips, and outputs 50 V DC onto the busbar.',
    specs: [
      ['Per rack', '4 shelves (N+1)'],
      ['Output', '110 kW per shelf'],
      ['Modules', '6× 18.3 kW PSUs, hot-swap'],
      ['Input', '3-phase 415–480 VAC, 2× 100 A whips'],
      ['Output rail', '50 V DC busbar'],
    ],
    sources: [SA],
  },
  vrMgmtSwitch: {
    tag: 'Networking', name: 'OOB Management Switch (SN2201)',
    blurb: 'Two 1 GbE SN2201 switches at the top of the rack carry the out-of-band management network: BMCs on every compute tray, the switch-tray management modules, and the power shelves, reachable even when the hosts are down.',
    specs: [
      ['Per rack', '2× SN2201'],
      ['Speed', '1 GbE out-of-band'],
      ['Connects', 'Tray BMCs, SMMs, power shelves'],
      ['Height', '1U each'],
    ],
    sources: [SA],
  },
  vrStiffener: {
    tag: 'Structure', name: 'Rack Stiffener',
    blurb: 'A structural 1U stiffener bay between the power shelves and the tray stack. With roughly double GB200’s weight in silicon, cold plates and coolant, the VR rack adds bracing to keep the 48U column rigid enough for blind-mate insertion forces.',
    specs: [
      ['Position', 'U38 (upper) and U10 (lower)'],
      ['Role', 'Structural bracing for blind-mate stack'],
    ],
    sources: [SA],
  },
  vrDripTray: {
    tag: 'Safety', name: 'Rack Stiffener + Drip Tray',
    blurb: 'The lower stiffener bay doubles as leak containment: a drip tray under the fully liquid-cooled tray stack catches coolant before it reaches the power shelves below, complementing per-tray leak detection.',
    specs: [
      ['Position', 'U10, below the compute stack'],
      ['Role', 'Bracing + coolant containment'],
    ],
    sources: [SA],
  },
  vrBusbar: {
    tag: 'Power', name: '50 V Liquid-Cooled Busbar',
    blurb: 'The vertical copper busbar is rated for more than 5,000 A — up from 2,900 A in Grace Blackwell. At that current, and with no fans left in the rack, the busbar itself is liquid-cooled. Trays blind-mate to it through rear clips.',
    specs: [
      ['Voltage', '50 V DC'],
      ['Rating', '5,000 A+ (vs 2,900 A on GB200)'],
      ['Cooling', 'Liquid-cooled conductor'],
      ['Connection', 'Blind-mate tray clips'],
    ],
    sources: [SA],
  },
  vrSpine: {
    tag: 'Interconnect', name: 'NVLink 6 Copper Backplane',
    blurb: 'The same ~5,000-cable copper backplane as Grace Blackwell now moves twice the data: NVLink 6 sends 448G per differential pair by signaling in both directions simultaneously over each wire, with echo cancellation separating transmit from receive. Cable count, connectors and pairs per connector are unchanged.',
    specs: [
      ['Cables', '~5,000 copper, same as GB300'],
      ['Per lane', '448G bidirectional (2× NVLink 5)'],
      ['Aggregate', '260 TB/s scale-up fabric'],
      ['Trick', 'Simultaneous bidirectional SerDes'],
    ],
    sources: [SA],
  },
  vrManifold: {
    tag: 'Cooling', name: 'Liquid Cooling Manifolds',
    blurb: 'With the compute trays 100% liquid-cooled, the manifolds carry roughly double GB200’s heat at 2–2.5× the flow. Vera Rubin runs warm water — up to 45 °C inlet with return up to ~65 °C — which can eliminate mechanical chillers from the facility loop entirely.',
    specs: [
      ['Coverage', '100% of tray heat'],
      ['Inlet', 'Up to 45 °C facility-friendly'],
      ['Return ceiling', '~65 °C'],
      ['Pressure envelope', '72 psig operating (OCP MGX)'],
      ['Flow', '~2–2.5× GB200'],
    ],
    sources: [SA],
  },
  vrRackFrame: {
    tag: 'Structure', name: 'Oberon 48U Rack Enclosure',
    blurb: 'The second-generation Oberon enclosure keeps GB200’s 48U footprint and blind-mate architecture but is reinforced for roughly twice the power, weight, and coolant flow. Only one SKU exists this generation — no NVL36×2 split for lower-density sites.',
    specs: [
      ['Format', '48U Oberon, single SKU'],
      ['Elevation', '18 compute + 9 switch + 4 power'],
      ['Extras', '2 stiffener bays, drip tray'],
    ],
    sources: [SA],
  },

  /* ============================== TRAY LEVEL ============================== */
  vrTrayChassis: {
    tag: 'Structure', name: 'Fanless 1U Tray Chassis',
    blurb: 'No fans, no internal cables. The chassis is split by a vertical PCB midplane: two Strata modules blind-mate behind it, and guided metal bays in front land the Orchid, BlueField-4, power and management modules onto Paladin HD2 connectors and MQD coolant couplings in one motion.',
    specs: [
      ['Height', '1U (44.45 mm)'],
      ['Cooling', '100% liquid — zero fans'],
      ['Assembly', '~5 min (vs ~2 h for GB200)'],
      ['Module mating', 'Blind-mate, guided loading'],
    ],
    sources: [SA],
  },
  vrStrata: {
    tag: 'Compute', name: 'Strata Module',
    blurb: 'The successor to Bianca: two Rubin GPUs and one Vera CPU with eight socketed SOCAMM memory modules, fed 50 V directly and covered by a single full-board cold plate fitted at board assembly, not rack assembly. Each tray carries two. Click through to see the bare board.',
    specs: [
      ['Per tray', '2 modules'],
      ['Silicon', '2× Rubin + 1× Vera'],
      ['Memory', '8× SOCAMM (1.0–1.5 TB LPDDR5X)'],
      ['Power', '50 V in, ~4,800 W per module'],
      ['Cold plate', 'Single module, gold-plated GPU contact'],
    ],
    sources: [SA],
    drill: 'vrBoard', drillLabel: 'Inspect Strata module →',
  },
  vrMidplane: {
    tag: 'Structure', name: 'PCB Midplane',
    blurb: 'The component that made the tray cableless. A vertical board across the middle of the chassis bridges PCIe Gen6 between the Strata modules and every front module through Paladin HD2 connectors on both faces. Driving Gen6 over ~500 mm of PCB required quartz-class glass cloth and HVLP4 copper.',
    specs: [
      ['Role', 'PCIe Gen6 bridge, rear ↔ front'],
      ['Connectors', 'Paladin HD2, both faces'],
      ['Materials', 'M8/M9 CCL, quartz-class glass'],
      ['Replaces', 'All internal flyover cables'],
    ],
    sources: [SA],
  },
  vrOrchid: {
    tag: 'Networking', name: 'Orchid Module',
    blurb: 'A slim, long networking module — four per tray, stacked in pairs at the front left and right. Each carries two ConnectX-9 NICs, two 800G OSFP cages and one E1.S drive, with PCIe Gen6 travelling the board’s length from the midplane connector to the front I/O.',
    specs: [
      ['Per tray', '4 modules (2 stacked pairs)'],
      ['NICs', '2× ConnectX-9 (800G each)'],
      ['Front I/O', '2× 800G OSFP cages'],
      ['Storage', '1× E1.S NVMe (CX-9 managed)'],
      ['Board', 'Quartz-cloth PCB for long Gen6 run'],
    ],
    sources: [SA],
  },
  vrCx9: {
    tag: 'Networking', name: 'ConnectX-9 NIC (800G)',
    blurb: 'Eight CX-9 NICs per tray give every Rubin GPU 1.6 Tb/s of scale-out bandwidth — double GB300. Each 800G NIC has a 48-lane PCIe Gen6 switch and reaches the GPU through Vera, since Rubin returns to the GB200-style path rather than GB300’s NIC-direct.',
    specs: [
      ['Per tray', '8× ConnectX-9'],
      ['Speed', '800G (4× 200G PAM4)'],
      ['Per GPU', '1.6 Tb/s scale-out'],
      ['PCIe', 'Gen6, 48-lane switch on chip'],
      ['Path', 'GPU ↔ C2C ↔ Vera ↔ PCIe6 ↔ CX-9'],
    ],
    sources: [SA],
  },
  vrBluefield: {
    tag: 'Networking', name: 'BlueField-4 Module',
    blurb: 'The front-center module: a DPU made of a full Grace CPU die co-packaged with a ConnectX-9, plus 128 GB LPDDR5X, an E1.S SSD and an AST2600 BMC. It fronts 800 Gb/s of north-south networking and can manage all eight backend CX-9s (“Astra”). Hyperscalers typically swap this module for in-house designs.',
    specs: [
      ['Silicon', 'Grace die + CX-9 die'],
      ['Memory', '128 GB LPDDR5X'],
      ['Storage', '512 GB pluggable SSD'],
      ['Frontend', '800 Gb/s (2× 400G)'],
      ['BMC', 'Aspeed AST2600 on module'],
    ],
    sources: [SA],
  },
  vrPdm: {
    tag: 'Power', name: 'Power Delivery Module',
    blurb: 'Front-of-chassis power conversion. The internal busbar brings 50 V under the midplane to this module, which steps it down to 12 V and fans it out to the Orchid, BlueField-4 and management modules over short internal busbars. One of only three tray components customers may customize.',
    specs: [
      ['Input', '50 V DC via internal busbar'],
      ['Output', '12 V DC to front modules'],
      ['Position', 'Above the BlueField-4 module'],
      ['Customizable', 'Yes (with mgmt + BF-4)'],
    ],
    sources: [SA],
  },
  vrSmm: {
    tag: 'Management', name: 'Management Modules (SMM · TPM · DC-SCM)',
    blurb: 'A slim column between the BlueField-4 and right Orchid bay stacks the tray’s security and management functions: system management module, trusted platform module and datacenter secure control module. Hyperscalers routinely replace these with in-house designs in the same form factor.',
    specs: [
      ['Modules', 'SMM + TPM + DC-SCM'],
      ['Role', 'Tray management & security'],
      ['Form factor', 'Fixed by NVIDIA reference'],
      ['Customizable', 'Yes'],
    ],
    sources: [SA],
  },
  vrTrayManifold: {
    tag: 'Cooling', name: 'Internal Manifold & MQDs',
    blurb: 'Coolant enters through a UQD at the rear left, feeds an internal manifold along the chassis centre, and returns out the rear right. Every module carries its own cold plate that blind-mates to the manifold through MQDs — a compact quick-disconnect standard NVIDIA specified for inside the tray.',
    specs: [
      ['Inlet / outlet', 'Rear-left UQD in, rear-right out'],
      ['Distribution', 'Central internal manifold'],
      ['Couplings', 'MQD compact quick-disconnects'],
      ['Cold plates', 'Fitted per module at L6 assembly'],
    ],
    sources: [SA],
  },
  vrTrayNvlink: {
    tag: 'Interconnect', name: 'NVLink 6 Backplane Connectors',
    blurb: 'The same Paladin HD2 backplane connector set as GB200/GB300, identically placed at the rear of each Strata module — but each differential pair now carries 448G bidirectional, doubling every GPU’s fabric bandwidth to 3.6 TB/s without touching the copper.',
    specs: [
      ['Per GPU', '3.6 TB/s NVLink 6'],
      ['Connectors', 'Paladin HD2, same layout as GB200'],
      ['Mating', 'Blind-mate to cable backplane'],
    ],
    sources: [SA],
  },
  vrTrayBusbar: {
    tag: 'Power', name: 'Busbar Clip & Internal Busbars',
    blurb: '50 V enters through the rear busbar clip and travels by internal busbar cable to three destinations: directly onto each Strata module — which converts its own 50 V, unlike Bianca’s 12 V feed — and under the midplane to the front power delivery module. ~9.6 kW+ flows through here per tray.',
    specs: [
      ['Input', '50 V DC from rack busbar'],
      ['Strata feed', 'Direct 50 V (Bianca took 12 V)'],
      ['Why 50 V', '96 A at 50 V ≈ 17× less loss than 400 A at 12 V'],
    ],
    sources: [SA],
  },
  vrNvme: {
    tag: 'Storage', name: 'E1.S NVMe Storage',
    blurb: 'Local NVMe moved house this generation: each Orchid module carries one E1.S drive managed by its ConnectX-9 rather than by the DPU as in Grace Blackwell, plus one more on the BlueField-4 module.',
    specs: [
      ['Per tray', '4× E1.S on Orchids + 1 on BF-4'],
      ['Managed by', 'ConnectX-9 (was BlueField-3)'],
      ['Serviceability', 'Front hot-swap'],
    ],
    sources: [SA],
  },

  /* ========================= STRATA (BOARD) LEVEL ========================= */
  vrStrataBoard: {
    tag: 'Structure', name: 'Strata Board PCB',
    blurb: 'Bigger than Bianca and built from upgraded materials: M8/M9-class CCL with HVLP4 ultra-smooth copper foil, extra dedicated power layers for the ~4,800 W flowing through the board, and every cable connector of the Bianca era deleted in favour of board-to-board connectors.',
    specs: [
      ['Materials', 'M8/M9 CCL, HVLP4 copper'],
      ['Power', '~4,800 W through-board'],
      ['Layers', 'Added dedicated power layers'],
      ['Cables', 'None — all board-to-board'],
    ],
    sources: [SA],
  },
  vrRubin: {
    tag: 'GPU', name: 'Rubin GPU',
    blurb: 'Two 3nm reticle-sized compute dies with I/O disaggregated into chiplets, eight HBM4 stacks, and 336 billion transistors. 35 PFLOPS of dense FP4 — 3.5× GB200 — or up to an effective 50 PFLOPS with the third-generation Transformer Engine’s adaptive sparsity compression.',
    specs: [
      ['Transistors', '336 billion (3nm)'],
      ['FP4 dense | inference', '35 | up to 50 PFLOPS'],
      ['Memory', '288 GB HBM4 @ 22 TB/s'],
      ['SMs / clock', '224 SMs @ 2.38 GHz'],
      ['NVLink 6', '3.6 TB/s per GPU'],
      ['TDP', '2,300 W Max-P / 1,800 W Max-Q'],
    ],
    sources: [NV, SA],
    drill: 'vrChip', drillLabel: 'Inspect Rubin GPU →',
  },
  vrVeraCpu: {
    tag: 'CPU', name: 'Vera CPU',
    blurb: 'NVIDIA’s custom Arm silicon returns: 88 “Olympus” cores (91 printed for yield) with SMT for 176 threads on a 3nm reticle-sized die, memory controllers and I/O split into chiplets. Roughly double Grace’s performance, with 1.8 TB/s NVLink-C2C to its pair of Rubins.',
    specs: [
      ['Cores', '88× Olympus (176 threads)'],
      ['Transistors', '227 billion (2.2× Grace)'],
      ['L3 cache', '162 MB'],
      ['Memory', 'Up to 1.5 TB SOCAMM, ~1.2 TB/s'],
      ['NVLink-C2C', '1.8 TB/s (2× Grace)'],
      ['I/O', 'PCIe Gen6, CXL 3.1'],
    ],
    sources: [NV, SA],
    drill: 'vrVera', drillLabel: 'Inspect Vera package →',
  },
  vrSocamm: {
    tag: 'Memory', name: 'SOCAMM Memory Modules',
    blurb: 'Vera’s LPDDR5X is socketed, not soldered: eight SOCAMM modules flank the CPU, four per side. Modules come in 192 GB and 128 GB capacities for 1.0–1.5 TB per socket, and NVIDIA procures the memory directly — hedging DRAM prices for its customers.',
    specs: [
      ['Per Vera', '8 SOCAMM sockets'],
      ['Module sizes', '192 GB / 128 GB'],
      ['Capacity', '1,024–1,536 GB per CPU'],
      ['Bus', '1024-bit @ 9,600 MT/s'],
      ['Bandwidth', '~1.2 TB/s (2.5× Grace)'],
    ],
    sources: [SA],
  },
  vrC2c: {
    tag: 'Interconnect', name: 'NVLink-C2C (1.8 TB/s)',
    blurb: 'The coherent CPU–GPU links, doubled to 1.8 TB/s per connection. They matter more than ever: Rubin’s path to its ConnectX-9 NICs runs through Vera over C2C and PCIe Gen6, and “power sloshing” dynamically shifts the shared 4,800 W budget between CPU and GPUs.',
    specs: [
      ['Bandwidth', '1.8 TB/s per link (2× GB200)'],
      ['Coherency', 'Full cache coherence'],
      ['Extra duty', 'GPU ↔ NIC traffic via Vera'],
    ],
    sources: [SA],
  },
  vrIbc: {
    tag: 'Power', name: 'IBC 50→12 V Converters',
    blurb: 'Intermediate bus converters on the Strata board step the direct 50 V feed down to 12 V before the VRMs make sub-1 V core rails. Moving the conversion onto the board is what lets Strata take 50 V directly — at 96 A instead of 400 A, resistive loss drops ~17×.',
    specs: [
      ['Input', '50 V from side power connectors'],
      ['Output', '12 V intermediate rail'],
      ['Chain', '50 V → IBC → 12 V → VRM → ~1 V'],
    ],
    sources: [SA],
  },
  vrVrm: {
    tag: 'Power', name: 'Voltage Regulator Modules',
    blurb: 'Power-stage and inductor banks hugging the Rubin and Vera packages convert the 12 V intermediate rail to sub-1 V core rails. Power sloshing shares the module budget: GPUs can pull 2,300 W each while Vera idles at ~200 W, and Vera boosts when GPU demand drops.',
    specs: [
      ['Input', '12 V intermediate rail'],
      ['Output', 'Sub-1 V core rails'],
      ['Feature', 'CPU↔GPU power sloshing'],
    ],
    sources: [SA],
  },
  vrPaladin: {
    tag: 'Interconnect', name: 'Paladin HD2 Board-to-Board Connectors',
    blurb: 'The connectors that killed the cables. Along the Strata module’s front edge, Paladin HD2 board-to-board connectors carry PCIe Gen6 into the midplane — replacing the DensiLink, MCIO and SlimSAS flyover looms that made GB200 assembly slow and fragile.',
    specs: [
      ['Signal', 'PCIe Gen6 (64G/lane)'],
      ['Replaces', 'DensiLink / MCIO / SlimSAS cables'],
      ['Vendor', 'Amphenol Paladin HD2'],
    ],
    sources: [SA],
  },
  vrStrataNvlink: {
    tag: 'Interconnect', name: 'NVLink 6 Rear Connectors',
    blurb: 'The rear edge carries the same Paladin HD2 backplane connector set as GB200/GB300 in identical positions — deliberate, so the rack backplane carries over. Each GPU’s 3.6 TB/s of NVLink 6 leaves the board here.',
    specs: [
      ['Per board', '2 GPUs × 3.6 TB/s'],
      ['Layout', 'Identical to GB200/GB300'],
      ['Mating', 'Blind-mate to copper backplane'],
    ],
    sources: [SA],
  },
  vrStrataPower: {
    tag: 'Power', name: '50 V / 12 V Power Connectors',
    blurb: 'Round 50 V power connectors on both side edges take the internal busbar feed; small 12 V connectors at the front corners serve auxiliary rails. Bianca received pre-converted 12 V — Strata pulls raw 50 V and converts on-board.',
    specs: [
      ['Side edges', '50 V busbar inputs'],
      ['Front corners', '12 V auxiliary'],
    ],
    sources: [SA],
  },

  /* ============================ RUBIN CHIP LEVEL =========================== */
  vrRubinDie: {
    tag: 'Silicon', name: 'Rubin Compute Die',
    blurb: 'Each of the two 3nm dies is printed at the reticle limit, with I/O moved off-die into chiplets to spend the area on compute: 224 SMs whose tensor cores doubled FP4/FP8 width to 32,768 FP4 MACs per clock, running at 2.38 GHz — 25% faster than Blackwell.',
    specs: [
      ['Process', 'TSMC 3nm, reticle-sized ×2'],
      ['SMs', '224 (vs 160 on Blackwell)'],
      ['Tensor width', '2× for FP4/FP8'],
      ['Clock', '2.38 GHz'],
      ['Package total', '336B transistors'],
    ],
    sources: [SA],
  },
  vrNvlink6Chiplet: {
    tag: 'Interconnect', name: 'NVLink 6 I/O Chiplet',
    blurb: 'A dedicated chiplet at one end of the package carries 36 custom 400G SerDes — the GPU’s 3.6 TB/s doorway to all 72 GPUs through the switch fabric. Disaggregating the I/O to a chiplet freed reticle area on the compute dies.',
    specs: [
      ['SerDes', '36× 400G bidirectional'],
      ['Bandwidth', '3.6 TB/s (2× Blackwell)'],
      ['Why chiplet', 'Frees compute-die area'],
    ],
    sources: [SA],
  },
  vrC2cChiplet: {
    tag: 'Interconnect', name: 'NVLink-C2C Chiplet',
    blurb: 'The chiplet at the opposite end houses the SerDes for the Vera connection, doubled to 1.8 TB/s. Every byte between Rubin and its NICs, and every access into Vera’s 1.5 TB of SOCAMM memory, crosses this link.',
    specs: [
      ['Bandwidth', '1.8 TB/s to Vera'],
      ['Coherency', 'Full cache coherence'],
    ],
    sources: [SA],
  },
  vrHbm4: {
    tag: 'Memory', name: 'HBM4 Stack',
    blurb: 'Eight HBM4 stacks deliver 288 GB — flat versus GB300 — but bandwidth jumps ~2.8× to 22 TB/s. NVIDIA pushed pin speeds to 10.8 GT/s on a doubled 2048-bit bus per stack, beyond the JEDEC baseline; early parts may ship closer to 20 TB/s.',
    specs: [
      ['Stacks', '8× HBM4'],
      ['Capacity', '288 GB per GPU'],
      ['Bandwidth', '22 TB/s target'],
      ['Bus', '2048-bit per stack @ 10.8 GT/s'],
    ],
    sources: [SA],
    drill: 'vrHbm', drillLabel: 'Explode the stack →',
  },
  vrInterposer: {
    tag: 'Packaging', name: 'CoWoS Advanced Package',
    blurb: 'TSMC CoWoS packaging stitches the two compute dies, two I/O chiplets and eight HBM4 stacks into one 336-billion-transistor package that software sees as a single GPU.',
    specs: [
      ['Technology', 'TSMC CoWoS'],
      ['Contents', '2 dies + 2 chiplets + 8 HBM4'],
    ],
    sources: [SA],
  },
  vrRubinLid: {
    tag: 'Packaging', name: 'Heat Spreader & Stiffener',
    blurb: 'New for Rubin: a two-piece heat-spreader lid plus a separate stiffener ring against warpage — Blackwell made do with a lid alone. The lid surface is electroplated gold so the liquid-metal TIM between package and cold plate can’t corrode it.',
    specs: [
      ['Lid', 'Two-piece heat spreader'],
      ['Stiffener', 'Added anti-warpage ring'],
      ['Finish', 'Electroplated gold (liquid-metal TIM)'],
      ['TDP', 'Up to 2,300 W'],
    ],
    sources: [SA],
  },

  /* ============================ VERA PACKAGE LEVEL ======================== */
  vrVeraDie: {
    tag: 'Silicon', name: 'Vera Compute Die',
    blurb: 'A 3nm reticle-sized die carrying 91 printed Olympus cores — NVIDIA’s custom Arm design returns — with 88 enabled for yield and SMT giving 176 threads. L3 grew 40% to 162 MB. The tile layout shown is an architectural illustration.',
    specs: [
      ['Cores', '91 printed, 88 enabled'],
      ['Threads', '176 (SMT)'],
      ['L3 cache', '162 MB'],
      ['Process', 'TSMC 3nm'],
    ],
    sources: [SA],
  },
  vrVeraChiplet: {
    tag: 'Memory', name: 'Memory & I/O Chiplets',
    blurb: 'Like Rubin, Vera disaggregates: memory controllers and I/O leave the compute die for flanking chiplets driving the 1024-bit SOCAMM bus at 9,600 MT/s (~1.2 TB/s) plus PCIe Gen6 and CXL 3.1 — including the six Gen6 x16 root ports feeding the tray’s NICs.',
    specs: [
      ['Memory bus', '1024-bit @ 9,600 MT/s'],
      ['Bandwidth', '~1.2 TB/s'],
      ['I/O', 'PCIe Gen6 ×16 RPs, CXL 3.1'],
    ],
    sources: [SA],
  },
  vrVeraC2cPhy: {
    tag: 'Interconnect', name: 'NVLink-C2C PHY',
    blurb: 'The die edge that talks to the GPUs: 1.8 TB/s of coherent bandwidth to each attached Rubin, double Grace’s. It carries memory coherency, GPU-to-NIC traffic, and the telemetry behind CPU↔GPU power sloshing.',
    specs: [
      ['Bandwidth', '1.8 TB/s per GPU link'],
      ['Coherency', 'Full cache coherence'],
    ],
    sources: [SA],
  },

  /* ========================== NVSWITCH 6 LEVELS =========================== */
  vrSwitchChassis: {
    tag: 'Structure', name: 'Switch Tray Chassis (1U)',
    blurb: 'Four NVLink 6 ASICs share one liquid-cooled 1U tray — and for the first time, an NVLink switch tray with no flyover cables for NVLink: every fabric signal runs over the 32-layer PCB. The single flyover left connects the SMM host module.',
    specs: [
      ['Height', '1U'],
      ['ASICs', '4× NVLink 6 switch'],
      ['NVLink routing', '100% over PCB'],
      ['Flyover cables', 'Only tray ↔ SMM'],
    ],
    sources: [SA],
  },
  vrNvswitchPkg: {
    tag: 'Interconnect', name: 'NVLink 6 Switch ASIC',
    blurb: 'Same 28.8 Tb/s as NVLink 5, halved port count at doubled 400G rates — which keeps the design monolithic. Four per tray double the rack’s switch silicon to 36 chips, delivering the doubled 260 TB/s fabric. SHARP provides 3.6 TFLOPS of in-network compute per ASIC.',
    specs: [
      ['Bandwidth', '28.8 Tb/s per ASIC'],
      ['SerDes', '400G bidirectional'],
      ['Per rack', '36 ASICs (2× GB200)'],
      ['SHARP', '3.6 TFLOPS in-network'],
    ],
    sources: [SA],
    drill: 'vrNvswitch', drillLabel: 'Inspect switch silicon →',
  },
  vrSwColdplate: {
    tag: 'Cooling', name: 'Switch Board Cold Plate',
    blurb: 'One cold-plate module covers the whole liquid-cooled switch board — all four ASICs and their power stages — mating to the rack manifolds through rear quick-disconnects.',
    specs: [
      ['Coverage', 'Full board, single module'],
      ['Cooling', 'Direct liquid'],
    ],
    sources: [SA],
  },
  vrSwBackplane: {
    tag: 'Interconnect', name: 'NVLink 6 Backplane Connectors',
    blurb: 'The rear connector field is pin-identical to Grace Blackwell — same connector count, same 72 differential pairs per connector — but each pair now runs 448G bidirectionally, so the same copper carries twice the fabric.',
    specs: [
      ['Per connector', '72 differential pairs'],
      ['Per pair', '448G bidirectional'],
      ['Layout', 'Carried over from GB200'],
    ],
    sources: [SA],
  },
  vrSwSmm: {
    tag: 'Management', name: 'System Management Module',
    blurb: 'A small CPU module that acts as the switch tray’s host. Its PCIe connection is the one place slow enough that a flyover cable survives — the only such cable in the entire VR NVL72 rack.',
    specs: [
      ['Role', 'Switch tray host + BMC'],
      ['Link', 'PCIe over the rack’s last flyover'],
    ],
    sources: [SA],
  },
  vrSwPcb: {
    tag: 'Structure', name: '32-Layer Switch Board',
    blurb: 'Bidirectional signaling tolerates very little insertion loss, so the switch board jumps to 32 layers of M8+ CCL with LDK2 or quartz-class glass cloth — some of the most exotic PCB material in the rack — to carry every NVLink lane between the Paladin connectors and the four ASICs.',
    specs: [
      ['Layers', '32'],
      ['Materials', 'M8+ CCL, LDK2/quartz-class glass'],
      ['Carries', 'All NVLink 6 lanes, no cables'],
    ],
    sources: [SA],
  },
  vrNvswitchDie: {
    tag: 'Silicon', name: 'NVLink 6 Switch Die',
    blurb: 'Still monolithic: halving the port count while doubling per-port speed kept the 28.8 Tb/s switch on a single die. The familiar floorplan remains — SerDes bands on two sides, crossbar in the middle — now with 3.6 TFLOPS of SHARP in-network compute.',
    specs: [
      ['Design', 'Monolithic die'],
      ['Bandwidth', '28.8 Tb/s'],
      ['SHARP', '3.6 TFLOPS'],
    ],
    sources: [SA],
  },
  vrNvswitchPhy: {
    tag: 'Interconnect', name: '400G Bidirectional SerDes',
    blurb: 'The edge PHYs transmit and receive simultaneously on the same differential pair, using precisely calibrated echo cancellation to subtract the local transmit signal at each receiver. Proven at die-to-die millimetres, NVIDIA stretched it past a metre of backplane copper.',
    specs: [
      ['Per lane', '448G bidirectional'],
      ['Technique', 'Hybrid + echo cancellation'],
      ['Reach', '1 m+ over copper backplane'],
    ],
    sources: [SA],
  },

  /* ============================= HBM4 STACK LEVEL ========================= */
  vrHbmDram: {
    tag: 'Memory', name: 'DRAM Die (Illustrative ×12)',
    blurb: 'Each floating layer is a thinned DRAM die; twelve-high is this scene’s illustration for a 36 GB HBM4 stack. Hitting NVIDIA’s 10.8 GT/s pin-speed ask has strained every DRAM vendor — early Rubin parts may run closer to 20 TB/s than the 22 TB/s target.',
    specs: [
      ['Illustrated stack', '12 DRAM layers + base die'],
      ['Per stack', '36 GB (288 GB across 8)'],
      ['Pin speed', '10.8 GT/s (beyond JEDEC base)'],
    ],
    sources: [SA],
  },
  vrHbmBase: {
    tag: 'Silicon', name: 'Base Logic Die',
    blurb: 'HBM4 doubles the bus out of the base die to 2048 bits per stack — the big lever behind the 2.8× bandwidth jump. The base die translates GPU requests into DRAM commands for the tower above and drives that wide interface into the interposer.',
    specs: [
      ['Interface', '2048-bit (2× HBM3e)'],
      ['Role', 'PHY, control, repair logic'],
    ],
    sources: [SA],
  },
};
