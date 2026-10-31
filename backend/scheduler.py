"""
TechPulse Newsletter — APScheduler Background Job
Runs the newsletter generation pipeline on configured schedule days (Mon–Fri at 5:00 PM IST).
Dispatches new drops only to subscribers matching that day's frequency preference.
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
    """
    Automated generation run:
    1. Checks for newly uploaded videos in YouTube playlists
    2. Synthesizes an edition if new drops exist
    3. Dispatches only to subscribers eligible for today's cadence
    """
    logger.info("⏰ Scheduled newsletter generation cycle starting...")
    async with AsyncSessionLocal() as session:
        try:
            edition = await generate_newsletter(db=session, send_email=True, is_cron=True)
            if edition:
                logger.info(f"✅ Scheduled dispatch complete — Edition #{edition.edition_number} sent to {edition.recipients_count} subscribers")
            else:
                logger.info("ℹ️ No new videos detected in playlists this cycle — skipping dispatch")
        except Exception as e:
            logger.error(f"❌ Scheduled newsletter generation failed: {e}", exc_info=True)


def start_scheduler():
    """
    Register the automated schedule and start the engine.
    Runs every weekday (Mon–Fri) at 17:00 IST (11:30 UTC):
    - Monday: dispatches to daily, 5x/week, and 2x/week subscribers
    - Tuesday & Wednesday: dispatches to daily and 5x/week subscribers
    - Thursday: dispatches to daily, 5x/week, and 2x/week subscribers
    - Friday: dispatches to daily, 5x/week, and weekly flagship subscribers
    """
    # Mon–Fri at 5:00 PM IST (11:30 UTC)
    trigger = CronTrigger(
        day_of_week="mon-fri",
        hour=17,
        minute=0,
        timezone=settings.scheduler_timezone,
    )

    scheduler.add_job(
        _run_scheduled_generation,
        trigger=trigger,
        id="newsletter_generation",
        name="TechPulse Weekday Generation Cycle",
        replace_existing=True,
        misfire_grace_time=3600,
    )

    scheduler.start()
    logger.info(
        f"📅 Scheduler started — Active Mon–Fri at 17:00 {settings.scheduler_timezone} "
        "(Mon, Thu: 2x/wk | Mon–Fri: 5x/wk | Fri: Weekly | Daily: all)"
    )


def stop_scheduler():
    """Gracefully shut down the scheduler."""
    if scheduler.running:
        scheduler.shutdown(wait=False)
        logger.info("📅 Scheduler stopped")
