---
title: TSMC Asks Suppliers for Rare-Earth-Free Equipment as China Export Cont
kicker: SEMICONDUCTORS
description: TSMC reportedly asks equipment vendors for motors without Chinese rare-earth magnets to secure fab operations against export restrictions.
slug: tsmc-rare-earth-free-equipment-china-export-controls
date: 2026-10-22
author: The Daily Byte
tags: ["semiconductors", "supply-chain", "geopolitics", "manufacturing"]
model: llama-3.3-70b-versatile
image_url: "/images/2026-10-22/tsmc-rare-earth-free-equipment-china-export-controls.jpg"
---

TSMC has reportedly begun asking its equipment suppliers to deliver factory machinery that does not rely on rare-earth permanent magnets sourced from China.

The request, first reported by Tom's Hardware, signals the world's largest contract chipmaker is preparing for a scenario where Beijing restricts exports of critical minerals — specifically the neodymium-iron-boron (NdFeB) magnets that drive precision motors in lithography tools, wafer handlers, and vacuum systems.

## Why rare-earth magnets matter in a fab

Modern semiconductor fabs run on motion control. Stepper motors, linear actuators, and servo drives position wafers with nanometer accuracy inside ASML scanners, etch chambers, and metrology tools. The highest torque-to-weight ratio comes from NdFeB magnets, which rely on neodymium, dysprosium, and terbium — elements where China controls roughly 70% of global mining and 90% of refining capacity, according to U.S. Geological Survey data.

If Beijing restricts exports of these magnets or the refined oxides that make them, replacement lead times for custom motor windings can stretch to 18 months. A single fab line stoppage costs TSMC an estimated $500 million per week in lost revenue, based on 2023 capital-intensity disclosures.

## The supply-chain mapping exercise

TSMC's procurement team has reportedly circulated a questionnaire to its top 20 equipment vendors — including ASML, Applied Materials, Lam Research, and Tokyo Electron — asking for:

1. A bill-of-materials breakdown identifying every NdFeB magnet in each tool
2. Alternative motor designs using ferrite or samarium-cobalt magnets
3. Qualification timelines for magnet-free or reduced-magnet configurations
4. Cost and performance delta versus current designs

Samarium-cobalt (SmCo) magnets operate at higher temperatures and resist corrosion better than NdFeB, but they cost 3–5× more per kilogram and deliver 20–30% lower energy product. Ferrite magnets are cheap and abundant but lack the flux density for high-precision positioning. Both alternatives require redesigning motor stators, rewinding coils, and revalidating control-loop dynamics — a non-trivial engineering effort.

## Precedent: Japan's 2010 rare-earth crisis

This is not the first time the industry has faced magnet supply risk. In 2010, China temporarily halted rare-earth exports to Japan over a territorial dispute. Prices for neodymium oxide spiked from $40/kg to $470/kg in six months. Japanese motor makers — including Nidec and MinebeaMitsumi — accelerated SmCo adoption for hard-disk-drive actuators and later for automotive EPS systems.

TSMC's current move mirrors that playbook: qualify alternatives *before* a disruption hits, not during.

## Technical trade-offs in motor redesign

| Parameter | NdFeB (baseline) | SmCo (alternative) | Ferrite (alternative) |
|-----------|------------------|-------------------|----------------------|
| Max energy product (MGOe) | 35–52 | 16–32 | 3–5 |
| Operating temp (°C) | ≤150 | ≤350 | ≤250 |
| Corrosion resistance | Poor (needs coating) | Excellent | Excellent |
| Relative cost (per kg) | 1× | 3–5× | 0.1× |
| Supply concentration | China ~90% | China ~60% | Distributed |

For a wafer-stage motor in an EUV scanner, switching from NdFeB to SmCo could increase motor volume by 40% to maintain torque, potentially violating the tool's footprint envelope. Ferrite would require a 3–4× volume increase — likely infeasible without a full tool redesign.

## TSMC's leverage and timeline

TSMC spends ~$30–35 billion annually on capital equipment. That purchasing power lets it impose qualification requirements that smaller foundries cannot. The questionnaire reportedly asks vendors to demonstrate magnet-free prototypes by Q4 2025, with volume-ready designs by H1 2026.

Vendors that fail to comply risk losing design-wins on TSMC's 2 nm and 1.4 nm nodes, where each fab phase represents $15–20 billion in tool orders.

## Verification: how to check your own BOM

If you're a hardware engineer assessing magnet exposure in your own designs, start with a parametric search:

```bash
# Example: find all BOM lines containing NdFeB or neodymium
grep -i -E "ndfeb|neodymium|n35|n42|n52" bom.csv | cut -d',' -f1,2,4,7
```

Then cross-reference each part number against the supplier's material declaration (IPC-1752A Class D) to confirm magnet grade and country of origin for the raw oxide. Flag any single-source parts from Chinese refiners — especially Ningbo Yunsheng, JL MAG, or Zhejiang Zhongke — for immediate requalification.

## Geopolitical context: the expanding control list

China's Ministry of Commerce added gallium, germanium, and antimony to its export-control list in July 2024, requiring licenses for each shipment. Rare-earth permanent magnets were added to the "dual-use" catalog in December 2024, effective January 2025. The U.S. CHIPS Act guidance simultaneously flags NdFeB magnets as a "critical supply-chain vulnerability" for advanced packaging and fab equipment.

TSMC's request aligns with both regimes: it demonstrates due diligence to U.S. subsidy auditors while building operational resilience against Chinese licensing delays.

## What this means for the equipment ecosystem

Expect a cascade effect. If TSMC qualifies SmCo motors for its 2 nm tools, those designs become the de facto standard for Intel, Samsung, and GlobalFoundries — all of which share the same vendor base. Motor suppliers like Nidec, Yaskawa, and Parker Hannifin will amortize requalification costs across the entire industry, lowering the barrier for smaller fabs to follow.

The losers: Chinese magnet producers who lose the anchor demand that justified their scale. The winners: Australian rare-earth miner Lynas (which operates a separation plant in Malaysia and a new facility in Texas) and U.S.-based MP Materials, which is restarting heavy rare-earth separation at Mountain Pass.

### Key takeaways

- TSMC is proactively requalifying fab equipment motors to eliminate dependence on Chinese NdFeB magnets
- The request targets top 20 equipment vendors with a Q4 2025 prototype deadline
- SmCo and ferrite are the leading alternatives, each with significant cost and performance trade-offs
- 2010 rare-earth crisis provides the template: qualify early, absorb redesign cost upfront
- Motor redesign cascades through the supply chain, setting new industry standards
- Verification starts with BOM audit and IPC-1752A material declarations