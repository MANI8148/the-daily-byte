# Run the worker on your own VPS (full control, always-on)

Cheapest hands-on option: **Hetzner CX22 (~€3.8/mo)** or DigitalOcean $6 Droplet. ~5 min setup.

## 1. Provision + Docker

```bash
# Ubuntu 24.04, then:
apt update && apt install -y docker.io docker-compose-v2
```

## 2. Ship the app

```bash
git clone https://github.com/<you>/bloggy && cd bloggy
cp .env.example .env   # fill in real keys
nano .env
```

## 3. Run it forever

```bash
docker build -t bloggy-worker -f deploy/Dockerfile .
docker run -d --restart unless-stopped --env-file .env \
  --name bloggy-worker -p 8010:8010 bloggy-worker
```

`--restart unless-stopped` = survives reboots; use `docker logs -f bloggy-worker` to watch.

## 4. Approval endpoint (optional but recommended)

```bash
docker run -d --restart unless-stopped --env-file .env \
  --name bloggy-approve -p 8011:8010 bloggy-worker \
  python -m worker.app serve-approve --port 8010
```

Approve a draft: `curl "http://VPS_IP:8011/approve?id=<post_id>&token=<APPROVE_TOKEN>"`
(put it behind Appwrite Auth or a reverse proxy with basic auth before exposing publicly).

## Hardening checklist

- firewall: `ufw allow 22,80,443` only; put Nginx/Caddy in front for TLS
- keep `.env` out of git (already in `.gitignore`)
- rotate `APPROVE_TOKEN` if the server is ever public-facing
- optional swap: run the daemon under `systemd` instead of Docker if you prefer:
  `systemd` unit `ExecStart=/usr/bin/python3 -m worker.app daemon` with `Restart=always`