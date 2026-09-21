---
title: "Attention Is All You Have: Winning Back Your Screen"
kicker: IDEAS / DIGITAL LIFE
description: "Doomscroll-proof your brain and return to a deliberate web — the Tetris-effect lesson behind attention hijacking, and how blogs and RSS can win it back."
slug: attention-is-all-you-have
date: 2026-09-21
author: The Daily Byte
tags: ["attention", "algorithms", "rss", "digital-minimalism", "web"]
model: llama-3.3-70b-versatile
image_url: "/images/2026-09-21/attention-is-all-you-have.jpg"
---

Open any feed and someone else decides what you see. That is the quiet crisis Alice Girard Guittard walks through in her September 2026 essay "Attention is all you have" — a case for treating your screen time like the intentional, deliberate thing it used to be.

## The Tetris effect is real

The Tetris effect is one of psychology's easiest experiments to reproduce. Play the eponymous game a bit every day for a few weeks, and eventually you start recognizing familiar Tetromino shapes in clouds, buildings, and everyday objects. Some people even see the blocks flashing before their eyes as they fall asleep. No lab equipment needed, just repetition.

The lesson the effect teaches is blunt: whatever you focus on long enough ends up shaping your thoughts. That is how skills get learned and new ideas get discovered — but it also means the garbage you scroll shapes your brain the same way.

## Attention hijacking

The problem, as the essay frames it, is that less and less of our attention is focused intentionally. Instead of picking what to watch, we let other people decide what is "supposed to be good for us" — and their incentives rarely match ours.

Consider the examples laid out in the piece:

- **YouTube** already knows you like cooking and art streams, but it still slips in clips about the stock market bubble, global warming, and the war in Iran. Doomscrolling keeps you there longer and buys a few more ad views.
- **Spotify** playlists hand the wheel to an algorithm that mixes real songs with what the writer bluntly calls "AI slop" inserted between tracks to avoid paying royalties to real artists.
- **LinkedIn** buries genuine career news under opinions from strangers — strangers who, the writer notes, happen to be shilling whatever Microsoft is invested in at the moment.
- **Reddit** threads you trusted for product opinions might now be, in the essay's skeptical framing, "a bunch of LLMs talking to a bunch of Russian trolls."

If, like most of us, you spend the bulk of your day on your device, this is taking its toll. Letting someone else dictate what appears on your screen, the argument goes, is the same as handing them the key to your brain.

## The internet before the algorithms

It wasn't always like this. Before recommendation algorithms existed, you decided what you would do on the computer. There was no single mega-app you opened to order amusement on demand. Instead you had a few dozen bookmarks, each tied to a specific purpose: a site for video game news, a place heavy on tutorials, a blog about anime that didn't update often enough, a wiki about a 90s TV show.

That older web had plenty of awful corners — the essay calls out Encyclopedia Dramatica and Rotten.com by name. But the key difference is you had to put in the effort to visit them. Nobody was going to surface pictures of dead kids or far-right propaganda as a suggested follow-up to a pancake recipe or a cat video. The feed decided relevance; you chose the destination.

## The deliberate web is still alive

Here is the hopeful part: that intentional internet is still around. It has been buried under the corporate web, says the essay, but it isn't hard to find. If you are reading this on the blog itself, you probably already have a working idea of what it looks like — personal sites, RSS feeds, tutorials that assume you want to finish them.

The main difference between then and now is you. Returning to blogs, RSS, and long-form tutorials instead of doomscrolling shorts means getting used to a slower internet. One where content is finite. One where pages don't refresh with new dopamine hits on every click.

## Rebuild the habit

Like any habit, the only move is to keep at it. Every feed algorithm is engineered to hold your attention; fighting it is a deliberate, ongoing act. The essay's closing counsel is simple: if you pay enough attention to the slower web, something clicks in your brain eventually.

Practically, that means making the old internet a first-class citizen again. An RSS reader is the closest thing to a bookmarks bar that curates nothing — you subscribe, so you choose. Feedreader turn your news site into something you own:

```bash
# A rough sketch: pull a blog's feed and read the latest headlines
curl -s https://example.com/feed.xml | grep -oP '(?<=<title>)[^<]+' | head -10
```

Subscribing is permanent; algorithms are rented.

### Key takeaways
- Repetitive focus literally reshapes thought — the Tetris effect — so attention is a training signal, for good or ill.
- Recommendation feeds optimize for your time, not your interests: YouTube, Spotify, LinkedIn, and Reddit all get surfaced as examples in the essay.
- The pre-algorithm web was bookmark-driven and intentional; its dark corners existed but weren't recommended to you.
- That intentional web still exists in blogs, RSS, and tutorials — it's just buried under the corporate web.
- Winning it back is habit work: slow, finite content that you chose, not a feed that chose for you.

Sources: "Attention is all you have" by Alice Girard Guittard (alicegg.tech, September 21, 2026), via Hacker News. All examples and claims above come from that essay; some characterizations (Spotify "slop," Reddit bots) are the author's reported observations, not verified facts.