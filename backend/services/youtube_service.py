"""
TechPulse Newsletter — YouTube Service
Fetches playlist items and video metadata using YouTube Data API v3.
"""
from __future__ import annotations

import logging
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional

from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

from config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


def _get_youtube_client():
    """Build the YouTube Data API client."""
    return build("youtube", "v3", developerKey=settings.youtube_api_key)


def fetch_playlist_videos(
    playlist_id: str,
    playlist_name: str,
    lookback_days: int = 7,
    max_results: int = 50,
) -> List[Dict[str, Any]]:
    """
    Fetch all videos from a playlist added within the last `lookback_days`.
    Returns a list of video metadata dicts.
    """
    youtube = _get_youtube_client()
    cutoff = datetime.now(timezone.utc) - timedelta(days=lookback_days)
    videos: List[Dict[str, Any]] = []
    next_page_token: Optional[str] = None

    while True:
        try:
            req = youtube.playlistItems().list(
                part="snippet,contentDetails",
                playlistId=playlist_id,
                maxResults=50,
                pageToken=next_page_token,
            )
            response = req.execute()
        except HttpError as e:
            logger.error(f"YouTube API error fetching playlist {playlist_id}: {e}")
            break

        for item in response.get("items", []):
            snippet = item["snippet"]
            added_at_str = snippet.get("publishedAt", "")
            try:
                added_at = datetime.fromisoformat(added_at_str.replace("Z", "+00:00"))
            except ValueError:
                added_at = datetime.now(timezone.utc)

            if added_at < cutoff:
                # Playlist items are ordered newest first; stop when too old
                return videos

            video_id = snippet.get("resourceId", {}).get("videoId")
            if not video_id:
                continue

            videos.append({
                "video_id": video_id,
                "title": snippet.get("title", ""),
                "channel": snippet.get("videoOwnerChannelTitle", ""),
                "url": f"https://www.youtube.com/watch?v={video_id}",
                "thumbnail_url": (
                    snippet.get("thumbnails", {})
                    .get("maxres", snippet.get("thumbnails", {}).get("high", {}))
                    .get("url", "")
                ),
                "published_at": snippet.get("videoPublishedAt", added_at_str),
                "added_to_playlist_at": added_at_str,
                "source_playlist": playlist_name,
                "source_playlist_id": playlist_id,
            })

        next_page_token = response.get("nextPageToken")
        if not next_page_token or len(videos) >= max_results:
            break

    return videos


def fetch_video_details(video_ids: List[str]) -> Dict[str, Dict[str, Any]]:
    """
    Batch-fetch duration and statistics for a list of video IDs.
    Returns a dict: { video_id: {duration_seconds, view_count, ...} }
    """
    if not video_ids:
        return {}

    youtube = _get_youtube_client()
    details: Dict[str, Dict[str, Any]] = {}

    # YouTube API allows up to 50 IDs per request
    for i in range(0, len(video_ids), 50):
        batch = video_ids[i : i + 50]
        try:
            req = youtube.videos().list(
                part="contentDetails,statistics",
                id=",".join(batch),
            )
            response = req.execute()
        except HttpError as e:
            logger.error(f"YouTube API error fetching video details: {e}")
            continue

        for item in response.get("items", []):
            vid_id = item["id"]
            duration_iso = item.get("contentDetails", {}).get("duration", "PT0S")
            details[vid_id] = {
                "duration_seconds": _parse_iso_duration(duration_iso),
                "view_count": int(
                    item.get("statistics", {}).get("viewCount", 0)
                ),
            }

    return details


def get_video_captions(video_id: str) -> Optional[str]:
    """
    Attempt to retrieve auto-generated or manual captions via YouTube API.
    Returns plain text transcript or None if unavailable.
    
    NOTE: The captions.download endpoint requires OAuth 2.0 for most videos.
    For API-key-only setups, this will return None and trigger Gemini fallback.
    """
    youtube = _get_youtube_client()
    try:
        captions_list = youtube.captions().list(
            part="snippet",
            videoId=video_id,
        ).execute()

        caption_tracks = captions_list.get("items", [])
        if not caption_tracks:
            return None

        # Prefer English manual captions, fall back to auto-generated
        english_track = None
        for track in caption_tracks:
            lang = track["snippet"].get("language", "")
            kind = track["snippet"].get("trackKind", "")
            if lang.startswith("en"):
                if kind == "standard":
                    english_track = track
                    break
                elif english_track is None:
                    english_track = track

        if not english_track:
            english_track = caption_tracks[0]

        # Download the caption track (requires OAuth for most videos)
        caption_id = english_track["id"]
        caption_response = youtube.captions().download(
            id=caption_id,
            tfmt="srv3",
        ).execute()

        # caption_response is raw bytes; decode and strip XML tags simply
        if isinstance(caption_response, bytes):
            text = caption_response.decode("utf-8", errors="ignore")
        else:
            text = str(caption_response)

        # Strip XML/SRT formatting — keep just text
        import re
        text = re.sub(r"<[^>]+>", " ", text)
        text = re.sub(r"\s+", " ", text).strip()
        return text if len(text) > 50 else None

    except HttpError as e:
        logger.debug(f"Caption fetch failed for {video_id} (expected for API-key-only): {e}")
        return None
    except Exception as e:
        logger.debug(f"Caption download error for {video_id}: {e}")
        return None


def _parse_iso_duration(duration: str) -> int:
    """Convert ISO 8601 duration (e.g. PT4M13S) to seconds."""
    import re
    match = re.match(
        r"P(?:(\d+)D)?T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?", duration
    )
    if not match:
        return 0
    days, hours, minutes, seconds = (int(x or 0) for x in match.groups())
    return days * 86400 + hours * 3600 + minutes * 60 + seconds
