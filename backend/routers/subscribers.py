"""
TechPulse Newsletter — API Routers: Subscribers
Handles subscription with frequency configuration, confirmation emails, and unsubscribe flow.
"""
from __future__ import annotations

import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
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


class UnsubscribeRequest(BaseModel):
    email: Optional[str] = None
    token: Optional[str] = None


@router.post("/unsubscribe")
async def unsubscribe(
    payload: Optional[UnsubscribeRequest] = None,
    token: Optional[str] = Query(None),
    email: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_session),
):
    """
    Unsubscribe using token (from email link) or email address directly.
    Accepts:
    - POST /api/subscribers/unsubscribe?email=user@example.com
    - POST /api/subscribers/unsubscribe?token=<token>
    - POST /api/subscribers/unsubscribe with JSON body {"email": "user@example.com"}
    """
    resolved_email = (payload.email if payload and payload.email else None) or email
    resolved_token = (payload.token if payload and payload.token else None) or token

    if not resolved_email and not resolved_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either 'email' or 'token' must be provided",
        )

    query = select(Subscriber)
    if resolved_token:
        query = query.where(Subscriber.unsubscribe_token == resolved_token.strip())
    elif resolved_email:
        query = query.where(Subscriber.email == resolved_email.strip())

    result = await db.exec(query)
    subscriber = result.first()
    if not subscriber:
        raise HTTPException(status_code=404, detail="Subscriber not found")

    subscriber.is_active = False
    db.add(subscriber)
    await db.commit()
    logger.info(f"Unsubscribed: {subscriber.email}")
    return {
        "success": True,
        "message": f"Successfully unsubscribed {subscriber.email}",
        "email": subscriber.email,
        "is_active": False,
    }


@router.get("/count")
async def subscriber_count(db: AsyncSession = Depends(get_session)):
    """Public endpoint — returns active subscriber count."""
    result = await db.exec(
        select(Subscriber).where(Subscriber.is_active == True)
    )
    count = len(result.all())
    return {"count": count}
