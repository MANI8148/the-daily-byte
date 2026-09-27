---
title: Citrix NetScaler RCE Zero-Days Actively Exploited
kicker: CYBERSECURITY
description: "Two unpatched Citrix NetScaler ADC and Gateway RCE zero‑days are being exploited, with Citrix yet to issue a patch, which could let attackers run arbitrary comm"
slug: citrix-netscaler-rce-zero-days
date: 2026-09-27
author: The Daily Byte
tags: ["cybersecurity", "netscaler", "rce"]
model: llama-3.3-70b-versatile
image_url: "/images/2026-09-27/citrix-netscaler-rce-zero-days.jpg"
---

Two unpatched Citrix NetScaler ADC and Gateway zero‑day flaws are already being used to break into networks.

## What the vulnerabilities are
The Hacker News reported on September 26 that watchTowr identified two new, unpatched remote code execution (RCE) bugs in Citrix NetScaler ADC (formerly NetScaler Gateway) appliances. The vulnerabilities affect the management interface and allow an unauthenticated attacker to execute arbitrary commands with system privileges. No public advisory or patch has been released by Citrix as of the report.

## How they are being exploited
According to watchTowr, threat actors have begun weaponizing the flaws in the wild. The exploits bypass authentication and can be launched from the internet, giving attackers full control of the appliance. Security researchers have observed active scanning campaigns targeting publicly exposed NetScaler devices, and some victims have already confirmed compromise.

## Current status – Citrix response
Citrix has not confirmed the existence of the bugs nor published a fix. The company’s latest security bulletin simply states that it is “investigating” the matter. Meanwhile, some administrators have taken the precaution of powering down or isolating affected appliances rather than waiting for an official update.

## Mitigation steps administrators are taking
Many organizations are implementing network segmentation to limit exposure, blocking inbound traffic to the NetScaler management ports (typically 443 and 1680). Others are applying temporary workarounds such as disabling the vulnerable management interface or restricting access via firewall rules. While these measures reduce risk, they do not eliminate the underlying flaw.

## How to verify if your device is vulnerable
The first step is to determine the firmware version running on your appliance. If the version matches the known vulnerable releases, immediate action is required. The following command can be run through the NetScaler CLI to view the version:

```bash
# Check firmware version on a NetScaler appliance
show version
```

Compare the output against the version numbers listed in watchTowr’s advisory (not publicly disclosed). If your version is older, you should consider taking the device offline or applying any available mitigations while awaiting a patch.

## Potential impact
Remote code execution on a NetScaler appliance can lead to full system compromise. An attacker could install malware, exfiltrate data, or pivot to other devices on the network. Because the appliance sits at the edge of many corporate networks, a breach can affect dozens or hundreds of users.

## Key takeaways
- Two unpatched RCE zero‑days affect Citrix NetScaler ADC and Gateway appliances.  
- watchTowr confirmed active exploitation in the wild on September 26.  
- Citrix has not confirmed the flaws or released a patch.  
- Administrators are isolating or powering down affected devices as a stop‑gap.  
- Verify firmware version via the `show version` CLI command.  
- Network segmentation and access restrictions can reduce exposure while waiting for a fix.  

---