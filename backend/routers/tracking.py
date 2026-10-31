"""
Being Notified — Real Engagement & Click Tracking Router
Handles:
  1. 1x1 transparent tracking pixel for Email Open Rate
  2. Redirect link click tracking for CTR (specifically GitHub repos)
  3. Web client beaconing for public site engagement
  4. Resend webhook ingestion
"""
from __future__ import annotations

import logging
from datetime import datetime
from typing import Optional
from urllib.parse import unquote

from fastapi import APIRouter, Depends, Query, Request, Response, status
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from config import get_settings
from database import get_session
from models import EmailDispatch, EmailOpenEvent, LinkClickEvent

logger = logging.getLogger(__name__)
settings = get_settings()

router = APIRouter(prefix="/api/track", tags=["Tracking"])

# RFC-compliant 43-byte transparent 1x1 GIF
TRANSPARENT_1PX_GIF = (
    b"GIF89a\x01\x00\x01\x00\x80\x00\x00\xff\xff\xff\x00\x00\x00!"
    b"\xf9\x04\x01\x00\x00\x00\x00,\x00\x00\x00\x00\x01\x00\x01\x00"
    b"\x00\x02\x02D\x01\x00;"
)


# ── Schemas ───────────────────────────────────────────────────────────────────

class WebClickPayload(BaseModel):
    url: str
    edition_id: Optional[int] = None
    subscriber_id: Optional[int] = None
    is_github: Optional[bool] = None
    tag: Optional[str] = "github"
    source: Optional[str] = "web"


class SimulatePayload(BaseModel):
    action: str  # "open" or "click"
    edition_id: int
    subscriber_id: Optional[int] = None
    url: Optional[str] = "https://github.com/torvalds/linux"


# ── 1. Tracking Pixel (Mail Open Rate) ────────────────────────────────────────

@router.get("/open")
async def track_email_open(
    request: Request,
    edition_id: int = Query(..., description="ID of the newsletter edition"),
    subscriber_id: Optional[int] = Query(None, description="ID of subscriber"),
    db: AsyncSession = Depends(get_session),
):
    """
    1x1 transparent GIF tracking pixel.
    Loaded when a subscriber opens their email client with images enabled.
    Records real email open events and updates the subscriber dispatch status.
    """
    user_agent = request.headers.get("user-agent")
    client_ip = request.client.host if request.client else None

    try:
        # Record raw open event
        event = EmailOpenEvent(
            edition_id=edition_id,
            subscriber_id=subscriber_id,
            timestamp=datetime.utcnow(),
            user_agent=user_agent[:255] if user_agent else None,
            ip_address=client_ip,
        )
        db.add(event)

        # Update EmailDispatch for this subscriber + edition if present
        if subscriber_id:
            query = select(EmailDispatch).where(
                EmailDispatch.edition_id == edition_id,
                EmailDispatch.subscriber_id == subscriber_id,
            )
            res = await db.exec(query)
            dispatch = res.first()
            if dispatch:
                dispatch.is_opened = True
                dispatch.open_count += 1
                if not dispatch.opened_at:
                    dispatch.opened_at = datetime.utcnow()
                db.add(dispatch)
            else:
                # First time dispatch record if not pre-created
                new_dispatch = EmailDispatch(
                    edition_id=edition_id,
                    subscriber_id=subscriber_id,
                    is_opened=True,
                    opened_at=datetime.utcnow(),
                    open_count=1,
                )
                db.add(new_dispatch)

        await db.commit()
        logger.info(f"Recorded real email open: edition={edition_id}, sub={subscriber_id}")
    except Exception as e:
        logger.error(f"Error recording email open: {e}")
        await db.rollback()

    return Response(
        content=TRANSPARENT_1PX_GIF,
        media_type="image/gif",
        headers={
            "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0, post-check=0, pre-check=0",
            "Pragma": "no-cache",
            "Expires": "0",
        },
    )


# ── 2. Click-Through Redirect (CTR Tracking) ──────────────────────────────────

@router.get("/click")
async def track_link_click(
    request: Request,
    url: str = Query(..., description="Target destination URL"),
    edition_id: Optional[int] = Query(None),
    subscriber_id: Optional[int] = Query(None),
    tag: Optional[str] = Query("github"),
    source: str = Query("email"),
    db: AsyncSession = Depends(get_session),
):
    """
    Transparent redirect for links embedded in newsletter emails.
    Records the click event, specifically identifies GitHub repositories,
    and immediately redirects (307) the user to the destination.
    """
    clean_url = unquote(url).strip()
    is_github = "github.com" in clean_url.lower()
    user_agent = request.headers.get("user-agent")

    try:
        click = LinkClickEvent(
            edition_id=edition_id,
            subscriber_id=subscriber_id,
            url=clean_url,
            is_github=is_github,
            tag=tag or ("github" if is_github else "external"),
            source=source,
            timestamp=datetime.utcnow(),
            user_agent=user_agent[:255] if user_agent else None,
        )
        db.add(click)

        # Update subscriber dispatch summary if available
        if subscriber_id and edition_id:
            query = select(EmailDispatch).where(
                EmailDispatch.edition_id == edition_id,
                EmailDispatch.subscriber_id == subscriber_id,
            )
            res = await db.exec(query)
            dispatch = res.first()
            if dispatch:
                dispatch.links_clicked_count += 1
                if is_github:
                    dispatch.github_clicks_count += 1
                db.add(dispatch)

        await db.commit()
        logger.info(f"Recorded real click: is_github={is_github}, url={clean_url}")
    except Exception as e:
        logger.error(f"Error recording click event: {e}")
        await db.rollback()

    return RedirectResponse(url=clean_url, status_code=status.HTTP_307_TEMPORARY_REDIRECT)


# ── 3. Web Client Click Event (Public Frontend Beacon) ────────────────────────

@router.post("/click-event")
async def record_web_click(
    payload: WebClickPayload,
    request: Request,
    db: AsyncSession = Depends(get_session),
):
    """
    API beacon for web edition visitors clicking GitHub or weight links.
    """
    clean_url = payload.url.strip()
    is_github = payload.is_github if payload.is_github is not None else ("github.com" in clean_url.lower())
    user_agent = request.headers.get("user-agent")

    try:
        click = LinkClickEvent(
            edition_id=payload.edition_id,
            subscriber_id=payload.subscriber_id,
            url=clean_url,
            is_github=is_github,
            tag=payload.tag or ("github" if is_github else "external"),
            source=payload.source or "web",
            timestamp=datetime.utcnow(),
            user_agent=user_agent[:255] if user_agent else None,
        )
        db.add(click)
        await db.commit()
        return {"status": "ok", "is_github": is_github}
    except Exception as e:
        logger.error(f"Error recording web click: {e}")
        await db.rollback()
        return {"status": "error", "detail": str(e)}


# ── 4. Admin Simulation & Test Utility ────────────────────────────────────────

@router.post("/simulate")
async def simulate_tracking_event(
    payload: SimulatePayload,
    db: AsyncSession = Depends(get_session),
):
    """
    Utility endpoint for administrators to simulate a live email open or click
    to verify real-time dashboard updates without needing an external client.
    """
    if payload.action == "open":
        event = EmailOpenEvent(
            edition_id=payload.edition_id,
            subscriber_id=payload.subscriber_id,
            timestamp=datetime.utcnow(),
            user_agent="Admin-Test-Simulator/1.0",
        )
        db.add(event)

        if payload.subscriber_id:
            query = select(EmailDispatch).where(
                EmailDispatch.edition_id == payload.edition_id,
                EmailDispatch.subscriber_id == payload.subscriber_id,
            )
            res = await db.exec(query)
            dispatch = res.first()
            if dispatch:
                dispatch.is_opened = True
                dispatch.open_count += 1
                db.add(dispatch)
            else:
                db.add(EmailDispatch(
                    edition_id=payload.edition_id,
                    subscriber_id=payload.subscriber_id,
                    is_opened=True,
                    open_count=1,
                    opened_at=datetime.utcnow(),
                ))
        await db.commit()
        return {"status": "ok", "action": "open_recorded"}

    elif payload.action == "click":
        url = payload.url or "https://github.com/torvalds/linux"
        is_github = "github.com" in url.lower()
        click = LinkClickEvent(
            edition_id=payload.edition_id,
            subscriber_id=payload.subscriber_id,
            url=url,
            is_github=is_github,
            tag="github",
            source="simulation",
            timestamp=datetime.utcnow(),
            user_agent="Admin-Test-Simulator/1.0",
        )
        db.add(click)

        if payload.subscriber_id:
            query = select(EmailDispatch).where(
                EmailDispatch.edition_id == payload.edition_id,
                EmailDispatch.subscriber_id == payload.subscriber_id,
            )
            res = await db.exec(query)
            dispatch = res.first()
            if dispatch:
                dispatch.links_clicked_count += 1
                if is_github:
                    dispatch.github_clicks_count += 1
                db.add(dispatch)

        await db.commit()
        return {"status": "ok", "action": "click_recorded", "is_github": is_github}

    return {"status": "error", "message": f"Unknown action: {payload.action}"}


# ── 5. Resend Webhook Ingestion ───────────────────────────────────────────────

@router.post("/resend-webhook")
async def resend_webhook(
    request: Request,
    db: AsyncSession = Depends(get_session),
):
    """
    Receives real-time webhook events from Resend (email.opened, email.clicked).
    """
    try:
        body = await request.json()
        event_type = body.get("type")
        data = body.get("data", {})
        email_id = data.get("email_id")
        created_at = datetime.utcnow()

        logger.info(f"Resend webhook event received: {event_type} for email {email_id}")

        if event_type == "email.opened":
            # Find dispatch by resend_email_id
            if email_id:
                res = await db.exec(select(EmailDispatch).where(EmailDispatch.resend_email_id == email_id))
                dispatch = res.first()
                if dispatch:
                    dispatch.is_opened = True
                    dispatch.open_count += 1
                    if not dispatch.opened_at:
                        dispatch.opened_at = created_at
                    db.add(dispatch)
                    db.add(EmailOpenEvent(
                        edition_id=dispatch.edition_id,
                        subscriber_id=dispatch.subscriber_id,
                        timestamp=created_at,
                        user_agent="Resend-Webhook",
                    ))
                    await db.commit()

        elif event_type == "email.clicked":
            click_data = data.get("click", {})
            link_url = click_data.get("link", "")
            is_github = "github.com" in link_url.lower()

            if email_id:
                res = await db.exec(select(EmailDispatch).where(EmailDispatch.resend_email_id == email_id))
                dispatch = res.first()
                edition_id = dispatch.edition_id if dispatch else None
                subscriber_id = dispatch.subscriber_id if dispatch else None
                if dispatch:
                    dispatch.links_clicked_count += 1
                    if is_github:
                        dispatch.github_clicks_count += 1
                    db.add(dispatch)

                db.add(LinkClickEvent(
                    edition_id=edition_id,
                    subscriber_id=subscriber_id,
                    url=link_url,
                    is_github=is_github,
                    tag="github" if is_github else "external",
                    source="resend_webhook",
                    timestamp=created_at,
                ))
                await db.commit()

        return {"status": "processed"}
    except Exception as e:
        logger.error(f"Error processing Resend webhook: {e}")
        return {"status": "error", "detail": str(e)}
