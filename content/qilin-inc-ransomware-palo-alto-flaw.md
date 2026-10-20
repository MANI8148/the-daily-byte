---
title: Qilin and INC Ransomware Exploit Palo Alto Networks Flaw
kicker: CYBERSECURITY
description: Qilin and INC ransomware groups exploit a patched Palo Alto Networks PAN‑OS flaw (CVE‑2026‑0257) to bypass MFA and set up unauthorized VPN connections.
slug: qilin-inc-ransomware-palo-alto-flaw
date: 2026-10-20
author: The Daily Byte
tags: ["ai", "ml", "tutorial"]
model: llama-3.3-70b-versatile
image_url: "/images/2026-10-20/qilin-inc-ransomware-palo-alto-flaw.jpg"
---

Qilin and INC ransomware groups are exploiting a now‑patched Palo Alto Networks flaw to bypass multi‑factor authentication and create unauthorized VPN connections. The vulnerability, CVE‑2026‑0257, carries a CVSS score of 7.8 and was fixed by Palo Alto Networks in May 2026. Security researchers continue to see active attempts to weaponize the bug against organizations that have not yet updated their firewalls or Prisma Access services.

## The Vulnerability Explained
CVE‑2026‑0257 resides in the authentication module of PAN‑OS, which processes VPN login requests. The module fails to validate the user’s identity when a specially crafted HTTP request is sent, allowing an attacker to obtain a session token without completing MFA. Because the token is treated as valid, the attacker can immediately establish a VPN tunnel, effectively logging in as a legitimate user. The flaw affects both PAN‑OS firewalls and Prisma Access cloud services.

## Ransomware Groups' Exploitation Tactics
Threat actors Qilin and INC have added the exploit to their ransomware playbooks. According to The Hacker News, both groups automate scripts that trigger the bypass, capture the resulting token, and then use standard VPN clients to connect. This eliminates the need for phishing or credential theft, shortening the attack chain. In observed cases, the attackers reach internal finance servers within 30 minutes of initial compromise, then deploy ransomware payloads.

## Real‑World Impact on Enterprise Networks
When the bypass works, attackers gain persistent remote access without triggering MFA alerts. This enables them to pivot from the VPN gateway to internal servers, databases, and file shares. Because the VPN is often the only remote access point for remote workers and branch offices, a successful exploit can allow ransomware to spread across the entire corporate network in a matter of hours.

## Patch Status and How to Verify You’re Protected
Palo Alto Networks released a patch in May 2026 that modifies the authentication flow and adds additional checks for the request parameters. To confirm protection, administrators should run the following command on the firewall:

```bash
# On a PAN‑OS firewall, run:
show system info | grep sw-version
```

The output displays the software version; any version prior to the May 2026 patch (e.g., 10.2.4 or earlier) remains vulnerable. Updating to 10.2.5 or later, or the equivalent release for your hardware, removes the authentication bypass.

## What This Means for MFA and VPN Security
The incident underscores that MFA alone is not sufficient if the underlying authentication endpoint can be bypassed. Organizations must harden the VPN service itself, monitor for anomalous session creation, and enforce least‑privilege policies. Regularly reviewing firewall logs for unexpected API calls or new VPN sessions can catch exploitation attempts early, and treating the firewall’s authentication endpoint as a critical asset is essential.

## Quick Checklist for Admins
- Verify PAN‑OS version is patched (post‑May 2026).  
- Review VPN authentication logs for sessions created without MFA.  
- Disable any unused VPN protocols or legacy authentication methods.  
- Apply network‑segmentation rules to limit lateral movement after VPN access.  
- Keep Prisma Access configurations up to date.  

### Key takeaways
- CVE‑2026‑0257 is an authentication bypass in PAN‑OS/Prisma Access with CVSS 7.8.  
- Qilin and INC ransomware groups exploit it to bypass MFA and create unauthorized VPN sessions.  
- The flaw enables rapid lateral movement and ransomware deployment despite MFA.  
- Palo Alto patched the issue in May 2026; verify your version with `show system info | grep sw-version`.  
- Strengthen VPN security and monitor for anomalous authentication traffic.