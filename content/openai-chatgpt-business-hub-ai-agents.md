---
title: OpenAI Launches Business Hub to Turn ChatGPT Into a Company Directory
kicker: AI
description: "OpenAI's new Business Hub lets companies claim profiles, add product data, and deploy AI agents that answer customer questions directly in ChatGPT."
slug: openai-chatgpt-business-hub-ai-agents
date: 2026-11-11
author: The Daily Byte
tags: ["ai", "openai", "chatgpt", "business", "agents"]
model: llama-3.3-70b-versatile
image_url: "/images/2026-11-11/openai-chatgpt-business-hub-ai-agents.jpg"
---

OpenAI is turning ChatGPT into a business directory where companies can claim profiles, upload product catalogs, and deploy AI agents that answer customer questions without leaving the chat interface.

The new Business Hub, announced this week, marks OpenAI's most direct push yet into commercial search and customer service. Instead of pointing users to external websites, ChatGPT will now surface verified business profiles, product details, and automated agents that can handle inquiries about pricing, availability, and support — all within the conversation.

## What the Business Hub actually does

Business Hub gives companies a dashboard to claim their ChatGPT presence, similar to Google Business Profile or Yelp for the AI era. Once verified, businesses can:

- Upload structured product and service data (pricing, specs, availability)
- Define FAQs and policy documents that agents can reference
- Set escalation rules for when human handoff is required
- View analytics on how users discover and interact with their profile

The system uses retrieval-augmented generation (RAG) against the business's uploaded knowledge base. When a user asks "Does Acme Corp ship to Canada?" or "What's the warranty on the Model X?", the agent pulls from the company's own data rather than hallucinating from training data.

## How agents differ from standard ChatGPT

Standard ChatGPT answers from its training cutoff and web browsing. Business Hub agents operate on a constrained knowledge base: only what the company explicitly provides. This reduces hallucination risk but also means the agent cannot answer questions outside its scope — it will escalate or admit ignorance instead of improvising.

Agents also maintain conversation context within a session. A user can ask follow-ups ("What about expedited shipping?" "Can I track my order?") and the agent retains the thread, pulling relevant data at each step.

## The verification and trust layer

OpenAI says it verifies business identity before granting profile control. The process involves domain ownership checks, official documentation review, and in some cases video verification for high-risk categories (financial services, healthcare, legal).

Verified profiles display a checkmark badge in ChatGPT search results. Unverified or unverifiable businesses can still appear if they're mentioned in public sources, but they won't have agent capabilities or analytics access.

## Pricing and rollout timeline

Business Hub launches in three tiers:

| Tier | Monthly Cost | Agent Conversations | Analytics Depth |
|------|--------------|---------------------|-----------------|
| Starter | Free | 500 | Basic (impressions, clicks) |
| Growth | $299 | 10,000 | Full funnel + conversation transcripts |
| Enterprise | Custom | Unlimited | Custom integrations, SLA, dedicated support |

The free tier targets small businesses testing the waters. Growth tier adds conversation transcripts (anonymized), intent classification, and drop-off analysis. Enterprise includes API access for CRM integration, custom agent training, and contractual uptime guarantees.

Rollout begins in the U.S., U.K., Canada, and EU this month. OpenAI says broader geographic availability follows in Q1 2027.

## Implications for search and support workflows

This shift positions ChatGPT as a competitor to traditional search engines for commercial queries. Instead of "best CRM for small business" returning a list of links, ChatGPT can now surface verified vendor profiles with live agents that answer specific questions — "Does your CRM integrate with Shopify?" "What's the per-seat cost at 50 users?"

For businesses, the appeal is reducing support volume on routine inquiries. Early beta participants reported 30–40% deflection of tier-1 tickets to agents. But the trade-off is ceding the customer interaction layer to OpenAI's platform, including conversation data and user intent signals.

## What this means for developers

If you're building customer-facing tools, Business Hub introduces a new integration point. OpenAI provides an Agent API (currently waitlisted) that lets you:

- Push product updates to your profile programmatically
- Receive webhook events when users ask specific question categories
- Escalate to your own support system with full conversation context

```bash
# Example: Push a price update via the Business Hub API
curl -X PATCH https://api.openai.com/v1/business/products/sku_123 \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"price_usd": 49.99, "currency": "USD", "effective_date": "2026-11-15"}'
```

The API uses standard REST patterns with OAuth2 for business-scoped tokens. Rate limits start at 100 requests/minute per profile on Growth tier.

## Open questions and watch points

Several unknowns remain. OpenAI hasn't disclosed how agent conversations factor into model training — whether anonymized transcripts improve the base model or stay isolated. The company also hasn't clarified liability when an agent provides incorrect pricing or policy information that leads to disputes.

Competitor response is another variable. Google's Business Profile and Microsoft's Copilot for Business both offer adjacent capabilities. OpenAI's differentiator is the conversational interface and the agent's ability to reason across multiple documents in a single thread.

---

### Key takeaways

- **Business Hub turns ChatGPT into a verified business directory** with AI agents that answer from company-provided data
- **Three pricing tiers** from free (500 conversations/month) to enterprise custom plans
- **Agents use RAG on uploaded knowledge bases**, reducing hallucination but limiting scope
- **Verification required** for agent capabilities and analytics; unverified businesses appear in results without agents
- **Agent API available** for programmatic profile management and CRM integration
- **Rollout starts in US, UK, Canada, EU** with broader availability in Q1 2027
- **Open questions remain** on training data usage, liability, and competitive response