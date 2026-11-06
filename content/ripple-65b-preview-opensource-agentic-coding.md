---
title: Ripple-65B Preview Hits Top Scores in Open‑Source Agentic Coding
kicker: OPEN SOURCE / AI
description: "Ricursive Intelligence's Ripple-65B Preview, a 65B‑parameter Apache 2.0 model, claims the highest open‑source U.S. benchmark scores for agentic coding tasks."
slug: ripple-65b-preview-opensource-agentic-coding
date: 2026-11-06
author: The Daily Byte
tags: ["ai", "ml", "open source", "tutorial"]
model: llama-3.3-70b-versatile
---

**Ricursive Intelligence’s Ripple‑65B Preview is now available as a fully Apache 2.0 open‑weight model, boasting 65 billion parameters and what the company says is the top score among open‑source U.S. models for agentic coding.**

---

## What Is Ripple‑65B Preview?

Ripple‑65B Preview is a language model released by Ricursive Intelligence. It is the first in a planned series of large open‑weight models that target complex reasoning and code generation. The name reflects the model’s “ripple” effect—intended to propagate improvements across downstream applications.

## Agentic Coding vs. Traditional Autocomplete

Agentic coding systems go beyond simple suggestion. They can break down a problem, plan steps, execute code, and refine output based on feedback—all within a single workflow. Early benchmarks show that models like Ripple‑65B excel at tasks such as:

* Generating full functions from natural‑language specs.  
* Fixing bugs in existing code snippets.  
* Refactoring legacy modules to meet new standards.

## Benchmark Results and Claims

According to the release announcement, Ripple‑65B Preview achieved the highest score among open‑source U.S. models on the **Agentic Coding Benchmark (ACB)**. The ACB evaluates models on three core dimensions:

1. **Problem Decomposition** – ability to split high‑level tasks into sub‑tasks.  
2. **Code Synthesis** – quality and correctness of generated code.  
3. **Iterative Improvement** – capacity to refine output after initial runs.

While exact numeric scores are not disclosed in the public summary, the claim of “top score” positions Ripple‑65B ahead of models such as LLaMA‑2‑13B and Falcon‑180B in this niche.

## Open‑Source Licensing and Availability

* **License:** Apache 2.0 – permissive reuse, commercial and non‑commercial, with no required attribution beyond the standard NOTICE file.  
* **Distribution:** Model weights and tokenizer files are hosted on Hugging Face under the repository `ricursive/ripple-65b-preview`.  
* **Accessibility:** The release includes inference scripts for PyTorch and JAX, as well as a Docker image for GPU‑accelerated deployment.

## Running Ripple‑65B Locally

Below is a minimal “try it” script that pulls the model from Hugging Face and runs a quick code‑generation prompt.

```bash
# 1️⃣ Install required packages (assuming a recent Python 3.10+ environment)
pip install huggingface_hub torch

# 2️⃣ Download the model (first time only)
huggingface-cli download ricursive/ripple-65b-preview --local-dir ./ripple-65b

# 3️⃣ Run a simple prompt
python -c "
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

repo = './ripple-65b'
tokenizer = AutoTokenizer.from_pretrained(repo)
model = AutoModelForCausalLM.from_pretrained(repo, device_map='auto')

prompt = 'Write a function that returns the n‑th prime number.'
inputs = tokenizer(prompt, return_tensors='pt')
outputs = model.generate(**inputs, max_length=200, num_beams=5)
print(tokenizer.decode(outputs[0], skip_special_tokens=True))
"
```

*The script uses the default inference settings; adjust `max_length` and `num_beams` for longer or more precise outputs.*

## Impact on Developer Toolchains

Open‑source models like Ripple‑65B Preview enable companies and individual developers to:

* **Customize AI assistance** without relying on proprietary APIs.  
* **Integrate code‑generation into CI/CD pipelines** with transparent, auditable behavior.  
* **Contribute improvements** back to the community under the same Apache 2.0 terms.

The permissive license also lowers barriers for academic research, allowing fine‑tuning on domain‑specific datasets without restrictive data‑use agreements.

## Limitations and Considerations

* **Compute demand:** 65 billion parameters require high‑end GPUs (e.g., 40 GB+ VRAM) for reasonable latency.  
* **Evaluation scope:** The ACB focuses on coding; performance on other modalities (e.g., text generation, reasoning) may vary.  
* **Safety:** The release notes mention built‑in guardrails against malicious code injection, but continuous monitoring is recommended for production use.

## Getting Involved

* **GitHub repository:** `ricursive/ripple-65b-preview` – issues, feature requests, and contributions.  
* **Community chat:** Discord channel `#ripple-discuss` for real‑time technical support.  
* **Contributing code:** Fork the inference scripts, add new prompts, or propose benchmark extensions.

---

### Key takeaways
- **65 B parameters:** The largest openly licensed U.S. language model to date.  
- **Apache 2.0 license:** Full commercial and research freedom.  
- **Top ACB score:** Claims highest performance in agentic coding among