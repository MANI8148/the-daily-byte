---
title: Minimal Next.js Chatbot Template Powered by Vercel AI Gateway
kicker: OPEN SOURCE
description: "A quick‑start guide to the shadcn-ui/chatbot-template, a TypeScript Next.js chatbot that runs on Vercel AI Gateway. Learn how to clone, customize, and deploy in minutes."
slug: minimal-nextjs-chatbot-template
date: 2026-08-12
author: Manikanta
tags: ["ai", "ml", "tutorial"]
model: -
image_url: "/images/2026-08-12/minimal-nextjs-chatbot-template.jpg"
---

## What the Template Offers

The **shadcn-ui/chatbot-template** is a lean starter kit that lets you spin up a chatbot in under ten minutes. It ships with 494 GitHub stars and 44 forks, proving that students and hobbyists alike find it useful. The repo is written in TypeScript and bundles a clean chat UI, a serverless API route, and a minimal configuration for the Vercel AI Gateway.

## Tech Stack Overview

| Layer | Library | Purpose |
|-------|---------|---------|
| **Framework** | Next.js 13 | Server‑side rendering, API routes, and static export. |
| **AI SDK** | Vercel AI SDK | Handles streaming responses from the AI Gateway. |
| **UI Components** | shadcn/ui | Radix‑based component library for a polished look. |
| **React Hooks** | shadcn/react | Custom hooks like `useChat` to manage conversation state. |
| **Markdown Rendering** | shadcn/typeset | Converts AI output into safe, styled Markdown. |

The combination keeps the codebase small while exposing all the hooks you need to extend the bot.

## File Structure Walkthrough

```
/chatbot-template
├─ app/
│  ├─ page.tsx          // Main chat page
│  └─ layout.tsx        // Global layout
├─ components/
│  ├─ Chat.tsx          // UI component
│  └─ Message.tsx       // Individual message rendering
├─ lib/
│  └─ chat.ts           // Hook that calls the AI API
├─ pages/api/
│  └─ chat.ts           // Serverless endpoint
├─ .env.example
└─ package.json
```

* `pages/api/chat.ts` uses the Vercel AI SDK to forward the user prompt to the selected model and streams the response back to the client.
* `components/Chat.tsx` pulls in `useChat` from `shadcn/react` to manage the conversation array and renders each message with `Message.tsx`.
* `lib/chat.ts` contains a thin wrapper around the SDK, making it easy to swap providers by editing a single line.

## Customizing the AI Model

The template defaults to the OpenAI GPT‑4o model, but you can switch providers by editing the `.env` file:

```bash
# .env
OPENAI_API_KEY=sk-...
# or for Anthropic
ANTHROPIC_API_KEY=sk-...
```

In `lib/chat.ts`, change the `model` field:

```ts
const response = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages,
});
```

The SDK automatically picks up the environment variable, so no code changes are required beyond the model string.

## Deploying to Vercel

1. **Push the repo** to GitHub (or fork the original).
2. **Connect to Vercel**:  
   * Go to Vercel → New Project → Import Git Repository.  
   * Select the repo and click **Import**.
3. **Set environment variables** in the Vercel dashboard under *Settings → Environment Variables*:  
   * `OPENAI_API_KEY` (or `ANTHROPIC_API_KEY`)  
   * `VERCEL_AI_GATEWAY_URL` (defaults to `https://api.vercel.ai/v1`)
4. **Deploy**. Vercel automatically builds the Next.js app and provisions the AI Gateway behind the scenes.

Once deployed, the chat UI is live at `https://<project>.vercel.app`. The serverless API route `/api/chat` is automatically routed through the AI Gateway, giving you low‑latency, streaming responses.

## Extending the UI

The UI is built with shadcn/ui, so you can drop in any Radix component. For example, to add a dark mode toggle:

```tsx
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Chatbot</h1>
        <ThemeToggle />
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
```

Because the template uses TypeScript, you get full type safety when adding new props or state.

## Why It Matters

* **Zero boilerplate** – The repo contains only the files you need to get a chatbot running.  
* **Serverless AI** – By leveraging the Vercel AI Gateway, you avoid managing GPU instances or inference endpoints.  
* **Modular design** – Each layer (UI, hooks, API) is isolated, making it easy to swap out components or providers.  
* **Community‑driven** – With nearly 500 stars, the template is battle‑tested and frequently updated.

## Try It Yourself

```bash
# Clone the repo
git clone https://github.com/shadcn-ui/chatbot-template.git
cd chatbot-template

# Install dependencies
npm install

# Copy the example env file