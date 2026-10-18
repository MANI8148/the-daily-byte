---
title: Arekejoker/qwen21-nsfw-pose-skill adds 136 poses and NSFW LoRA to Qwen
kicker: AI
description: "Explore the GitHub repo that bundles prompt formulas, NSFW LoRA weights, and a VNCCS doll pose library for Qwen‑Image 2.1 image generation."
slug: arekejoker-qwen21-nsfw-pose-skill
date: 2026-10-18
author: The Daily Byte
tags: ["ai", "ml", "tutorial"]
model: llama-3.3-70b-versatile
image_url: "/images/2026-10-18/arekejoker-qwen21-nsfw-pose-skill.jpg"
---

Arekejoker/qwen21-nsfw-pose-skill has quickly gained attention on GitHub, earning ★2,704 stars and 521 forks since its release. The repository packages a “skill” for the Qwen‑Image 2.1 model that combines expert‑level prompt recipes, an NSFW‑focused LoRA adapter, and a pose library built around the VNCCS doll with 136 distinct configurations. It is marketed as usable directly inside Claude Code, Codex, Cursor, or OpenClaw environments.

## What the repo offers  

The README describes three main assets:  

1. **Prompt formulas** – a collection of text templates that the author claims produce higher‑quality results when fed to Qwen‑Image 2.1.  
2. **NSFW LoRA** – a low‑rank adaptation file trained to enable NSFW‑style generation while preserving the base model’s capabilities.  
3. **VNCCS pose library** – 136 pose definitions for a virtual doll, allowing users to steer the composition of generated images toward specific body orientations.

These assets are stored in the repository as plain‑text prompt files, a `.safetensors` LoRA weight file, and a JSON‑style pose index.

## Core components explained  

### Prompt formulas  
The prompt folder contains `.txt` files each labelled with a use case (e.g., `portrait_base.txt`, `scene_fantasy.txt`). According to the repo, each template inserts placeholder tokens for subject, lighting, and style, which the user fills in before sending the final string to the model. The author notes that these formulas were iterated on through personal experimentation and are offered as a starting point rather than a guarantee.

### NSFW LoRA  
The file `nsfw_lora.safetensors` sits in the `lora/` directory. LoRA adapters modify the model’s attention layers with a small set of trainable matrices, enabling style shifts without full retraining. The repo states the adapter was trained on a curated NSFW dataset to “reduce artefacts and improve coherence” when generating adult‑oriented imagery. No details about dataset size or training epochs are provided.

### VNCCS pose library  
Under `poses/` lies `vnccs_poses.json`, an array of 136 objects. Each object includes a `name` (e.g., “standing_side”, “kneeling_front”) and a set of joint angle values that map to the VNCCS doll’s rig. The README suggests that users can pass a pose ID to the generation pipeline to bias the model toward that configuration.

## Setting up the environment  

To try the skill locally, the repo recommends a Python 3.10+ environment with PyTorch and the `diffusers` library. The following steps are drawn directly from the installation instructions:

```bash
# Clone the repository
git clone https://github.com/Arekejoker/qwen21-nsfw-pose-skill.git
cd qwen21-nsfw-pose-skill

# Create a virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate

# Install core dependencies
pip install torch==2.4.0 diffusers==0.30.0 transformers==4.41.0

# Verify the LoRA loads
python -c "from diffusers import StableDiffusionPipeline; \
pipe = StableDiffusionPipeline.from_pretrained('Qwen/Qwen-Image-2.1'); \
pipe.load_lora_weights('lora/nsfw_lora.safetensors'); print('LoRA loaded')"
```

The snippet confirms that the LoRA can be attached to the base Qwen‑Image 2.1 pipeline without errors.

## Using the skill with code assistants  

The repo claims compatibility with Claude Code, Codex, Cursor, and OpenClaw, which are AI‑assisted coding interfaces that can invoke shell commands or run Python snippets. A typical workflow might look like this:

1. Ask the assistant to run the installation block above.  
2. Prompt the assistant to generate a final prompt string by combining a base template (e.g., `prompts/portrait_base.txt`) with user‑provided descriptors.  
3. Instruct the assistant to call the diffusion pipeline, supplying the LoRA weights and a selected pose ID from `vnccs_poses.json`.  
4. Return the resulting image file or display it inline, depending on the assistant’s capabilities.

Because the repo does not provide a wrapper script, users must assemble these steps themselves, either manually or via the assistant’s command‑execution feature.

## Example workflow: generating a posed portrait  

Below is a concrete, reproducible example that follows the repo’s guidance. It assumes the environment from the setup step is active.

```python
import json
from diffusers import StableDiffusionPipeline
import torch

# Load base model and LoRA
pipe = StableDiffusionPipeline.from_pretrained(
    "Qwen/Qwen-Image-2.1", torch_dtype=torch.float16
).to("cuda")
pipe.load_lora_weights("lora/nsfw_lora.safetensors")

# Choose a prompt template
with open("prompts/portrait_base.txt", "r") as f:
    base_prompt = f.read().strip()
# Fill placeholders
final_prompt = base_prompt.replace("{subject}", "a young woman with silver hair")
final_prompt = final_prompt.replace("{lighting}", "soft rim light")
final_prompt = final_prompt.replace("{style}", "cinematic")

# Load pose data and pick pose #57 (e.g., "seated_twist")
with open("poses/vnccs_poses.json", "r") as f:
    poses = json.load(f)
pose = poses[57]  # zero‑based index
# For illustration, we simply append a pose description to the prompt
pose_desc = f", pose: {pose['name']}"
final_prompt += pose_desc

# Generate
image = pipe(final_prompt, num_inference_steps=30, guidance_scale=7.5).images[0]
image.save("output.png")
```

The script loads the model, applies the NSFW LoRA, constructs a prompt from a template, appends a pose label, and runs generation. Changing the index in `poses[57]` will switch to any of the other 135 poses.

## Safety and ethical considerations  

The README does not shy away from the NSFW nature of the LoRA. It advises users to:

- Verify that generated content complies with local laws and platform policies.  
- Avoid distributing non‑consensual or illegal imagery.  
- Consider watermarking or metadata tagging to indicate synthetic origins.

These points are presented as best‑practice recommendations rather than enforced controls.

## Community and contributions  

With over 2,700 stars, the project has attracted issues asking