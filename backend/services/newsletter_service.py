"""
TechPulse Newsletter — Newsletter Generation Orchestrator
Central pipeline: playlists → transcripts → AI summaries → DB → email.
"""
from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import List, Optional

import markdown as md
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from config import get_settings
from models import (
    NewsletterEdition,
    NewsletterStatus,
    ProcessedVideo,
    Subscriber,
    VideoSummary,
)
from services.youtube_service import (
    fetch_playlist_videos,
    fetch_video_details,
)
from services.transcript_service import get_transcript
from services.ai_service import summarize_video, compose_newsletter
from services.email_service import render_email_html, send_newsletter

logger = logging.getLogger(__name__)
settings = get_settings()


async def generate_newsletter(
    db: AsyncSession,
    send_email: bool = True,
) -> Optional[NewsletterEdition]:
    """
    Full newsletter generation pipeline:
    1. Fetch new videos from all configured playlists
    2. Skip already-processed videos
    3. Get transcripts (YouTube API → Gemini URL fallback)
    4. Summarize each video with Gemini 3.8 Flash
    5. Compose full newsletter markdown
    6. Save to DB
    7. Optionally send emails to eligible subscribers
    """

    # ── 1. Determine next edition number ─────────────────────────────────
    result = await db.exec(
        select(NewsletterEdition).order_by(NewsletterEdition.edition_number.desc()).limit(1)
    )
    last_edition = result.first()
    edition_number = (last_edition.edition_number + 1) if last_edition else 1

    # ── 2. Load already-processed video IDs ──────────────────────────────
    processed_result = await db.exec(select(ProcessedVideo.video_id))
    already_processed = set(processed_result.all())

    # ── 3. Fetch videos from all playlists ────────────────────────────────
    all_videos = []
    playlist_ids_used = []

    for playlist_id, playlist_name in zip(
        settings.playlist_ids, settings.playlist_names
    ):
        logger.info(f"Fetching playlist: {playlist_name} ({playlist_id})")
        videos = fetch_playlist_videos(
            playlist_id=playlist_id,
            playlist_name=playlist_name,
            lookback_days=settings.playlist_lookback_days,
            max_results=settings.max_videos_per_edition,
        )
        new_videos = [v for v in videos if v["video_id"] not in already_processed]
        logger.info(f"  Found {len(videos)} videos, {len(new_videos)} new")
        all_videos.extend(new_videos)
        if playlist_id not in playlist_ids_used:
            playlist_ids_used.append(playlist_id)

    if not all_videos:
        logger.warning("No new videos found across all playlists — skipping generation")
        return None

    # Cap total videos
    if settings.max_videos_per_edition > 0:
        all_videos = all_videos[: settings.max_videos_per_edition]

    # ── 4. Enrich with duration details ──────────────────────────────────
    video_ids = [v["video_id"] for v in all_videos]
    details = fetch_video_details(video_ids)
    for v in all_videos:
        detail = details.get(v["video_id"], {})
        v["duration_seconds"] = detail.get("duration_seconds", 0)
        v["view_count"] = detail.get("view_count", 0)

    # ── 5. Summarize each video ───────────────────────────────────────────
    summaries = []
    for video in all_videos:
        vid_id = video["video_id"]
        logger.info(f"Summarising: {video['title'][:60]}")

        transcript = get_transcript(vid_id, video["url"])
        summary = summarize_video(
            video_id=vid_id,
            url=video["url"],
            title=video["title"],
            channel=video["channel"],
            transcript=transcript,
        )
        # Merge in metadata not from AI
        summary.update({
            "thumbnail_url": video.get("thumbnail_url", ""),
            "duration_seconds": video.get("duration_seconds", 0),
            "source_playlist": video.get("source_playlist", ""),
            "published_at": video.get("published_at", ""),
        })
        summaries.append(summary)

    # ── 6. Compose full newsletter markdown ───────────────────────────────
    date_str = datetime.now(timezone.utc).strftime("%B %d, %Y")
    newsletter_md = compose_newsletter(
        summaries=summaries,
        edition_number=edition_number,
        date_str=date_str,
    )

    # Render HTML version
    newsletter_html = md.markdown(
        newsletter_md,
        extensions=["extra", "codehilite", "nl2br"],
    )

    # ── 7. Save edition to DB ─────────────────────────────────────────────
    edition = NewsletterEdition(
        title=f"TechPulse #{edition_number} — Week of {date_str}",
        edition_number=edition_number,
        playlist_ids=playlist_ids_used,
        video_count=len(summaries),
        videos=[s for s in summaries],
        content_markdown=newsletter_md,
        content_html=newsletter_html,
        status=NewsletterStatus.draft,
    )
    db.add(edition)
    await db.flush()  # get edition.id

    # Mark videos as processed
    for summary in summaries:
        db.add(
            ProcessedVideo(
                video_id=summary["video_id"],
                edition_id=edition.id,
                source_playlist=summary.get("source_playlist", ""),
            )
        )

    await db.commit()
    await db.refresh(edition)

    logger.info(f"Saved edition #{edition_number} (id={edition.id}) with {len(summaries)} videos")

    # ── 8. Send emails ────────────────────────────────────────────────────
    if send_email:
        subscribers_result = await db.exec(
            select(Subscriber).where(Subscriber.is_active == True)
        )
        subscribers = subscribers_result.all()
        sent = send_newsletter(edition, subscribers)

        edition.status = NewsletterStatus.sent
        edition.sent_at = datetime.now(timezone.utc)
        edition.recipients_count = sent
        db.add(edition)
        await db.commit()
        logger.info(f"Edition #{edition_number} sent to {sent} subscribers")

    return edition
