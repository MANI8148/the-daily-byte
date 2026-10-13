---
title: "ARTEX: Open‑Source AI Penetration Testing System"
kicker: OPEN SOURCE
description: "ARTEX offers a self‑hosted AI penetration testing platform with Go backend, Next.js frontend, ScopeSentry sync, and a live demo."
slug: artex-open-source-ai-penetration-testing
date: 2026-10-13
author: The Daily Byte
tags: ["ai", "ml", "tutorial"]
model: llama-3.3-70b-versatile
image_url: "/images/2026-10-13/artex-open-source-ai-penetration-testing.jpg"
---

ARTEX, a Go‑backed AI penetration testing system, ships a self‑hosted Docker image that you can rebuild from source.

## What ARTEX Is and Why It Matters
The GitHub repository mhtsec/ARTEX is the final version backup of the project that won Baidu’s “agent+” attack‑defense challenge. It provides an autonomous penetration testing platform that combines a Go backend with a Next.js frontend, enabling fully automated scanning without manual rule creation.

## Architecture: Go Backend + Next.js Frontend
ARTEX’s backend is written in Go, handling task scheduling, vulnerability analysis, and API calls. The frontend is built with Next.js, delivering a responsive UI that runs entirely in the browser. The online demo at https://artex-demo.mhtsec.com uses mock data, so no real targets are contacted.

## Self‑Hosted Deployment: No Pre‑Compiled Images
The original Docker image autumn27/artex is defunct. The current image mianhuatang11/artex lives on Docker Hub, but pulling it can fail. The repository now maintains a pure source build that requires no external compiled dependencies. You can reconstruct the image locally with Docker Compose.

```bash
docker compose build
docker compose up
```

This command compiles the Go code and launches the Next.js UI in a single step.

## Asset Sync with ScopeSentry
ARTEX can ingest asset data directly from ScopeSentry, eliminating duplicate collection. On the “Asset Sync” page, enter the ScopeSentry URL and API key, then select the asset types you need — domains, subdomains, IPs, ports, sites, or endpoints. A single click imports the data and merges it into ARTEX’s scope, letting you start testing immediately.

## Approval Workflow and UI Details
The system records every approval globally and per‑task, with an “intercept approval” feature that pauses testing until a reviewer signs off. Approval cards appear in chat windows and can be expanded to show full details, mirroring the component design of AegisHook. This structure ensures clear audit trails for compliance and team collaboration.

## Online Demo and Hands‑On Verification
The live demo at https://artex-demo.mhtsec.com lets you explore the full UI without a backend. It simulates a penetration test using predefined mock assets, allowing you to verify the approval workflow, scope sync, and reporting features before deploying your own instance.

### Key takeaways
- ARTEX is the last version backup of a Baidu‑challenge winning AI pentest platform.  
- It uses a Go backend and Next.js frontend, with a live demo that runs on mock data.  
- The original Docker image is gone; the current mianhuatang11/artex image is maintained, but you can rebuild from source with `docker compose build && docker compose up`.  
- ScopeSentry integration lets you sync assets (domains, IPs, etc.) directly into ARTEX.  
- Global and per‑task approval records are displayed via expandable cards, similar to AegisHook.  
- The online demo provides a risk‑free way to test the UI and workflow.