---
title: "Cloud in a Bottle: A New Take on the Self-Hosted Stack"
kicker: OPEN SOURCE
description: "Cloud in a Bottle by Imbue runs rootless Podman containers, 38 curated apps, and smartphone-style UX. Here's how it works and where it falls short."
slug: cloud-in-a-bottle-self-hosted-stack
date: 2026-09-18
author: The Daily Byte
tags: ["selfhosting", "docker", "devops", "networking"]
model: llama-3.3-70b-versatile
image_url: "/images/2026-09-18/cloud-in-a-bottle-self-hosted-stack.jpg"
---

Self-hosting usually looks like a weekend of Docker Compose files, reverse proxy configs, and quiet terror that one misconfigured container takes down the whole machine. Cloud in a Bottle, an open-source project from AI research lab Imbue, wants to make it feel like installing apps on a phone.

## The Setup: One Ubuntu Box as Router

Peel back the marketing and you get one concrete architecture: a single Ubuntu machine running a central router service. A tool called `openhost.service` manages the lifecycle of rootless Podman containers — "rootless" being the key word. Each app runs inside its own user namespace, so a broken container can't escalate into a broken host. That's the paper cut that platforms like YunoHost historically leave open.

Requests arrive, get inspected for domain headers, and are routed by hostname to the right container. Centralized authentication uses persistent session cookies and scoped API tokens, which produces the "smartphone feel": log in once, and every service trusts you.

## A Curated Catalog of 38 Apps

Today the project ships a catalog of 38 applications, including Nextcloud for file storage, Jellyfin for media, Forgejo for git hosting, and Vaultwarden for password management. The deliberate choice here is curation over volume. Rather than blasting thousands of untested community images, the maintainers enforce a high bar for inclusion and target apps that feel cohesive together.

The catalog is openly weighted toward Imbue's own needs — the post concedes this — but as a foundation it spares you the overhead of manual container orchestration.

## The Honest Part: Networking

The documentation is refreshingly blunt about its limits. To expose a local instance to the web, you need either an exposed port or a tunneling mechanism. The project currently recommends Cloudflare Tunnel — which only carries HTTP traffic. Anything that wants raw TCP or a non-standard port, like a Minecraft server, is effectively blocked unless you can shoehorn it into a web-based conduit.

That's a real gap between the project's ambition and its current reality.

## Bridging the Gap with SSH Tunnels

The workaround, from the post, is a reverse SSH tunnel via Pinggy, which handles raw TCP without reconfiguring your home router or wrestling with CGNAT. To expose a service on a non-standard port — say a Minecraft server on 25565 — you run:

```
ssh -p 443 -R0:localhost:25565 tcp@free.pinggy.io
```

A public endpoint pops up and forwards straight to your local service. For the primary dashboard on port 8080, the same idea applies:

```
ssh -p 443 -R0:localhost:8080 free.pinggy.io
```

No DNS delegation, no opening ports on home hardware — just a private connection in, public endpoint out. For devotees of non-HTTP services, this is the escape hatch.

## Built for AI Agents

One of the more interesting design choices is the `bottle` CLI, built with coding agents in mind. Automation scripts can deploy and manage containers without manual credential handling. Docs are served in a machine-readable format at `/docs/all.md`, which effectively invites AI assistants to help port applications and debug failures. It's a forward-looking sign that the platform expects autonomous workflows in personal infrastructure.

## The Pushback: Cloudron, Umbrel, and CapRover

The project has drawn real discussion, and a lot of it centers on the competitive field. Cloudron, Umbrel, and CapRover bring years of refinement and broader app support. Beyond alternatives, reviewers have flagged concerns about persistent storage behavior and the requirement for CoreDNS to listen on port 53. And there's the trust question: Imbue is well-funded, but it's an AI research lab first. Tying your homelab to a platform whose roadmap is driven by that lab is a decision worth making with open eyes.

## Hardening for the Long Haul

Production-grade resilience means going beyond the dashboard. The post recommends an S3-compatible backend like MinIO for reliable backup, since basic managed plans only offer simple storage. Monitoring matters too — adding Prometheus and Grafana as auxiliary services gives you per-container resource visibility. And when rootless containers fail, file system permissions are usually the culprit: check that the container's user namespace has the right UID/GID ownership over host mount points, and confirm your local firewall (UFW, for example) isn't dropping packets from the tunnel interface.

## Is It Worth Your Time?

For a tinkerer who values architectural transparency and strong security boundaries, Cloud in a Bottle is a solid weekend project — a clean, rootless container environment that feels modern and intentional. Just don't treat the networking docs as a complete solution. Pair it with a dedicated tunnel like Pinggy and the request path becomes end-to-end comprehensible: TLS termination via Caddy, routing, then container delivery. Understanding that path is exactly the skill that pays off when production goes sideways.

### Key takeaways

- Cloud in a Bottle runs rootless Podman containers via `openhost.service`, isolating each app in its own user namespace so a single compromise can't sink the host.
- It ships a curated catalog of 38 apps — Nextcloud, Jellyfin, Forgejo, Vaultwarden — chosen for cohesion rather than raw volume.
- Its networking story is still HTTP-only via Cloudflare Tunnel; raw TCP services need an external reverse SSH tunnel like Pinggy.
- The `bottle` CLI and machine-readable docs at `/docs/all.md` signal a future where AI agents manage homelab deployments.
- Compared to Cloudron, Umbrel, and CapRover, it's younger and thinner — weigh Imbue's ownership and the CoreDNS-on-port-53 requirement before migrating.