# n8n — optional glue (the worker is the real engine)

The pipeline lives in `worker/` (code-first, unit-tested, stdlib-only). n8n is
**optional** and only useful as notification/approval glue:

## What to use instead of the old OpenWrite nodes

The old workflows referenced the openwrite.ai service, which we replaced with:

| Before (n8n node) | Now |
|---|---|
| OpenWrite create/publish HTTP nodes | `worker/stages/publish.py` adapters (dev.to, Medium, Hashnode, Ghost) |
| n8n LLM node | `worker/stages/write.py` — any OpenAI-compatible endpoint, serial + retried |
| n8n IF error routing | `worker/stages/checks.py` gate + status summary dict |
| n8n database nodes | `supabase/schema.sql` + `worker/supabase.py` (thin REST client) |

## The one workflow worth keeping

Import `bloggy-approval-glue.json`: it exposes a webhook n8n can receive drafts
on and forwards them to your Telegram with the approve link. Point the worker's
Telegram notify at your bot and you're done — or skip n8n entirely and just run
the worker's `serve-approve` endpoint.

## Setup (if you want webhook glue)

1. n8n → Credentials → Telegram bot (from `TELEGRAM_BOT_TOKEN`)
2. Import the workflow, set the Telegram credential
3. Activate; POST drafts to `http://localhost:5678/webhook/bloggy/draft`
   (replace localhost with your n8n host)
4. Set `TELEGRAM_BOT_TOKEN`/`TELEGRAM_CHAT_ID` in n8n env or the credential

The worker never depends on n8n. n8n just rings the bell.