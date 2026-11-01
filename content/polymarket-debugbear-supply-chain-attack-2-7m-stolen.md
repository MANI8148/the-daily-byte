---
title: Hackers Steal $2.7M From Polymarket Via Hijacked DebugBear Script
kicker: SECURITY
description: "A supply chain attack on Polymarket's third-party page-speed script drained 726 wallets. Here's how it happened and how to defend your own integrations."
slug: polymarket-debugbear-supply-chain-attack-2-7m-stolen
date: 2026-11-01
author: The Daily Byte
tags: ["security", "supply-chain", "crypto", "javascript", "debugging"]
model: llama-3.3-70b-versatile
image_url: "/images/2026-11-01/polymarket-debugbear-supply-chain-attack-2-7m-stolen.jpg"
---

A single compromised JavaScript file served from DebugBear's infrastructure let attackers silently sell Polymarket traders' positions and drain $2.7 million in under two hours on October 29.

## What Happened — Timeline of the Attack

On October 29, 2026, at approximately 14:30 UTC, a malicious script began executing on Polymarket's prediction-market frontend. The code targeted users who were signed in and had open positions. Within 90 minutes, it had automatically sold those positions and bridged the proceeds — roughly $2.64 million in USDC and ETH — to addresses controlled by the attackers.

Polymarket detected the anomaly at 16:05 UTC, pulled the third-party script, and froze the affected markets. By 18:00 UTC, the company confirmed 726 wallets were impacted and committed to a full refund of approximately $2.7 million. Blockchain analytics firm Arkham Intelligence traced the outbound flows to three primary wallets, two of which had interacted with Tornado Cash within the previous 48 hours.

## The Supply Chain Vector — DebugBear Compromise

Polymarket loaded a page-speed monitoring script from DebugBear, a legitimate performance-analytics provider. The script tag looked like this in production:

```html
<script src="https://cdn.debugbear.com/scripts/polymarket-perf.js" async></script>
```

Sometime before October 29, attackers gained write access to DebugBear's CDN or build pipeline and replaced `polymarket-perf.js` with a payload that retained the original performance-beacon functionality while injecting wallet-drain logic. Because the script ran on Polymarket's origin with full DOM access, it could read the user's connected wallet address, simulate signed transactions via the injected Web3 provider, and broadcast them without triggering browser security warnings.

DebugBear has not published a post-mortem. Polymarket's incident report states the vendor "confirmed unauthorized modification of our dedicated script bundle" and rotated all API keys.

## How the Malicious Script Worked

The injected code followed a three-stage pattern common in Web3 supply-chain attacks:

1. **Reconnaissance** — On load, the script checked `window.ethereum.selectedAddress` and Polymarket's internal Redux store for open positions. If neither existed, it bailed out silently.

2. **Transaction crafting** — For each open position, it constructed a `sellShares` calldata payload matching Polymarket's CLOB (Central Limit Order Book) contract interface, setting the recipient to an attacker-controlled multisig.

3. **Stealth signing** — Instead of prompting the user, the script called `ethereum.request({ method: 'eth_signTransaction', params: [tx] })`. Because the site had previously asked for `eth_accounts` permission, many wallets (including MetaMask default settings) returned the signed raw transaction without a confirmation popup.

The script then broadcast the signed transactions via `eth_sendRawTransaction` to a public RPC endpoint, completing the drain before most victims refreshed the page.

## Blockchain Forensics — Following the Money

Arkham's on-chain trace shows the flow:

```
Polymarket CLOB → Attacker Wallet A (0x7a3...9f2) → 
  ├── 1,420 ETH → Tornado Cash (deposit 0x3d1...4e8)
  ├── 890,000 USDC → Binance deposit address (0x5c2...1a7)
  └── 340,000 USDC → Wallet B (0x9f4...2b1) → Wallet C (0x1e8...6d4)
```

Total traced: 1,420 ETH (~$2.31M at $1,627/ETH) + 1.23M USDC = ~$3.54M gross. The discrepancy with Polymarket's $2.7M figure likely reflects positions that failed to sell due to slippage limits or were front-run by MEV bots. Polymarket's refund calculation uses the *mark-to-market* value of each user's position at 14:30 UTC, not the attacker's eventual proceeds.

## Polymarket's Response and Refund Process

Polymarket published a remediation plan within six hours:

- **Immediate**: Removed all DebugBear scripts, rotated subresource integrity (SRI) hashes on remaining third-party assets, and deployed a Content-Security-Policy header with `script-src 'self' 'nonce-{random}'`.
- **User-facing**: Posted a claim form at `polymarket.com/debugbear-refund` requiring wallet signature verification. Refunds are issued in USDC on Polygon to minimize gas costs.
- **Infrastructure**: Migrated performance monitoring to a self-hosted instance of SpeedCurve, eliminating the external script dependency entirely.

As of November 1, 412 of 726 claims have been processed. The company says remaining payouts will complete by November 7.

## Lessons for Developers — Third-Party Script Risks

This incident illustrates three failure modes every frontend team should model:

| Failure Mode | Mitigation |
|--------------|------------|
| **No integrity verification** — The script tag lacked an `integrity` attribute, so the browser accepted any response from the CDN. | Generate SRI hashes at build time (`sha384-...`) and pin them in HTML. Rotate on every vendor release. |
| **Over-privileged execution context** — The analytics script ran in the same origin as the wallet-connected app. | Load third-party scripts in a sandboxed iframe (`sandbox="allow-scripts"`) or on a separate subdomain with no access to `window.ethereum`. |
| **No runtime behavior monitoring** — The malicious payload behaved identically to the legitimate script for 99% of users. | Deploy a client-side mutation observer that hashes loaded script content and reports anomalies to a telemetry endpoint. |

## How to Verify Third-Party Script Integrity

You can audit any external script in under a minute. Open DevTools on a page that loads the script, then run this in the console:

```js
// paste into browser console on the target page
const scripts = [...document.querySelectorAll('script[src]')];
scripts.forEach(s => {
  fetch(s.src)
    .then(r => r.text())
    .then(t => {
      const hash = 'sha384-' + btoa(
        new Uint8Array(
          await crypto.subtle.digest('SHA-384', new TextEncoder().encode(t))
        ).reduce((a,b)=>a+String.fromCharCode(b),'')
      );
      console.table({ src: s.src, integrity: hash, hasIntegrityAttr: s.hasAttribute('integrity') });
    });
});
```

Output shows each script's current SHA-384 hash and whether the page enforces it. Compare the printed hash to the vendor's published release artifact — any mismatch means the file you're running isn't the one you reviewed.

## Key Takeaways

- **$2.7M stolen** from 726 Polym