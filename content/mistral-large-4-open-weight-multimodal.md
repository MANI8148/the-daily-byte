---
title: "Mistral Large 4: Open-Weight Multimodal Model"
kicker: AI
description: "Mistral Large 4 is a 49B‑parameter open‑weight multimodal model with a 1.6B vision encoder, offering fast inference at $0.14 per input token and $0.07 per outpu"
slug: mistral-large-4-open-weight-multimodal
date: 2026-10-06
author: The Daily Byte
tags: ["ai", "ml", "open-source"]
model: llama-3.3-70b-versatile
image_url: "/images/2026-10-06/mistral-large-4-open-weight-multimodal.jpg"
---

Mistral Large 4 is a state‑of‑the‑art, open‑weight multimodal model that brings 49 billion active parameters and 1.05 trillion total parameters to developers, with a 1.6 billion‑parameter vision encoder for image understanding. It builds on the success of Mistral Large 3, adding stronger vision capabilities and a more efficient routing scheme.

## What is Mistral Large 4?
Mistral Large 4 is released under a permissive license and is fully open‑weight, meaning its code and parameters can be freely inspected, modified, and redistributed. The model contains 49 billion parameters that are active during inference, while the overall parameter count reaches 1.05 trillion, giving it a massive capacity comparable to the largest closed‑source systems. It supports text and image inputs through a shared tokenizer, enabling multimodal tasks such as visual question answering and image captioning without requiring separate vision models.

## Mixture‑of‑Experts Architecture
Its architecture is based on a granular Mixture‑of‑Experts (MoE) design. Instead of a dense network, the model routes activation through a large pool of expert subnetworks, activating only the 49 billion parameters that are needed for a given token. This sparsity reduces compute cost and memory footprint while preserving the expressive power of a trillion‑parameter model. The MoE layout also allows the model to scale efficiently across multiple GPUs, a key factor in its high performance.

## Vision Encoder
The 1.6 billion‑parameter vision encoder is a separate transformer stack that processes images before they are fed into the language model. It converts image patches into token embeddings that are concatenated with text tokens, so the same decoder handles both modalities. The encoder supports images up to 1024 × 1024 resolution and can be run on the same GPU as the language model, enabling end‑to‑end multimodal inference without extra software.

## Speed, Performance, and Pricing
Performance metrics are impressive. In benchmark tests the model can generate about 2.09 million tokens per second on a single A100 GPU, indicating low latency for real‑time use. Pricing through the provider is $0.14 per input token and $0.07 per output token, with cached input costing $4.18 per million tokens. For a million‑token context, the price is $0.68, making the service cheaper than many competing closed models that charge $1‑$2 per million tokens.

## Getting Started
To try it yourself, install the Hugging Face Transformers library and load the model with a few lines of Python. The following snippet downloads the weights, prepares an image processor, and runs a text generation request:

```python
from transformers import AutoModelForCausalLM, AutoProcessor
import torch

model_id = "mistralai/Mistral-4.0"
processor = AutoProcessor.from_pretrained(model_id)
model = AutoModelForCausalLM.from_pretrained(model_id, torch_dtype=torch.float16)

# Example usage
inputs = processor(text="Describe the scene:", images=Image.open("sample.jpg"))
inputs = {k: v.to(model.device) for k, v in inputs.items()}
output = model.generate(**inputs, max_new_tokens=50)
print(processor.decode(output[0], skip_special_tokens=True))
```

The code loads the 49B checkpoint, tokenizes a prompt, encodes an image, and generates a response in under a second on a modern GPU.

## Comparison and Outlook
Compared to other open‑weight models, Mistral Large 4 offers a higher active parameter count (49 B) than Llama 3 8B and competitive performance with 70B‑scale systems, while its multimodal support and lower per‑token cost give it a clear advantage for developers building AI‑powered applications. The roadmap hints at further fine‑tuning tools and broader modality support, positioning the model as a long‑term platform for research and product development.