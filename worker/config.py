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
    # News ABOUT the major labs / coding agents / LLM routers / free offerings:
    "https://openai.com/blog/rss.xml",
    "https://www.anthropic.com/news/rss.xml",
    "https://the-decoder.com/feed/",
    "https://simonwillison.net/atom/everything/",
    "https://www.marktechpost.com/feed/",
]

# Topic lanes: each lane drafts (LANES_PER_RUN) posts per hourly run, pulling from
# several sources so a topic always has coverage. A lane entry is either a bare source
# key (hn, github, arxiv, reddit, rss) or a qualified call: "arxiv:cs.LG", "reddit:python".
#
# LANE_TOPICS below lists the entities/topics of interest per lane so the scorer
# (TOPIC_WORDS in score.py) and the writer bias toward news ABOUT those subjects.
DEFAULT_LANES = [
    # AI / ML — frontier labs, coding agents, LLM routers, open-weight releases
    ["hn", "reddit:artificial", "reddit:LocalLLaMA", "arxiv:cs.AI", "arxiv:cs.LG", "arxiv:cs.CL",
     "openai", "anthropic", "thedecoder"],
    # Security
    ["arxiv:cs.CR", "thehackersnews", "reddit:netsec"],
    # Open Source
    ["github", "github.blog", "reddit:opensource", "reddit:rust"],
    # Dev Tools — coding agents (Codex, Claude Code, OpenCode, OpenClaw), free tiers
    ["lobsters", "devto", "reddit:python", "reddit:rust", "arxiv:cs.PL", "arxiv:cs.SE",
     "reddit:ClaudeAI", "reddit:codex", "reddit:ollama"],
    # Hardware / Consumer Tech (mobiles, laptops, GPUs, quantum, AI accelerators)
    ["verge", "arstechnica", "tomshardware", "arxiv:quant-ph", "reddit:hardware"],
    # Big Tech — OpenAI/Google/Anthropic/Meta news, free model offerings
    ["blog.google", "rss", "openai", "anthropic", "reddit:singularity"],
]

# Per-lane topics of interest (entities + themes). The writer is instructed to favor
# stories ABOUT these; the scorer (TOPIC_WORDS) boosts matching titles.
LANE_TOPICS = {
    "AI / ML": [
        "OpenAI", "GPT", "ChatGPT", "Claude", "Anthropic", "Gemini", "Google AI",
        "LLM routers", "Mixtral", "Llama", "Mistral", "Qwen", "DeepSeek", "open-weight releases",
        "model fine-tuning", "RAG", "embeddings", "inference scaling", "agentic AI",
    ],
    "Security": [
        "CVE", "exploit", "supply-chain", "LLM security", "prompt injection",
        "ransomware", "zero-day", "auth bypass", "AI-assisted exploitation",
    ],
    "Open Source": [
        "GitHub", "Linux", "Rust", "Python", "Apache", "CNCF", "funding", "license changes",
        "OpenClaw", "OpenCode", "open-source releases",
    ],
    "Dev Tools": [
        "Codex", "Claude Code", "OpenCode", "OpenClaw", "GitHub Copilot", "Cursor",
        "free developer tiers", "CLI tools", "IDEs", "debuggers", "build systems",
        "local LLMs for dev", "agentic coding",
    ],
    "Hardware / Consumer Tech": [
        "smartphones", "laptops", "GPUs", "NPUs", "Apple Silicon", "Qualcomm",
        "quantum computing", "wearables", "AI accelerators", "data-center hardware",
    ],
    "Big Tech": [
        "OpenAI", "Google", "Anthropic", "Meta", "Microsoft", "Apple", "Amazon",
        "free model offerings", "API launches", "earnings", "antitrust", "open models",
    ],
}

# Maps each DEFAULT_LANES entry (by position) to its section label. The writer uses
# this label as the article's `kicker` section; the scorer uses it for lane-aware fit.
# Order MUST match DEFAULT_LANES.
LANE_SECTION = [
    "AI / ML",
    "Security",
    "Open Source",
    "Dev Tools",
    "Hardware / Consumer Tech",
    "Big Tech",
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
    lanes_per_run: int = field(default_factory=lambda: int(_env("LANES_PER_RUN", "3") or 3))

    @property
    def lane_section(self) -> list[str]:
        """Section label for each lane (parallel to `lanes`). Uses the curated
        LANE_SECTION table when lanes are the defaults; otherwise derives a label
        from the first source key in each lane (best-effort)."""
        lanes = self.lanes
        if lanes == DEFAULT_LANES and len(LANE_SECTION) == len(lanes):
            return LANE_SECTION
        # Derived fallback: name the lane by its first source key (e.g. 'hn' -> 'HN').
        return [str(lane[0]).split(":")[0].upper() if lane else "Tech" for lane in lanes]

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

    # Supabase. The publishable (anon) key is safe to expose (RLS-gated); the
    # service-role key (if you provision it) enables writes. Missing either -> dry-run
    # mode falls back to the committed seen_links.json file ledger.
    supabase_url: str = field(default_factory=lambda: _env("SUPABASE_URL"))
    supabase_key: str = field(default_factory=lambda: _env("SUPABASE_SERVICE_KEY") or _env("SUPABASE_ANON_KEY"))

    # Site identity
    site_name: str = field(default_factory=lambda: _env("SITE_NAME", "The Daily Byte"))
    site_tagline: str = field(default_factory=lambda: _env("SITE_TAGLINE", "Student Tech Edition"))
    site_url: str = field(default_factory=lambda: _env("SITE_URL", "https://bloggy.example.com"))
    author_name: str = field(default_factory=lambda: _env("AUTHOR_NAME", "The Daily Byte"))

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
    max_llm_retries: int = 1

    # Where the site lives
    content_dir: Path = field(default_factory=lambda: Path(_env("CONTENT_DIR", "content")))

    def has_supabase(self) -> bool:
        return bool(self.supabase_url and self.supabase_key)

    def has_llm(self) -> bool:
        return bool(self.llm_api_key)