---
title: "D2R-MOBILE: Open-Source iOS/macOS Layer for Diablo II"
kicker: OPEN SOURCE
description: "Run Diablo II: Resurrected on iPhone, iPad, and Mac with full touch controls and 60 fps using D2R-MOBILE, an open‑source compatibility layer."
slug: d2r-mobile-ios-macos
date: 2026-10-16
author: The Daily Byte
tags: ["open-source", "iOS", "macOS", "gaming"]
model: llama-3.3-70b-versatile
image_url: "/images/2026-10-16/d2r-mobile-ios-macos.jpg"
---

The repo **jhaizhou-ops/d2r-mobile** gives students a ready‑made, open‑source way to play *Diablo II: Resurrected* with the Reign of the Warlock expansion on mobile devices.

## What It Is
D2R-MOBILE is an iOS and macOS compatibility layer that lets you run a Switch copy of *Diablo II: Resurrected* directly on an iPhone, iPad, or Mac. The project is hosted on GitHub under the `jhaizhou-ops/d2r-mobile` namespace and is written in C. It is free to use, and the source code is publicly accessible.

## Core Features
- **Full touch controls** – map your own control schemes for each button.
- **60 fps performance** – the game runs at a steady 60 frames per second on supported hardware.
- **New endgame modes** – the project adds modes not present in the original Switch experience.
- **Your own game files** – you supply the original game data; the layer only handles rendering and input.

These features are listed in the repo’s README and are reproduced in the project’s documentation. The touch system was built by mapping touch events to the same input layer used by the Switch version, which keeps the feel familiar for existing players.

## How It Works
The compatibility layer sits between the native iOS/macOS APIs and the *Diablo II* engine. It intercepts touch events, translates them to gamepad signals, and feeds them into the game binary. The engine runs unchanged, so no game‑specific code was modified. Because the Switch version is already built for ARM64, the same binary works on iOS and macOS after a few adjustments to the windowing and audio subsystems.

The build process uses a custom makefile that links the original game data (`*.exe` and asset files) with the iOS/macOS glue code. The resulting binary launches via an iOS app bundle or a macOS executable.

## Setup & First Run
1. Clone the repository:  
   ```bash
   git clone https://github.com/jhaizhou-ops/d2r-mobile.git
   cd d2r-mobile
   ```
2. Follow the instructions in `README.md` to fetch the game binary. You must own a legal copy of *Diablo II: Resurrected* on Switch and place the extracted files in the `game/` directory.
3. Build for your platform:  
   ```bash
   make ios   # generates an iOS app bundle
   make mac   # produces a macOS executable
   ```
4. Open the generated app on your device or Mac, grant the required permissions, and start playing. The first launch will run a small initialization script that verifies the game files and sets up touch mappings.

The README includes a step‑by‑step walk‑through, and the project’s CI pipeline runs unit tests on each pull request to ensure the input translations remain stable.

## Community & Stats
The project has gathered **3,420 stars** and **1,005 forks** on GitHub, indicating strong interest from the open‑source and gaming communities. Issues and pull requests are actively discussed in the repo’s issue tracker. The project’s maintainer, jhaizhou-ops, updates the code regularly, focusing on performance tweaks and new touch configurations.

## Try It Yourself
Open a terminal, clone the repo, and follow the steps above. If you run into a missing dependency, the `requirements.txt` lists the only external library needed for the build script.

```bash
# Verify the repository structure
ls -la d2r-mobile/
# Check for the generated binary (platform‑specific)
file build/D2R-MOBILE.app/D2R-MOBILE   # macOS
# Run on macOS
./build/D2R-MOBILE.app/Contents/MacOS/D2R-MOBILE
```

You can now launch *Diablo II: Resurrected* from your Mac or iOS simulator with native controls and 60 fps performance.

## Key Takeaways
- **Open‑source convenience** – D2R-MOBILE provides a free, community‑driven way to run a Switch game on iOS/macOS.  
- **Touch‑first design** – Full touch controls and stable 60 fps make mobile play smooth.  
- **Bring your own files** – The layer does not distribute game data; you must supply a legal copy.  
- **Active community** – 3,420 stars and 1,005 forks show ongoing support and development.  
- **Quick start** – Clone, place game files, run `make ios` or `make mac`, and launch.