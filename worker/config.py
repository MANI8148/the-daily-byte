"""Config for the Bloggy worker. Reads env vars + optional .env file (no deps)."""
from __future__ import annotations

import json
import os
from dataclasses import dataclass, field
from pathlib import Path


def _load_dotenv(path: Path = Path(".env")) -> None:
    if not path.exists():
        return
    for line in path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, _, v = line.partition("=")
        os.environ.setdefault(k.strip(), v.strip())


_load_dotenv(Path(__file__).resolve().parent.parent / ".env")


def _env(key: str, default: str = "") -> str:
    return os.environ.get(key, default).strip()


def _parse_fallbacks(raw: str) -> list:
    """Parse the LLM_FALLBACKS JSON env into [{base_url, api_key, model}] (model optional)."""
    if not raw:
        return []
    try:
        entries = json.loads(raw)
        return [
            {
                "base_url": e.get("base_url", "").rstrip("/"),
                "api_key": e.get("api_key", ""),
                "model": e.get("model", "") or None,
            }
            for e in entries
            if e.get("base_url") and e.get("api_key")
        ]
    except (ValueError, TypeError, AttributeError):
        print("  [config] WARNING: LLM_FALLBACKS is not valid JSON — ignoring fallbacks")
        return []


DEFAULT_RSS_FEEDS = [
    "https://github.blog/feed/",
    "https://blog.google/technology/ai/rss/",
    "https://feeds.feedburner.com/TheHackersNews",
]

# Topic lanes: each lane drafts (LANES_PER_RUN) posts per hourly run, pulling from
# several sources so a topic always has coverage. A lane entry is either a bare source
# key (hn, github, arxiv, reddit, rss) or a qualified call: "arxiv:cs.LG", "reddit:python".
DEFAULT_LANES = [
    ["hn", "arxiv:cs.AI", "arxiv:cs.LG", "arxiv:cs.CL"],          # AI / ML
    ["arxiv:cs.CR", "thehackersnews"],                             # Security
    ["github", "github.blog"],                                     # Open Source
    ["lobsters", "devto", "arxiv:cs.PL", "arxiv:cs.SE"],          # Dev Tools
    ["verge", "arstechnica", "tomshardware", "arxiv:quant-ph"],    # Hardware / Consumer Tech (mobiles, laptops, GPUs, quantum)
    ["blog.google", "rss"],                                        # Big Tech
]


def _parse_list(raw: str, default: list) -> list:
    if not raw:
        return default
    try:
        v = json.loads(raw)
        return v if isinstance(v, list) else default
    except Exception:
        return default


@dataclass
class Config:
    # RSS feeds (feedparser) — JSON list in env, sensible defaults otherwise
    rss_feeds: list = field(default_factory=lambda: _parse_list(_env("RSS_FEEDS", ""), DEFAULT_RSS_FEEDS))

    # Topic lanes (one draft per lane per run) — JSON list-of-lists in env
    lanes: list = field(default_factory=lambda: _parse_list(_env("LANES", ""), DEFAULT_LANES))
    lanes_per_run: int = field(default_factory=lambda: int(_env("LANES_PER_RUN", "1") or 1))

    # opencode CLI fallback (own account quota; separate from the HTTP providers)
    opencode_bin: str = field(default_factory=lambda: _env("OPENCODE_BIN", "opencode"))
    opencode_model: str = field(default_factory=lambda: _env("OPENCODE_MODEL", ""))  # "" = CLI default

    # LLM (any OpenAI-compatible /chat/completions endpoint)
    llm_base_url: str = field(default_factory=lambda: _env("OPENAI_BASE_URL", "https://api.openai.com/v1"))
    llm_api_key: str = field(default_factory=lambda: _env("OPENAI_API_KEY"))
    llm_model: str = field(default_factory=lambda: _env("OPENAI_MODEL", "gpt-4o-mini"))

    # Fallback endpoints, tried in order when the primary is rate-limited or down.
    # JSON list in LLM_FALLBACKS: [{"base_url": "...", "api_key": "...", "model": "..."}, ...]
    # (model optional — falls back to the primary model name.)
    llm_fallbacks: list = field(default_factory=lambda: _parse_fallbacks(_env("LLM_FALLBACKS")))

    # Curation: cheap model scores every candidate; stronger model drafts.
    # Free endpoints work here: Groq (llama-3.3-70b), Gemini flash (Google AI
    # Studio, OpenAI-compatible), OpenRouter :free models, Nous Portal, Ollama.
    score_model: str = field(default_factory=lambda: _env("LLM_SCORE_MODEL", "llama-3.1-8b-instant"))
    score_threshold: float = float(_env("LLM_SCORE_THRESHOLD", "6"))

    # Supabase (service-role key). Missing -> dry-run mode (prints instead of storing).
    supabase_url: str = field(default_factory=lambda: _env("SUPABASE_URL"))
    supabase_key: str = field(default_factory=lambda: _env("SUPABASE_SERVICE_KEY"))

    # Site identity
    site_name: str = field(default_factory=lambda: _env("SITE_NAME", "The Daily Byte"))
    site_tagline: str = field(default_factory=lambda: _env("SITE_TAGLINE", "Student Tech Edition"))
    site_url: str = field(default_factory=lambda: _env("SITE_URL", "https://bloggy.example.com"))
    author_name: str = field(default_factory=lambda: _env("AUTHOR_NAME", "Manikanta"))

    # Publishing keys (optional; adapters skip silently when absent)
    devto_api_key: str = field(default_factory=lambda: _env("DEVTO_API_KEY"))
    medium_token: str = field(default_factory=lambda: _env("MEDIUM_TOKEN"))
    hashnode_token: str = field(default_factory=lambda: _env("HASHNODE_TOKEN"))
    hashnode_publication: str = field(default_factory=lambda: _env("HASHNODE_PUBLICATION"))
    ghost_admin_key: str = field(default_factory=lambda: _env("GHOST_ADMIN_KEY"))
    ghost_url: str = field(default_factory=lambda: _env("GHOST_URL"))

    # Telegram notify (optional)
    telegram_bot_token: str = field(default_factory=lambda: _env("TELEGRAM_BOT_TOKEN"))
    telegram_chat_id: str = field(default_factory=lambda: _env("TELEGRAM_CHAT_ID"))

    # Git-based review loop: drafts land in content/drafts/, pushed as a branch,
    # opened as a GitHub PR; merging the PR triggers your Vercel deploy.
    github_token: str = field(default_factory=lambda: _env("GITHUB_TOKEN"))
    git_repo: str = field(default_factory=lambda: _env("GIT_REPO"))  # "owner/repo"
    git_branch: str = field(default_factory=lambda: _env("GIT_BRANCH", "main"))

    # Distribution (all free tiers)
    buttondown_api_key: str = field(default_factory=lambda: _env("BUTTONDOWN_API_KEY"))
    bluesky_handle: str = field(default_factory=lambda: _env("BLUESKY_HANDLE"))
    bluesky_app_password: str = field(default_factory=lambda: _env("BLUESKY_APP_PASSWORD"))

    # Topics the writer focuses on (scorer boosts items matching these keywords)
    topics: list = field(default_factory=lambda: [t.strip() for t in _env("TOPICS", "ai,ml,llm,opensource,github,python").split(",") if t.strip()])

    # Article defaults
    min_words: int = 300
    max_words: int = 2500
    default_tags: list = field(default_factory=lambda: [t.strip() for t in _env("DEFAULT_TAGS", "ai,ml,tech").split(",") if t.strip()])

    # Pipeline behaviour
    auto_publish: bool = False          # publish straight after checks pass (no human gate)
    approve_token: str = field(default_factory=lambda: _env("APPROVE_TOKEN", "changeme"))
    daemon_interval_min: int = int(_env("DAEMON_INTERVAL_MIN", "360"))
    max_candidates: int = 12            # items fetched per source
    max_llm_retries: int = 2

    # Where the site lives
    content_dir: Path = field(default_factory=lambda: Path(_env("CONTENT_DIR", "content")))

    def has_supabase(self) -> bool:
        return bool(self.supabase_url and self.supabase_key)

    def has_llm(self) -> bool:
        return bool(self.llm_api_key)