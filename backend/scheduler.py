"""
TechPulse Newsletter — APScheduler Background Job
Runs the newsletter generation pipeline on a configurable cron schedule.
"""
from __future__ import annotations

import asyncio
import logging

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

from config import get_settings
from database import AsyncSessionLocal
from services.newsletter_service import generate_newsletter

logger = logging.getLogger(__name__)
settings = get_settings()

scheduler = AsyncIOScheduler(timezone=settings.scheduler_timezone)


async def _run_scheduled_generation():
    """Wrapped async job called by APScheduler."""
    logger.info("⏰ Scheduled newsletter generation starting...")
    async with AsyncSessionLocal() as session:
        edition = await generate_newsletter(db=session, send_email=True)
        if edition:
            logger.info(f"✅ Scheduled generation complete — Edition #{edition.edition_number}")
        else:
            logger.info("ℹ️ No new videos this cycle")


def start_scheduler():
    """Register the cron job and start the scheduler."""
    # Parse the cron expression: "30 11 * * 5" = Every Friday 11:30 UTC (5PM IST)
    cron_parts = settings.newsletter_cron_default.split()
    if len(cron_parts) == 5:
        minute, hour, day, month, day_of_week = cron_parts
        trigger = CronTrigger(
            minute=minute,
            hour=hour,
            day=day,
            month=month,
            day_of_week=day_of_week,
            timezone=settings.scheduler_timezone,
        )
    else:
        # Fallback: every Friday at 5PM IST
        trigger = CronTrigger(
            day_of_week="fri",
            hour=17,
            minute=0,
            timezone=settings.scheduler_timezone,
        )

    scheduler.add_job(
        _run_scheduled_generation,
        trigger=trigger,
        id="newsletter_generation",
        name="TechPulse Newsletter Generation",
        replace_existing=True,
        misfire_grace_time=3600,  # 1 hour tolerance for misfires
    )

    scheduler.start()
    logger.info(
        f"📅 Scheduler started — cron: {settings.newsletter_cron_default} "
        f"({settings.scheduler_timezone})"
    )


def stop_scheduler():
    """Gracefully shut down the scheduler."""
    if scheduler.running:
        scheduler.shutdown(wait=False)
        logger.info("📅 Scheduler stopped")
