---
title: "Compression Is Prediction: How LLMs and Data Compressors Share a Goal"
kicker: AI / ML
description: "Explore how data compression and large language models both predict future symbols to reduce size, with practical examples and a hands‑on code snippet."
slug: compression-is-prediction-llms
date: 2026-08-12
image_url: https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Pleiades_large.jpg/640px-Pleiades_large.jpg
author: Manikanta
tags: ["ai", "ml", "compression", "language-models", "tutorial"]
model: -
---

A text file shrinks from 1 MB to 200 KB by predicting the next word, just like a language model does.  
The ngrok blog post *Compression is prediction* shows that the same math underlies both data compressors and LLMs.

## The Core Idea: Prediction Drives Compression

Compression algorithms and language models share a single objective: reduce redundancy by predicting what comes next.  
When a compressor sees a repeated phrase, it replaces the second occurrence with a reference to the first.  
An LLM, trained on billions of tokens, learns the probability of each token given its context and can generate the next token with high confidence.  
Both systems encode the same information more efficiently by exploiting patterns.

## Classic Compression Algorithms

*LZ77* (used in ZIP and PNG) finds repeated substrings and replaces them with a back‑reference.  
*Huffman coding* assigns shorter binary codes to frequent symbols, while *arithmetic coding* represents the entire message as a single number in a range defined by symbol probabilities.  
All three rely on a probability model of the data, which is essentially a prediction of the next symbol.

## Language Models as Predictive Encoders

Large language models are trained to maximize the likelihood of the next token.  
During inference, the model’s softmax output can be interpreted as a probability distribution over the vocabulary.  
If we treat that distribution as a source model, we can encode a token by its rank in the sorted probability list, a technique called *range coding*.  
In practice, this means a well‑trained LLM can act as a compressor: it predicts the next word, assigns it a short code, and writes that code to disk.

## Quantization and Model Compression

The ngrok post also touches on *quantization*, a form of compression that reduces the precision of model weights from 32‑bit floats to 8‑bit integers.  
Quantization shrinks the model size and speeds inference, but it also introduces a small prediction error.  
Because the error is predictable, the compressed model can still be decoded accurately, mirroring how a compressor tolerates a small loss of fidelity in lossy formats.

## Practical Example: Compressing Text with a Simple Predictor

Below is a minimal Python script that demonstrates the idea.  
It builds a unigram probability table from a sample text, encodes each word with a Huffman code, and then decodes it back.

```python
import heapq
from collections import Counter, defaultdict

# Sample text
text = "the quick brown fox jumps over the lazy dog the quick brown fox"

# Build frequency table
freq = Counter(text.split())

# Build Huffman tree
heap = [[weight, [symbol, '']] for symbol, weight in freq.items()]
heapq.heapify(heap)
while len(heap) > 1:
    lo = heapq.heappop(heap)
    hi = heapq.heappop(heap)
    for pair in lo[1:]:
        pair[1] = '0' + pair[1]
    for pair in hi[1:]:
        pair[1] = '1' + pair[1]
    heapq.heappush(heap, [lo[0] + hi[0]] + lo[1:] + hi[1:])

huffman = sorted(heapq.heappop(heap)[1:], key=lambda p: (len(p[-1]), p))

# Create encode/decode maps
enc_map = {word: code for word, code in huffman}
dec_map = {code: word for word, code in huffman}

# Encode
encoded = ''.join(enc_map[w] for w in text.split())

# Decode
decoded_words = []
code = ''
for bit in encoded:
    code += bit
    if code in dec_map:
        decoded_words.append(dec_map[code])
        code = ''
decoded = ' '.join(decoded_words)

print("Original:", text)
print("Decoded :", decoded)
print("Compression ratio:", len(encoded) / len(text.split()))
```

### Try It

1. Copy the script into a file named `huffman_demo.py`.  
2. Run `python huffman_demo.py`.  
3. Observe that the decoded text matches the original and that the encoded bitstring is shorter than the raw word list.

The script is intentionally simple; real compressors use multi‑gram models and arithmetic coding, but the principle remains the same.

## Why It Matters for Students

- **Cross‑disciplinary insight**: Understanding that prediction is the engine behind both compression and language modeling helps students see the common thread between data science, NLP, and systems engineering.  
- **Practical skills**: Implementing a Huffman encoder gives hands‑on experience with probability, data structures, and bit‑level manipulation.  
- **Career relevance**: Many industry roles—cloud storage, streaming, AI inference—rely on efficient compression. Knowing the math behind it opens doors to roles in ML infrastructure,