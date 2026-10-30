"""
TechPulse Newsletter — API Routers: Subscribers
Handles subscription with frequency configuration, confirmation emails, and unsubscribe flow.
"""
from __future__ import annotations

import logging
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from database import get_session
from models import Subscriber, SubscriberCreate, SubscriberRead, NewsletterEdition
from services.email_service import send_welcome_email

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/subscribers", tags=["subscribers"])


@router.post("/subscribe", response_model=SubscriberRead, status_code=status.HTTP_201_CREATED)
async def subscribe(payload: SubscriberCreate, db: AsyncSession = Depends(get_session)):
    """
    Subscribe to the newsletter.
    - Saves subscriber with chosen frequency preference
    - Sends an immediate confirmation welcome email via Resend
    """
    # Fetch latest edition for inclusion in welcome email
    latest_res = await db.exec(
        select(NewsletterEdition).order_by(NewsletterEdition.edition_number.desc()).limit(1)
    )
    latest_edition = latest_res.first()

    # Check for existing subscriber
    result = await db.exec(select(Subscriber).where(Subscriber.email == payload.email))
    existing = result.first()

    if existing:
        if existing.is_active:
            raise HTTPException(status_code=409, detail="Already subscribed with this email address")
        # Re-activate subscriber
        existing.is_active = True
        existing.frequency = payload.frequency
        if payload.name:
            existing.name = payload.name
        db.add(existing)
        await db.commit()
        await db.refresh(existing)

        # Send welcome confirmation email
        send_welcome_email(subscriber=existing, latest_edition=latest_edition)
        return existing

    subscriber = Subscriber(**payload.model_dump())
    db.add(subscriber)
    await db.commit()
    await db.refresh(subscriber)

    # Send welcome confirmation email
    send_welcome_email(subscriber=subscriber, latest_edition=latest_edition)

    return subscriber


@router.post("/unsubscribe")
async def unsubscribe(token: str = Query(...), db: AsyncSession = Depends(get_session)):
    """One-click unsubscribe using token."""
    result = await db.exec(
        select(Subscriber).where(Subscriber.unsubscribe_token == token)
    )
    subscriber = result.first()
    if not subscriber:
        raise HTTPException(status_code=404, detail="Invalid unsubscribe token")

    subscriber.is_active = False
    db.add(subscriber)
    await db.commit()
    return {"message": "Successfully unsubscribed"}


@router.get("/count")
async def subscriber_count(db: AsyncSession = Depends(get_session)):
    """Public endpoint — returns active subscriber count."""
    result = await db.exec(
        select(Subscriber).where(Subscriber.is_active == True)
    )
    count = len(result.all())
    return {"count": count}
