# Bloggy worker — always-on engine container (VPS / Render / Railway / Docker)
FROM python:3.12-slim

WORKDIR /app
COPY worker/ ./worker/
COPY content/ ./content/

# Runtime is stdlib-only; this is just a safety net.
RUN pip install --no-cache-dir -r worker/requirements.txt || true

EXPOSE 8010
CMD ["python", "-m", "worker.app", "daemon"]