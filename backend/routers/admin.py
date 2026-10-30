"""
TechPulse Newsletter — API Routers: Admin + Scheduler
Protected endpoints for manually triggering generation and managing the scheduler.
"""
from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials
import secrets

from config import get_settings
from database import get_session
from services.newsletter_service import generate_newsletter
from sqlmodel.ext.asyncio.session import AsyncSession

logger = logging.getLogger(__name__)
settings = get_settings()
router = APIRouter(prefix="/api/admin", tags=["admin"])
security = HTTPBasic()


def verify_admin(credentials: HTTPBasicCredentials = Depends(security)):
    """Simple HTTP Basic auth for admin endpoints."""
    is_correct_password = secrets.compare_digest(
        credentials.password.encode("utf-8"),
        settings.admin_password.encode("utf-8"),
    )
    if not is_correct_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect admin password",
            headers={"WWW-Authenticate": "Basic"},
        )
    return credentials.username


@router.post("/generate")
async def trigger_generation(
    send_email: bool = True,
    _: str = Depends(verify_admin),
    db: AsyncSession = Depends(get_session),
):
    """
    Manually trigger newsletter generation.
    ?send_email=false to generate without sending emails (preview mode).
    """
    logger.info("Manual newsletter generation triggered")
    edition = await generate_newsletter(db=db, send_email=send_email)
    if edition is None:
        return {"message": "No new videos found — newsletter not generated"}
    return {
        "message": "Newsletter generated successfully",
        "edition_id": edition.id,
        "edition_number": edition.edition_number,
        "video_count": edition.video_count,
        "sent": edition.status.value,
    }


@router.get("/status")
async def scheduler_status(_: str = Depends(verify_admin)):
    """Get current scheduler configuration."""
    return {
        "cron": settings.newsletter_cron_default,
        "timezone": settings.scheduler_timezone,
        "playlist_ids": settings.playlist_ids,
        "playlist_names": settings.playlist_names,
        "lookback_days": settings.playlist_lookback_days,
        "max_videos": settings.max_videos_per_edition,
    }
