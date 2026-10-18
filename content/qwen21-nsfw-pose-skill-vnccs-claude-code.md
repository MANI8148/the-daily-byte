---
title: Qwen-Image 2.1 Pose Skill Adds 136 VNCCS Doll Controls for AI Coding A
kicker: OPEN SOURCE
description: "A trending Python repo packages prompt recipes, LoRA weights, and a 136-pose control system for Qwen-Image 2.1, ready to drop into Claude Code, Cursor, and Code"
slug: qwen21-nsfw-pose-skill-vnccs-claude-code
date: 2026-10-18
author: The Daily Byte
tags: ["ai", "ml", "open-source", "python", "image-generation"]
model: llama-3.3-70b-versatile
image_url: "/images/2026-10-18/qwen21-nsfw-pose-skill-vnccs-claude-code.jpg"
---

A Python repository that bundles author-level prompt recipes, an NSFW LoRA, and a 136-pose VNCCS doll-control system for Qwen-Image 2.1 has climbed GitHub Trending with 2,700 stars in days.

## What the repo actually is

`qwen21-nsfw-pose-skill` is a skill package — not a model — designed to plug into agentic coding environments. It ships three coordinated pieces: a curated prompt cookbook, a low-rank adaptation (LoRA) weight set, and a VNCCS (Virtual Node Character Control System) definition file that enumerates 136 named poses. The skill targets Qwen-Image 2.1, Alibaba's open-weight text-to-image model released in late 2024.

The repository's README frames the skill as "author-level prompt recipes + NSFW LoRA + 136 poses VNCCS doll control; compatible with Claude Code / Codex / Cursor / OpenClaw." That compatibility claim is the practical hook: drop the folder into an agent's skill directory and the assistant can invoke the pose dictionary by name instead of hand-crafting prompt strings every time.

## How VNCCS pose control works

VNCCS treats a character as a hierarchy of virtual nodes — root, hips, spine, shoulders, elbows, wrists, knees, ankles — each addressable by name. A pose entry is a JSON object mapping node names to rotation vectors (axis-angle or quaternion). At inference time, the skill injects the pose data into the prompt via a ControlNet-compatible conditioning pathway that Qwen-Image 2.1 supports through its multi-condition encoder.

The 136 poses cover standing, sitting, reclining, action, and interaction categories. Each pose carries a stable identifier (`vnccs_001` through `vnccs_136`) plus human-readable aliases (`"crossed_arms_standing"`, `"seated_legs_crossed"`). Agents can reference poses by ID or alias, enabling natural-language requests like "use the `arms_akimbo` pose" without the model hallucinating limb positions.

## Prompt recipe structure

The prompt cookbook is a YAML file keyed by style tags: `photorealistic`, `anime`, `oil_painting`, `cinematic_lighting`, etc. Each entry defines a base prompt template with slots for subject, pose ID, lighting, camera angle, and negative prompt. The skill's loader merges the selected recipe with the active VNCCS pose and any user-supplied modifiers before sending the composed prompt to the inference backend.

Example snippet from `recipes/photorealistic.yaml`:

```yaml
base: >
  {subject}, {pose_alias}, {lighting}, {camera_angle},
  8k uhd, dslr, sharp focus, film grain, highly detailed
negative: >
  lowres, bad anatomy, bad hands, text, error, missing fingers,
  extra digit, fewer digits, cropped, worst quality, low quality
slots:
  - subject
  - pose_alias
  - lighting
  - camera_angle
```

Agents fill slots programmatically, guaranteeing consistent structure across generations.

## LoRA integration details

The bundled LoRA (~140 MB, rank 32) targets Qwen-Image 2.1's attention layers. According to the repo, it was trained on a curated subset of the LAION-Aesthetics 6.5+ bucket filtered for pose diversity and anatomical coherence. The adapter is applied via the standard `diffusers` `load_lora_weights()` call with a configurable scale (default 0.75). No fine-tuning of the base model is required.

The README notes the LoRA is labeled "NSFW" in the repository's taxonomy, meaning it was trained on data that includes adult themes. Users who do not need that coverage can omit the LoRA load step; the VNCCS pose system and prompt recipes function independently.

## Agent integration walkthrough

For Claude Code, Cursor, or Codex, the skill installs as a directory under the agent's skill search path. On Linux/macOS:

```bash
git clone https://github.com/Arekejoker/qwen21-nsfw-pose-skill.git \
  ~/.claude/skills/qwen21-pose
# or for Cursor
git clone https://github.com/Arekejoker/qwen21-nsfw-pose-skill.git \
  ~/.cursor/skills/qwen21-pose
```

Once present, the agent's skill manifest (auto-discovered by all three tools) exposes a `qwen21_pose` tool with parameters: `prompt`, `pose_id`, `style`, `lora_scale`, `width`, `height`, `steps`, `guidance_scale`. A typical invocation from the chat interface:

```
> Use qwen21_pose to generate a photorealistic portrait,
  pose vnccs_042 (seated_legs_crossed), cinematic lighting,
  1024x1536, 30 steps, guidance 4.5, LoRA scale 0.7
```

The skill handles recipe selection, pose injection, LoRA loading, and the `diffusers` pipeline call, returning the generated image path.

## Hardware and dependency requirements

The skill assumes a CUDA environment with 12 GB VRAM minimum for FP16 inference at 1024×1024. Dependencies are pinned in `requirements.txt`:

```
torch>=2.3.0
diffusers>=0.30.0
transformers>=4.41.0
accelerate>=0.30.0
controlnet-aux>=0.0.7
pyyaml>=6.0
```

CPU fallback works but expects 3–5× slower generation. Apple Silicon (MPS) is supported via `diffusers` native backend; the repo includes a `device_map: "auto"` helper that selects CUDA, MPS, or CPU in that order.

## Licensing and redistribution

The repository carries an MIT license for code and prompt recipes. The LoRA weights and VNCCS pose definitions are released under a custom "Skill-Use" license that permits personal and commercial inference use but prohibits redistributing the weights as a standalone model package. Qwen-Image 2.1 itself remains under Alibaba's Tongyi Qianwen license (Apache-2.0 with a use-restriction addendum). Users planning commercial deployment should review both licenses.

## Community traction and forks

At 2,727 stars and 522 forks (GitHub Trending snapshot, 2026-10-13), the repo has attracted forks that add ComfyUI custom nodes, a Gradio web UI, and a Stable Diffusion WebUI extension. The most starred fork (`comfyui-qwen21-pose` @ 312 stars) wraps the skill as a node group with pose preview widgets. Issue tracker shows 18 open issues, mostly requesting additional pose packs (dance, sports, yoga) and ControlNet-union support for simultaneous pose + depth conditioning.

## Key takeaways

- **Skill, not model** — `qwen21-nsfw-pose-skill` is a drop-in package for agentic coding tools, not a new checkpoint.
- **VNCCS = 136 addressable poses** — Each pose is a named JSON rig; agents call them by ID or alias.
- **Three moving parts** — Prompt recipes (YAML), LoRA weights (~140 MB, rank 32), VNCCS