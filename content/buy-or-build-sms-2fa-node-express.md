---
title: "Buy or Build? Polling SMS 2FA Delivery in Node/Express"
kicker: BACKEND / AUTH
description: "Learn when to buy a managed SMS 2FA service or build your own polling flow in Node/Express, with code examples and fallback strategies."
slug: buy-or-build-sms-2fa-node-express
date: 2026-08-13
author: The Daily Byte
tags: ["sms", "2fa", "nodejs", "express", "backend"]
model: -
image_url: "/images/2026-08-13/buy-or-build-sms-2fa-node-express.jpg"
---

## Intro

When you add a one‑time password to your login, you might think the job is done after you send a text. In reality, the message can bounce, delay, or never arrive. The article by Wadesterling explains how to decide between a managed service and a custom polling flow in a Node/Express app, and shows a concrete example of how to keep the user experience smooth while staying in control of delivery status.

## Why Delivery Matters

A 2FA SMS is only useful if the user receives it. If a message is delayed by a few minutes, the user may think the system is broken and abandon the flow. If it never arrives, the user is locked out. The article points out that most developers ignore delivery status until a support ticket arrives, which can cost time and reputation.

## Managed SMS 2FA: The Quick Fix

Managed providers like Twilio, Vonage, and MessageBird offer turnkey 2FA solutions. They handle carrier routing, retries, and provide a webhook for delivery status. The article notes that for a simple login flow, a managed service can be plugged in with a single API call and a webhook listener. The trade‑off is that you rely on the provider’s retry policy and cannot customize the fallback logic beyond what the provider exposes.

## Building Your Own Polling Flow

If you need tighter control, the article recommends building a polling loop in your backend. The idea is simple:

1. Send the OTP via the provider’s API.
2. Store the message ID and a timestamp in your database.
3. Periodically query the provider for delivery status.
4. Update the user record once the message is delivered or failed.

This approach lets you decide how many retries to allow, how long to wait before giving up, and what fallback channel to use.

## Handling Retries and Timeouts

The article shows a practical retry strategy: poll every 5 seconds, up to three attempts. If the status is still “queued” after the third poll, mark the message as “failed” and trigger a fallback. This keeps the user waiting time reasonable while giving the carrier a chance to deliver.

```js
// pollDelivery.js
async function pollDelivery(messageId, attempts = 0) {
  if (attempts >= 3) return 'failed';

  const status = await provider.getStatus(messageId);
  if (status === 'delivered') return 'delivered';

  await new Promise(r => setTimeout(r, 5000));
  return pollDelivery(messageId, attempts + 1);
}
```

## Fallback Channels and User Experience

When the SMS fails, the article suggests falling back to a secondary channel—email, push notification, or a voice call. The fallback logic can be as simple as:

```js
if (deliveryStatus === 'failed') {
  await sendEmail(user.email, otp);
}
```

The key is to keep the user informed: “We’re sending the code to your email because the text didn’t arrive.” This transparency reduces support calls.

## Putting It Together: Sample Express Route

Below is a condensed version of the route the article presents. It uses `axios` to call the provider, stores the message ID, and starts the polling loop.

```js
// routes/auth.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

router.post('/login', async (req, res) => {
  const { phone, email } = req.body;
  const otp = generateOtp(); // 6‑digit random

  // 1. Send SMS
  const smsRes = await axios.post('https://api.provider.com/sms', {
    to: phone,
    body: `Your code is ${otp}`
  });

  const messageId = smsRes.data.id;

  // 2. Store state
  await db.users.updateOne(
    { email },
    { $set: { otp, otpExpires: Date.now() + 5 * 60 * 1000, smsId: messageId } }
  );

  // 3. Start polling
  const status = await pollDelivery(messageId);
  if (status === 'delivered') {
    res.json({ status: 'otp_sent' });
  } else {
    // fallback
    await axios.post('https://api.provider.com/email', {
      to: email,
      body: `Your code is ${otp}`
    });
    res.json({ status: 'otp_sent_fallback' });
  }
});

module.exports = router;
```

### Try It

```bash
# Install dependencies
npm install express axios

# Run the server
node server.js
```

Send a POST to `/login` with `phone` and `email` to see the flow in action.

## When to Buy vs Build

| Scenario | Buy | Build |
|----------|-----|-------|
| **Rapid MVP** | ✔️ | ❌ |
| **High traffic, custom retry logic** | ❌ | ✔️ |
| **Multiple channels (SMS, email, push)** | ❌ | ✔️ |
| **Compliance or audit requirements** | ✔️ (if provider offers logs) | ✔️ (if you log yourself) |
| **Budget constraints** | ❌ (subscription cost) | ✔️ (one‑time dev effort) |

The article concludes that for a simple login flow, a managed service is usually sufficient. If you need to orchestrate delivery across several channels or enforce a strict retry policy, building your own polling loop gives you the flexibility you need.

## Key Takeaways

- **Delivery status is critical**: a missed SMS can lock out users.
- **Managed services are fast to deploy** but lock you into their retry logic.
- **Polling your own flow** lets you control retries, timeouts, and fallbacks.
- **Fallback channels** (email, push) keep the user in the loop when SMS fails.
- **Choose buy or build** based on traffic, channel complexity, and compliance needs.

By following the patterns in the article, you can keep your 2FA flow reliable without sacrificing user experience.