# Deploy the worker as an Appwrite scheduled Function

Appwrite is the backend platform in this stack (open source, BSD-3). Its
Functions product hosts the worker itself, so the "cloud machine" and the
backend live in the same place.

## Prerequisites

- Appwrite Cloud (free beta) or self-hosted Appwrite (Docker), v1.5+
- Appwrite CLI: `npm i -g appwrite-cli`

## Deploy

```bash
cd <repo root>
appwrite login
appwrite deploy function --functionId bloggy-worker --yes

# smoke-test one run (waits for execution, returns the summary JSON):
appwrite run function --functionId bloggy-worker
```

## Schedule

Appwrite console → *Functions → bloggy-worker → Settings → Schedule*, or set the
cron in `appwrite.json` (`"schedule": "0 */6 * * *"` = every 6 h) before deploy.
Function timeout: 900 s in the config — a full pipeline pass takes 1–3 min.

## Docs

- `appwrite/function/main.py` — entrypoint that calls `worker.pipeline.run_once()`
- `appwrite/appwrite.json` — CLI deploy manifest (runtime python-3.12)
- Function env vars = the same `.env` keys: `OPENAI_API_KEY`, `SUPABASE_URL`,
  `SUPABASE_SERVICE_KEY`, `DEVTO_API_KEY`, `TELEGRAM_*`…

## What Appwrite does in the wider design

- **Functions** → scheduled runner (this page)
- **Auth** → editor/admin login for the approval dashboard (protect `serve-approve` behind it)
- **Storage** → cover images / generated assets
- **Messaging + Realtime** → "new draft for review" notifications + live dashboard updates
- **Sites** → optional: host the newspaper `_site/` on Appwrite's static/SSR hosting

Supabase stays the database of record (posts, seen_links, publish_logs, pgvector).
Wiring: worker writes to Supabase via REST; Appwrite services layer on top for
identity, files, and events.