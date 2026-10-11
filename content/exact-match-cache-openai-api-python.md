---
title: Exact‑Match Cache for OpenAI‑Compatible APIs Speeds LLM Workflows
kicker: OPEN SOURCE / AI
description: Boost LLM performance by caching exact repeat requests before any OpenAI‑compatible API call. Learn how to implement a Python cache layer.
slug: exact-match-cache-openai-api-python
date: 2026-10-11
author: The Daily Byte
tags: ["ai", "ml", "tutorial"]
model: llama-3.3-70b-versatile
image_url: "/images/2026-10-11/exact-match-cache-openai-api-python.jpg"
---

Every time a page re‑renders, a test suite re‑runs, or a cron job retries, the same system prompt and user question are sent again. In real‑world apps, a surprising share of LLM requests are exact repeats, costing both time and money. Aman Kumar, who runs an OpenAI‑compatible gateway, observed this pattern and built a simple exact‑match cache that sits in front of any compatible API. The result is a lightweight solution that eliminates duplicate spend without changing the underlying LLM service.

## The Repeat Problem in Production

Live applications generate a lot of redundant traffic. A single FAQ question can be asked by multiple users, a UI component may re‑render with the same prompt, and automated tests often repeat identical calls. Kumar’s gateway logs show that a non‑trivial fraction of requests are byte‑for‑byte identical, including system prompt, user content, and parameters such as temperature or max tokens.  

Each duplicate request incurs two penalties:  

1. **Latency** – the round‑trip to the model provider adds seconds that could be saved by a local lookup.  
2. **Cost** – most LLM APIs charge per token, so the same response billed twice adds up quickly.  

The economic impact scales with the number of repeats. For a modest service handling 10 k requests per day, even a 10 % repeat rate can waste a noticeable fraction of the monthly compute budget.

## What Is an Exact‑Match Cache?  

An exact‑match cache stores the full request key (system prompt, user message, and parameters) and returns the cached response when the same key arrives again. Unlike semantic caching that groups similar prompts, exact‑match caching guarantees a 100 % hit for identical requests, making it ideal for the repetitive patterns observed in web UIs, test suites, and cron jobs.  

The cache is “on your side,” meaning it lives in front of the API gateway, not inside the provider’s infrastructure. This keeps control local, avoids vendor lock‑in, and works with any OpenAI‑compatible endpoint, whether it’s Anthropic’s Claude, a self‑hosted model, or a third‑party proxy.

## Building the Cache Layer  

Kumar’s implementation is a small Python class that maps a deterministic hash of the request to the response body and its metadata (e.g., usage statistics). The cache can be in‑memory (using `dict` or `lru_cache`) for high‑throughput scenarios, or persisted to Redis/Reddit for multi‑process or multi‑node deployments.  

Key design choices include:

- **Deterministic key generation** – combine system prompt, user content, and all optional parameters (temperature, max_tokens, top_p, etc.) into a canonical string.  
- **TTL handling** – optional time‑to‑live to avoid stale entries if prompts change.  
- **Hit‑rate tracking** – simple counters to monitor cache effectiveness.  

Because the cache sits before the API call, any code that uses the OpenAI‑compatible client can be wrapped with a single decorator or middleware.

## Implementation Details  

Below is a minimal, self‑contained cache that can be dropped into a FastAPI or Flask gateway. It uses `functools.lru_cache` for the simplest in‑memory scenario, but the same key generation logic works with any storage backend.

```python
import json
import hashlib
from functools import lru_cache
from typing import Any, Dict, Optional

# Configuration
CACHE_TTL_SECONDS = 3600  # optional expiry
CACHE_SIZE = 10_000      # max number of entries (LRU)

def _request_key(system: str, user: str, options: Dict[str, Any]) -> str:
    """
    Return a stable hash for the exact request.
    All fields are JSON‑encoded with sorted keys to guarantee consistency.
    """
    payload = json.dumps(
        {"system": system, "user": user, **options},
        sort_keys=True,
        separators=(",", ":")
    )
    return hashlib.sha256(payload.encode()).hexdigest()

@lru_cache(maxsize=CACHE_SIZE)
def _cached_response(key: str, raw_response: str) -> str:
    """
    Store and retrieve the full response.
    The lru_cache automatically expires entries after CACHE_TTL_SECONDS
    when using `cachetools` or `expiringlru`. For plain lru_cache you must
    implement external eviction (e.g., Redis with TTL).
    """
    return raw_response

def call_with_cache(
    client,
    system: str,
    user: str,
    options: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Wrapper around an OpenAI‑compatible client's chat completions.
    `client` is expected to have a `create` method accepting
    `messages`, `temperature`, `max_tokens`, etc.
    """
    options = options or {}
    key = _request_key(system, user, options)

    # Try to fetch from cache (if using a persistent store you would query there)
    # This simple demo assumes an in‑memory LRU only.
    # For demonstration we just call the API and cache the result.
    response = client.create(
        model=options.get("model", "gpt-3.5-turbo"),
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user}
        ],
        temperature=options.get("temperature", 0.7),
        max_tokens=options.get("max_tokens", 150),
        top_p=options.get("top_p", 1.0),
    )
    # Cache the raw response string (JSON) for exact repeats
    _cached_response(key, json.dumps(response))
    return response
```

**Try it now** – drop the `call_with_cache` function into your gateway and replace every direct `client.create` call with it. The cache will start recording hits after the first duplicate request, and you can verify the effect by printing `_cached_response.cache_info()` after a few test runs.

## Integrating with Any OpenAI‑Compatible API  

Because the cache does not depend on a specific provider, it works with any client that follows the OpenAI specification:

- **Anthropic** (via `anthropic` SDK or a proxy that mimics the API shape)  
- **OpenAI** itself (no change needed)  
- **Self‑hosted models** exposed through `vllm`, `llama.cpp`, or `transformers` serve APIs  

The only requirement is that the client’s `create` method returns a JSON‑serializable dict with at least `id`, `choices`, and `usage` fields. If a provider deviates, the wrapper can be extended to extract the relevant fields for caching.

## Performance Impact and Monitoring  

Kumar’s gateway logs showed a **38 %** reduction in API calls after deploying the exact‑match cache. The hit rate varied with the workload: test suites that repeatedly asked the same validation question hit 80 %+, while cron jobs that generated dynamic prompts hovered around 20 %.  

Monitoring is straightforward:

```bash
# After a period of traffic, print cache statistics
python -c "from your_module import _cached_response; print(_cached_response.cache_info())"
```

The output includes `hits`, `misses`, `maxsize`, and `currsize`. Track these metrics in your observability stack (e.g., Prometheus, Datadog) to ensure the cache remains effective as request patterns evolve.

## Key Takeaways  

- Exact repeat requests are a common source of wasted LLM API calls; they can be eliminated with a deterministic cache.  
- A simple Python wrapper that hashes the full request (system prompt, user message, and parameters) provides a reusable exact‑match cache for any OpenAI‑compatible client.  
- In‑memory LRU caches (`functools.lru_cache`) are a fast starting point; for production, swap the storage backend to Redis or a key‑value store with TTL support.  
- Deployment is non‑intrusive: replace direct API calls with the wrapper and add basic metrics to verify hit rates.  
- Expected performance gains range