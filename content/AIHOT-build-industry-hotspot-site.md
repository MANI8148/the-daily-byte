---
title: "AIHOT: Build Your Own AI‑Powered Industry Hotspot Site"
kicker: OPEN SOURCE
description: "Learn how the AIHOT framework scrapes sources, uses LLMs to filter and score news, clusters similar events, and outputs a daily digest you can adapt to any fiel"
slug: AIHOT-build-industry-hotspot-site
date: 2026-10-03
author: The Daily Byte
tags: ["ai", "ml", "open-source", "tutorial"]
model: llama-3.3-70b-versatile
image_url: "/images/2026-10-03/AIHOT-build-industry-hotspot-site.jpg"
---

An open‑source repo lets you run a self‑maintaining hotspot website with just a few configuration changes.

## What AIHOT Is  
AIHOT is a complete website framework that automatically gathers information from user‑defined feeds, runs it through large language models for relevance scoring, groups duplicate stories into single events, ranks those events by how many sources mention them, and publishes a Chinese‑language digest each morning. The repository on GitHub (KKKKhazix/AIHOT) contains the front‑end, back‑end, selection logic, clustering algorithm, and all prompt templates used by the author’s own AI hotspot site.

## Data Collection and LLM Filtering  
The pipeline starts with a list of RSS feeds, web pages, or APIs you provide in `sources.yaml`. A scheduled job (default: every hour) pulls the latest items, strips HTML, and passes each piece to an LLM twice.  
1. **First pass** – a quick relevance filter: the model receives a prompt asking “Is this item related to the topic X?” and returns a binary score. Items below a threshold (default 0.6) are discarded.  
2. **Second pass** – a finer quality rating: the model scores the item on depth, novelty, and usefulness on a scale of 0‑1. Only items above a second threshold (default 0.7) proceed.  
These thresholds and the exact prompt text are stored in `prompts/` and can be edited to match your domain’s language.

## Event Clustering and Heat Ranking  
After filtering, AIHOT treats each remaining item as a candidate event. It embeds the title and summary using a sentence‑transformer model (default: `paraphrase-multilingual-MiniLM-L12-v2`). Items whose cosine similarity exceeds 0.8 are placed in the same cluster, meaning they discuss the same fact from different sources.  
Each cluster receives a **heat score** equal to the number of distinct sources contributing items to it. The framework then sorts clusters descending by heat, so the most widely reported story appears first. This mimics the “hot‑list” logic used by many news aggregators but lets you replace the source list with industry‑specific feeds.

## Generating the Daily Digest  
At 07:00 UTC (configurable via cron), the script renders a Markdown report:  
- A headline derived from the LLM‑generated title of the top cluster.  
- A one‑paragraph summary written by the model, calibrated to stay under 200 Chinese characters.  
- A list of source URLs for readers who want to dig deeper.  
The report is saved as `output/daily_YYYYMMDD.md` and served by a simple Flask app that routes `/` to the latest file. The UI is deliberately minimal: a header, the digest, and a navigation bar to browse past editions.

## Customizing for Your Industry  
Because the framework separates *what* you feed it from *how* it processes it, you can turn AIHOT into a legal‑tech watch, an HR‑policy tracker, or a precious‑metals market alert by editing three files:  
1. `sources.yaml` – replace the default tech blogs with the RSS feeds, newsletters, or APIs that matter to your field.  
2. `prompt/relevance.txt` and `prompt/quality.txt` – tweak the wording so the LLM understands your domain’s jargon (e.g., “Is this about a new amendment to the Securities Act?”).  
3. `config/thresholds.yaml` – adjust the relevance and quality cut‑offs if your sources are noisy or exceptionally high‑signal.  
No code changes are required; the same clustering and ranking logic works unchanged.

## Getting Started: Try It Yourself  
Below is a minimal set‑up that pulls the repo, installs dependencies, and runs a test cycle with the built‑in sample feeds.

```bash
# Clone the repository
git clone https://github.com/KKKKhazix/AIHOT.git
cd AIHOT

# Create a virtual environment (optional but recommended)
python -m venv .venv
source .venv/bin/activate

# Install Python requirements
pip install -r requirements.txt

# Run the collector once to see output
python -m app.collector   # fetches, filters, scores, clusters
# Generate a sample report
python -m app.render      # creates output/daily_<today>.md
# Start the web server to view it
flask run --host=0.0.0.0 --port=5000
```

Open `http://localhost:5000` in a browser; you should see the latest digest generated from the demo feeds. Replace `sources.yaml` with your own list, restart the collector, and the site will begin producing industry‑specific hotspots automatically.

## How It Compares to Manual Curation  
The author notes that over six months the framework reduced the time spent scouring legal, HR, finance, and precious‑metals news from several hours a day to under fifteen minutes, while surfacing stories that multiple outlets highlighted. Because the LLM scoring is reproducible and the clustering algorithm is deterministic given the same inputs, you can audit why a particular story made the cut by inspecting the logs in `logs/`.

## Limitations and Next Steps  
The repository’s README warns that the creator is not a professional developer and that the code may contain rough edges. Issues are welcome, though response times may vary. If you need support for additional languages besides Chinese, you would need to adjust the prompts and possibly swap the embedding model for a multilingual variant that matches your target tongue. The framework currently assumes a single daily digest; splitting into morning/evening editions would require modifying the cron schedule and the rendering script.

## Key takeaways
- **AIHOT automates** the full loop: fetch → LLM filter → cluster → rank → publish.  
- **Thresholds and prompts** are plain‑text files you can edit to fit any industry’s signal‑to‑noise ratio.  
- **Clustering** relies on sentence embeddings and a similarity cutoff; heat equals source count.  
- **Setup** is a standard Python pip install plus a cron‑friendly collector script.  
- **Output** is a simple Markdown digest served by a lightweight Flask app, ready for adaptation.  

By swapping in your own feeds and tuning the LLM prompts, you gain a ready‑made hotspot site without building the crawling or scoring logic from scratch.