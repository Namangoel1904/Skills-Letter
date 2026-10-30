"""
TechPulse Newsletter — Transcript Service
Gets video transcripts via YouTube API, falls back to Gemini URL context.
"""
from __future__ import annotations

import logging
from typing import Optional

from services.youtube_service import get_video_captions

logger = logging.getLogger(__name__)


def get_transcript(video_id: str, url: str) -> Optional[str]:
    """
    Attempts to get a video transcript in this order:
    1. YouTube captions API (works if OAuth is configured; API key only = usually None)
    2. Returns None → caller (ai_service) will use Gemini URL context as fallback

    This design means we never block on missing captions.
    """
    # Try YouTube captions API first
    transcript = get_video_captions(video_id)
    if transcript:
        logger.info(f"Got YouTube captions for {video_id} ({len(transcript)} chars)")
        return transcript

    # No captions available — Gemini URL context will be used in ai_service
    logger.info(f"No captions for {video_id} — Gemini URL context will be used")
    return None
