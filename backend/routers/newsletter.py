"""
TechPulse Newsletter — API Routers: Newsletter Editions
"""
from __future__ import annotations

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from database import get_session
from models import NewsletterEdition, NewsletterEditionRead

router = APIRouter(prefix="/api/newsletter", tags=["newsletter"])


@router.get("/editions", response_model=List[NewsletterEditionRead])
async def list_editions(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_session),
):
    """List all newsletter editions, newest first."""
    result = await db.exec(
        select(NewsletterEdition)
        .order_by(NewsletterEdition.edition_number.desc())
        .offset(skip)
        .limit(limit)
    )
    return result.all()


@router.get("/editions/latest", response_model=NewsletterEditionRead)
async def get_latest_edition(db: AsyncSession = Depends(get_session)):
    """Get the most recently generated edition."""
    result = await db.exec(
        select(NewsletterEdition)
        .order_by(NewsletterEdition.edition_number.desc())
        .limit(1)
    )
    edition = result.first()
    if not edition:
        raise HTTPException(status_code=404, detail="No editions found yet")
    return edition


@router.get("/editions/{edition_id}", response_model=NewsletterEditionRead)
async def get_edition(edition_id: int, db: AsyncSession = Depends(get_session)):
    """Get a specific edition by ID."""
    edition = await db.get(NewsletterEdition, edition_id)
    if not edition:
        raise HTTPException(status_code=404, detail="Edition not found")
    return edition
