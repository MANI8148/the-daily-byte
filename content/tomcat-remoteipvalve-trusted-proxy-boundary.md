---
title: Tomcat RemoteIpValve Needs a Trusted Proxy Boundary
kicker: OPEN SOURCE
description: "Why Tomcat's RemoteIpValve requires explicit trusted proxy configuration to prevent IP spoofing behind reverse proxies."
slug: tomcat-remoteipvalve-trusted-proxy-boundary
date: 2026-11-04
author: The Daily Byte
tags: ["java", "tomcat", "security", "devops"]
model: llama-3.3-70b-versatile
image_url: "/images/2026-11-04/tomcat-remoteipvalve-trusted-proxy-boundary.jpg"
---

Tomcat's `RemoteIpValve` rewrites the apparent client address from forwarded headers, but that rewrite is only safe when the server knows exactly which proxies are allowed to set them.

## The problem hiding in plain sight

Applications rely on the client IP for rate limiting, audit logs, access control, and session binding. Put Tomcat behind a load balancer or reverse proxy and the socket peer becomes the proxy, not the user. `RemoteIpValve` solves this by reading `X-Forwarded-For` (or a custom header) and overwriting `request.getRemoteAddr()` with the left-most untrusted address. The catch: if Tomcat trusts *any* header value, a malicious client can spoof their IP by sending a forged header directly to the proxy.

## How RemoteIpValve works

The valve sits in the Tomcat pipeline, typically in `server.xml` inside the `<Engine>` or `<Host>`:

```xml
<Valve className="org.apache.catalina.valves.RemoteIpValve"
       remoteIpHeader="x-forwarded-for"
       protocolHeader="x-forwarded-proto"
       internalProxies="10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|169\.254\.\d{1,3}\.\d{1,3}|127\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}|::1|fe80::.*"
       trustedProxies="10\.0\.0\.[1-3]|192\.168\.1\.10"
       requestAttributesEnabled="true" />
```

It parses the header right-to-left, skipping addresses that match `internalProxies` (your known infrastructure) and stopping at the first address that doesn't match. That address becomes the "remote IP" visible to your application.

## Why the default is dangerous

Out of the box, `internalProxies` covers RFC 1918 private ranges and loopback. If your reverse proxy lives in `10.0.0.0/8`, the valve treats it as internal and keeps walking left — potentially landing on an attacker-controlled value. The valve has no way to know which upstream hops are *your* infrastructure unless you tell it.

## Defining the trusted boundary

Two regex patterns draw the line:

| Attribute | Purpose | Typical value |
|-----------|---------|---------------|
| `internalProxies` | Proxies that *may* appear in the header and should be skipped | Your VPC CIDR, known LB IPs |
| `trustedProxies` | Proxies that are *allowed* to set the header at all | Same as internalProxies, or a subset |

Only addresses matching `trustedProxies` are considered legitimate header sources. Anything else causes the valve to ignore the header entirely and fall back to the socket peer.

## Common misconfigurations

1. **Leaving `trustedProxies` unset** — defaults to `internalProxies`, which may be too broad if your cloud provider shares RFC 1918 space with other tenants.
2. **Using a single regex for both** — works for simple setups but conflates "skip this hop" with "trust this hop."
3. **Forgetting IPv6** — modern LBs often send `::ffff:10.0.0.1`; your regex must handle it.
4. **Header name mismatch** — AWS ALB uses `x-forwarded-for`, Cloudflare uses `cf-connecting-ip`, custom headers vary. The valve only reads one header name.

## Verifying the behavior

Deploy a tiny servlet that logs `request.getRemoteAddr()`, `request.getHeader("x-forwarded-for")`, and the valve's internal `request.getAttribute("org.apache.catalina.AccessLog.RemoteAddr")`. Send requests through your proxy chain and directly to Tomcat's port. The direct request should show the real client IP; the proxied request should show the same value *only* when the proxy is in `trustedProxies`.

```bash
# Direct hit (bypass proxy)
curl -H "X-Forwarded-For: 1.2.3.4" http://tomcat:8080/whoami

# Through proxy (assuming proxy IP 10.0.0.5 is in trustedProxies)
curl http://loadbalancer/whoami
```

If the direct hit shows `1.2.3.4`, your valve trusts untrusted sources — fix `trustedProxies` immediately.

## Migration from `RemoteIpFilter`

Spring Boot and some frameworks use `RemoteIpFilter` (a servlet Filter) instead of the valve. The filter has equivalent `internalProxies` and `trustedProxies` properties. The same boundary logic applies: configure both, or the filter will accept headers from any upstream.

## Key takeaways

- `RemoteIpValve` rewrites the client IP from forwarded headers — useful, but only safe with a strict trusted-proxy boundary.
- Configure `trustedProxies` (and `internalProxies`) to match *exactly* the IP ranges of your reverse proxies / load balancers.
- Default RFC 1918 regex is too permissive in shared-cloud environments.
- Test by sending forged headers directly to Tomcat; the valve must ignore them.
- The same rules apply to `RemoteIpFilter` if you use the filter variant.