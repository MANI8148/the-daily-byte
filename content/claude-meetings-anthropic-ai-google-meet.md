---
title: "Claude Meetings puts Anthropic's AI inside your Google Meet calls"
kicker: AI
description: "Anthropic's Claude Meetings joins Google Meet calls and builds docs, whiteboards, and notes in real time. Here's what it does, and what's still unclear."
slug: claude-meetings-anthropic-ai-google-meet
date: 2026-11-13
author: The Daily Byte
tags: ["ai", "anthropic", "claude", "meetings", "productivity"]
model: llama-3.3-70b-versatile
---

# Claude Meetings puts Anthropic's AI inside your Google Meet calls

Anthropic is putting Claude directly into video calls: Claude Meetings joins Google Meet sessions and produces documents, whiteboards, and meeting notes while the conversation is still happening, according to a report from The Decoder.

That is a different pitch from the usual "AI notetaker." Most tools in this category record, transcribe, and email you a summary afterwards. Claude Meetings, as described, is meant to be a participant that builds artifacts live — the document and the whiteboard appear during the call, not twenty minutes after everyone has hung up.

## What the report actually says

The details in the source are narrow, and it's worth being precise about them:

- The feature is called **Claude Meetings**.
- It joins **Google Meet** sessions. No other meeting platform is named.
- It creates **documents, whiteboards, and meeting notes** in real time.

That's the whole claim. The announcement was still rolling out at the time of the report, and the source summary cuts off mid-sentence at the launch details, so questions about pricing, plan eligibility, admin controls, and region availability aren't answered there. Treat anything beyond the three bullets above as unconfirmed until Anthropic publishes the full documentation.

## "In the meeting" is the interesting part

Consider how a normal AI notetaker works today. A bot joins, listens, produces a transcript, and hands you a wall of text. You then spend ten minutes turning that wall into something a teammate who missed the call can read. The summarization is real work, but the *editing* is still yours.

A tool that writes the document during the call changes the timing. If a decision gets made at minute twelve, the notes exist at minute thirteen — while the person who disagreed is still on the call and can say "that's not what I meant." That's a meaningfully different feedback loop than reviewing a summary the next morning, when nobody remembers the nuance and nobody wants to reopen the argument.

The same logic applies to the whiteboard. Architecture discussions are the classic case: someone describes a service boundary out loud, and the diagram either gets drawn live or gets lost. If Claude Meetings can render that as a whiteboard while people are talking, the diagram becomes something the group can correct in the room.

The catch is that real-time generation is also real-time error. A wrong note written during the call can anchor the discussion, and participants may correct the AI instead of each other. Whether Anthropic handles this — say, by marking generated content as provisional or requiring confirmation — isn't something the source describes.

## Why Google Meet first

Google Meet is the obvious beachhead: it's widely deployed in schools and companies that already run on Google Workspace, and it has a large base of exactly the kind of user who needs meeting artifacts — students in group projects, teams running standups, clubs coordinating events.

It also sets up an awkward relationship. Google has its own AI features inside Meet and Docs, and Microsoft bundles Copilot into Teams. Anthropic is a model provider moving up the stack into the application layer, on top of a platform run by a competitor. That's a normal pattern in developer tools, but it means Claude Meetings' feature set is partly bounded by what Meet's APIs expose.

## The trust question nobody has answered

An assistant that both listens to your calls and writes your shared documents sits on two sensitive surfaces at once. Reasonable questions for anyone evaluating it:

- Does it join as a visible participant, or silently?
- Are recordings retained, and for how long?
- Who in the workspace can turn it on — individual users or admins only?
- Do the generated documents inherit the meeting's access permissions, or the creator's?

The Decoder's report doesn't cover these. Don't assume defaults in either direction.

## How to evaluate it without wasting a real meeting

Don't debut this on a client call. Run a controlled test first.

```text
Claude Meetings — first-run checklist

1. Use a throwaway 15-minute call with 3 people who know it's a test.
2. Deliberately include: one decision, one disagreement, one action item
   with an owner and a date.
3. During the call, check whether the notes/whiteboard appear live and
   whether participants can edit them.
4. After the call, diff the generated notes against what the three
   humans agree was decided.
5. Check who can see the created document and whiteboard (share settings).
6. Ask your Workspace admin whether the integration is enabled by default.
```

Step 4 is the one that matters. The failure mode for AI meeting tools is not bad grammar — it's confident, well-formatted notes that assign the action item to the wrong person or record a rejected proposal as a decision. Three humans and one doc is the cheapest way to measure that.

## What to watch next

Three signals will tell you whether Claude Meetings is a real product or a demo: whether it expands beyond Google Meet, whether the live artifacts are editable by participants rather than just readable, and whether Anthropic publishes concrete data-retention terms. Until then, the honest summary is that the capability is real and the details aren't public.

### Key takeaways

- Anthropic's Claude Meetings joins Google Meet calls and generates documents, whiteboards, and meeting notes in real time, per The Decoder.
- The differentiator is timing: artifacts appear during the call, not in a post-meeting summary email.
- Google Meet is the only platform named in the source; other integrations are unconfirmed.
- Pricing, availability, admin controls, and data-retention policies are not covered by the report — verify them before using it on anything sensitive.
- Test it on a throwaway call with a known decision and a known action item, then diff the AI's notes against what the humans agree happened.