---
title: "d2r-mobile Brings Diablo II: Resurrected to iOS and macOS"
kicker: OPEN SOURCE
description: "Open‑source iOS/macOS layer lets you run your Switch copy of Diablo II: Resurrected with Reign of the Warlock at 60 fps and touch controls."
slug: d2r-mobile-diablo-ii-ios-macos
date: 2026-10-18
author: The Daily Byte
tags: ["opensource", "gaming"]
model: llama-3.3-70b-versatile
image_url: "/images/2026-10-18/d2r-mobile-diablo-ii-ios-macos.jpg"
---

jhaizhou-ops/d2r-mobile lets you run Diablo II: Resurrected on iPhone, iPad, and Mac at 60 fps.

## What It Is
The repository is a C‑based compatibility layer that emulates the Nintendo Switch version of Diablo II: Resurrected on Apple platforms. It supports the Reign of the Warlock expansion and adds new endgame modes. The project is fully open source, hosted on GitHub under the jhaizhou-ops organization.

## Why It Matters
Mobile and desktop gamers can now enjoy the classic hack‑and‑slash experience without a Switch. The layer provides full touch controls, preserving the feel of the original UI while delivering stable 60 fps performance. Users simply copy their Switch game files to the device and launch the app. The project has already attracted 3,817 stars and 1,077 forks, indicating strong community interest.

## Repository Overview
The repo contains a build script, a runtime engine, and platform‑specific code for iOS and macOS. All files are documented in a concise README that explains dependencies and required system libraries.

```text
$ git clone https://github.com/jhaizhou-ops/d2r-mobile.git
$ cd d2r-mobile
$ make ios   # generates an Xcode project
$ make mac   # generates a CMake build
```

## Building for iOS
1. Install Xcode Command Line Tools and the latest version of Homebrew.  
2. Run `brew install cmake`.  
3. Open the generated Xcode workspace, select the target device, and run `Product → Build`.  
The build logs show compile times of 2–3 minutes on a 2018 MacBook Pro.

## Building for macOS
1. Ensure you have Xcode, CMake ≥3.15, and the latest Clang.  
2. Execute `mkdir build && cd build && cmake .. && make -j$(sysctl -n hw.ncpu)`.  
3. The binary `d2r-mobile` appears in the build directory and can be run directly.

## Running the Game
After building, copy the Switch ROM files (the `switch` directory from the original game) into the `data` folder of the built app. Launch the app, grant necessary permissions, and tap the on‑screen controls. The engine automatically maps touch inputs to mouse/keyboard events, preserving the original controls scheme.

## Performance and Controls
Benchmarks posted in the repo show a consistent 60 fps on an iPhone 14 Pro and a MacBook Air (M1). The touch layout includes virtual joysticks, ability shortcuts, and UI buttons that scale to 4K displays on macOS. New endgame modes such as “Infinity Quest” and “Chaos Run” are integrated into the engine’s main menu.

## Community and Contributions
The project encourages contributions via pull requests and issue reporting. Contributors can add new control schemes, improve graphics rendering, or extend support to additional Apple Silicon devices. A Discord channel and a Gitter room are referenced in the README for real‑time discussion.

## Future Outlook
The authors plan to add support for controller peripherals on iOS, higher‑resolution textures for Retina displays, and cloud save synchronization. A roadmap document outlines these features and expected release dates.

---

### Key takeaways
- **One‑click porting:** d2r-mobile lets you run Switch Diablo II: Resurrected on iPhone, iPad, and Mac without a console.  
- **Open source, well‑supported:** 3,817 stars and 1,077 forks indicate active community interest.  
- **Touch‑friendly UI:** Full touch controls and 60 fps performance on modern Apple hardware.  
- **Easy build process:** Simple `git clone` and `make` commands for both iOS and macOS.  
- **Extendable:** New endgame modes and planned controller support keep the project evolving.