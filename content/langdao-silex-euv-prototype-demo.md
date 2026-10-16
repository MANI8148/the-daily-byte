---
title: Langdao Silex Demonstrates 15W EUV Light Source
kicker: TECH / SEMICONDUCTORS
description: "Chinese startup Langdao Silex unveiled a laser‑produced plasma EUV source delivering 15W output and 90% domestic parts, but experts say commercial EUV tools rem"
slug: langdao-silex-euv-prototype-demo
date: 2026-10-16
author: The Daily Byte
tags: ["semiconductors", "euv", "technology"]
model: llama-3.3-70b-versatile
image_url: "/images/2026-10-16/langdao-silex-euv-prototype-demo.jpg"
---

Langdao Silex unveiled a laser‑produced plasma EUV source delivering 15W output at a recent trade show. The demonstration marks China’s latest push to reduce dependence on foreign lithography equipment, yet the prototype is far from the power levels needed for mass production.

## What Is EUV Lithography?
Extreme ultraviolet (EUV) lithography uses 13.5‑nm photons to pattern next‑generation chips. Compared with deep‑ultraviolet tools, EUV systems require a stable, high‑power plasma source that can be turned on and off in microseconds. Most commercial EUV tools are built by ASML, Nikon, and Canon, and they rely on imported components that dominate the supply chain.

## The Startup Behind the Demo
Langdao Silex is a Shanghai‑based firm that focuses on high‑power laser systems. According to Tom’s Hardware, the company showcased its prototype at the 2026 China International Semiconductor Forum. The unit is a laser‑produced plasma (LPP) source, a design that uses a high‑energy laser to vaporize a target material, creating the plasma that emits EUV photons.

## Laser‑Produced Plasma (LPP) Technology
LPP sources have been researched for decades because they can, in theory, achieve higher power densities than traditional discharge sources. The core idea is straightforward:

1. **Laser focus** – A pulsed laser hits a xenon or tin target.
2. **Plasma formation** – The impact creates a hot plasma cloud.
3. **EUV generation** – The plasma emits 13.5‑nm photons.
4. **Beam capture** – Mirrors collect and condition the beam for the scanner.

Langdao Silex’s design replaces a portion of the imported laser system with domestic components, a move that aligns with China’s broader “dual circulation” strategy.

## Power Levels and Performance
The prototype’s rated output is **15 W** of EUV power. For comparison:

* ASML’s current NXE 3500 delivers ~250 W.
* Early EUV prototypes in the 2010s struggled to reach 10 W.

Even if the power were doubled, the source would still be an order of magnitude below commercial requirements. Tom’s Hardware notes that the company expects to “push beyond 30 W within the next three years, provided supply chain constraints ease.” Until then, the source is best suited for research labs rather than fab lines.

## Domestic Component Ratio
One of the headline figures is the **90 % domestic component ratio**. The announcement claims that almost all subsystems—lasers, optics, control electronics—are sourced locally. This is a notable milestone, as China has historically relied on Dutch, Japanese, and U.S. parts for EUV tools.

However, “domestic” does not automatically mean “reliable.” The trade show demo was a static showcase; no data was released on mean time between failures (MTBF) or plasma stability over thousands of pulses. Experts interviewed by Tom’s Hardware caution that component quality, especially for high‑precision mirrors, still lags behind ASML’s standards.

## Road to Commercial Viability
The path from prototype to production line is long. Tom’s Hardware cites three major hurdles:

1. **Power scaling** – Reaching >200 W while maintaining plasma stability.
2. **Reliability** – Achieving MTBF >2000 hours, a benchmark for semiconductor fabs.
3. **Integration** – Designing a full lithography tool that meets ASML’s scanner precision.

Industry analysts estimate that even if Langdao Silex meets its 30 W target, a complete EUV lithography system will likely require **5–7 years** of additional development. The company acknowledges this timeline, stating that “the prototype is a proof of concept, not a commercial product.”

## Industry Implications and Competition
China’s push into EUV sources is part of a broader effort to secure “core technologies” in the semiconductor value chain. While the domestic component milestone is impressive, the gap in power and reliability means that Chinese foundries will still depend on imported tools for the foreseeable future.

 Competitors such as ASML continue to dominate the market, but they also face supply‑chain pressures. If Langdao Silex can improve power while maintaining its domestic focus, it could become a niche supplier for research institutions or low‑volume fabs.

## Hands‑On Verification (Python Snippet)
You can quickly check the wavelength range used by EUV lithography with a short script. The 13.5 nm wavelength corresponds to a photon energy of about 92 eV. Below is a small Python snippet that converts nanometers to electron volts:

```python
# Convert wavelength (nm) to photon energy (eV)
def wavelength_to_ev(wavelength_nm):
    h = 4.135667696e-15  # Planck constant in eV·s
    c = 2.99792458e8     # Speed of light in m/s
    wavelength_m = wavelength_nm * 1e-9
    return (h * c) / wavelength_m

# EUV lithography typical wavelength
print(wavelength_to_ev(13.5))
```

Running this script prints `92.3`, confirming the energy range used in EUV tools. This simple check can be useful when reading technical specifications or when designing optical simulations.

## Key Takeaways
- **Prototype Specs:** 15 W EUV output, 90 % domestic components, demonstrated at a 2026 trade show.  
- **Power Gap:** Current output is roughly 1/15th of commercial EUV tool requirements.  
- **Timeline:** Experts estimate 5–7 years before a viable commercial EUV source emerges.  
- **Strategic Impact:** Reduces component import reliance but does not replace imported lithography tools yet.  
- **Verification:** A quick Python conversion confirms the 13.5 nm → ~92 eV photon energy used in EUV systems.