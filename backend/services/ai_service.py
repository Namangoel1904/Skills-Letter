"""
TechPulse Newsletter — AI Service (Gemini 3.8 Flash)
Handles per-video summarization and full newsletter composition.
"""
from __future__ import annotations

import json
import logging
from typing import Any, Dict, List, Optional

from google import genai

from config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

# Initialise Gemini client once
_client: Optional[genai.Client] = None


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        _client = genai.Client(api_key=settings.gemini_api_key)
    return _client


# ─────────────────────────────────────────────────────────────────────────────
#  Video Summarization
# ─────────────────────────────────────────────────────────────────────────────

VIDEO_SUMMARY_PROMPT = """You are an expert tech newsletter curator. 
Analyse the following YouTube video about technology and produce a JSON summary.

Video URL: {url}
Video Title: {title}
Channel: {channel}
Transcript / Context:
{transcript}

Return ONLY valid JSON matching this exact schema (no markdown, no explanation):
{{
  "tldr": "One sentence summary (max 25 words)",
  "category": "github_repo | llm_model | skill_tool | ui_ux | other",
  "key_points": ["point 1", "point 2", "point 3"],
  "repo_links": ["https://github.com/..."],
  "model_links": ["https://huggingface.co/... or https://ollama.com/..."],
  "tags": ["tag1", "tag2", "tag3"],
  "why_it_matters": "Why a developer doing AI / vibe-coding should care (max 40 words)"
}}

Focus: Open-source repos, local LLMs, Cursor/Claude/AGY skills, UI libraries, .md productivity tools.
Extract any GitHub, HuggingFace, or Ollama links mentioned.
"""

NEWSLETTER_COMPOSE_PROMPT = """You are the editor of "TechPulse" — a premium tech newsletter for developers 
who vibe-code, use AI tools, and love open-source.

Below are summaries of {video_count} curated videos from this week.
Compose a full newsletter edition in clean Markdown.

Edition number: #{edition_number}
Date: {date}

Video summaries (JSON):
{summaries_json}

Newsletter structure:
1. **Hero section** — Exciting 2-3 sentence intro capturing the week's theme
2. **🛠 Open Source Gems** — github_repo category videos
3. **🤖 Local AI Models** — llm_model category videos  
4. **✨ Skills & Productivity** — skill_tool category videos
5. **🎨 UI/UX Finds** — ui_ux category videos
6. **📦 Other Picks** — remaining videos
7. **🔗 Quick Links** — aggregated list of all repo/model links

For each video in its section write:
- **[Video Title](url)** · `#tag1` `#tag2`
- *TLDR:* one sentence
- Key points as bullet list
- *Why it matters:* one sentence

Keep tone: sharp, opinionated, conversational. No fluff. Max 2000 words total.
"""


def summarize_video(
    video_id: str,
    url: str,
    title: str,
    channel: str,
    transcript: Optional[str],
) -> Dict[str, Any]:
    """
    Use Gemini 3.8 Flash to produce a structured summary of a single video.
    Falls back to URL context if no transcript is provided.
    """
    client = _get_client()

    transcript_text = transcript or "[No transcript — analyse from URL context]"

    prompt = VIDEO_SUMMARY_PROMPT.format(
        url=url,
        title=title,
        channel=channel,
        transcript=transcript_text[:8000],  # Stay well within context limits
    )

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )

        raw = response.text or "{}"

        # Strip markdown code fences if present
        raw = raw.strip()
        if raw.startswith("```"):
            raw = raw.split("\n", 1)[-1]
            raw = raw.rsplit("```", 1)[0]

        data = json.loads(raw)

        return {
            "video_id": video_id,
            "url": url,
            "title": title,
            "channel": channel,
            "tldr": data.get("tldr", ""),
            "category": data.get("category", "other"),
            "key_points": data.get("key_points", []),
            "repo_links": data.get("repo_links", []),
            "model_links": data.get("model_links", []),
            "tags": data.get("tags", []),
            "why_it_matters": data.get("why_it_matters", ""),
        }

    except json.JSONDecodeError as e:
        logger.warning(f"JSON parse error for video {video_id}: {e}")
        return _fallback_summary(video_id, url, title, channel)
    except Exception as e:
        logger.error(f"Gemini error summarising {video_id}: {e}")
        return _fallback_summary(video_id, url, title, channel)


def compose_newsletter(
    summaries: List[Dict[str, Any]],
    edition_number: int,
    date_str: str,
) -> str:
    """
    Use Gemini 3.8 Flash to compose the full newsletter markdown from video summaries.
    """
    client = _get_client()

    prompt = NEWSLETTER_COMPOSE_PROMPT.format(
        video_count=len(summaries),
        edition_number=edition_number,
        date=date_str,
        summaries_json=json.dumps(summaries, indent=2),
    )

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )
        return response.text or "Newsletter generation failed."
    except Exception as e:
        logger.error(f"Gemini newsletter composition error: {e}")
        return f"# TechPulse #{edition_number}\n\nNewsletter generation encountered an error: {e}"


def _fallback_summary(video_id: str, url: str, title: str, channel: str) -> Dict[str, Any]:
    return {
        "video_id": video_id,
        "url": url,
        "title": title,
        "channel": channel,
        "tldr": f"Video: {title}",
        "category": "other",
        "key_points": [],
        "repo_links": [],
        "model_links": [],
        "tags": [],
        "why_it_matters": "",
    }
