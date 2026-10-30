"""
TechPulse Newsletter — API Routers: Subscribers
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from database import get_session
from models import Subscriber, SubscriberCreate, SubscriberRead

router = APIRouter(prefix="/api/subscribers", tags=["subscribers"])


@router.post("/subscribe", response_model=SubscriberRead, status_code=status.HTTP_201_CREATED)
async def subscribe(payload: SubscriberCreate, db: AsyncSession = Depends(get_session)):
    """Subscribe to the newsletter."""
    # Check for existing subscriber
    result = await db.exec(select(Subscriber).where(Subscriber.email == payload.email))
    existing = result.first()

    if existing:
        if existing.is_active:
            raise HTTPException(status_code=409, detail="Already subscribed")
        # Re-activate
        existing.is_active = True
        existing.frequency = payload.frequency
        if payload.name:
            existing.name = payload.name
        db.add(existing)
        await db.commit()
        await db.refresh(existing)
        return existing

    subscriber = Subscriber(**payload.model_dump())
    db.add(subscriber)
    await db.commit()
    await db.refresh(subscriber)
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
