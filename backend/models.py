"""
TechPulse Newsletter — Database Models (SQLModel + PostgreSQL)
"""
from __future__ import annotations

import uuid
from datetime import datetime
from enum import Enum
from typing import List, Optional

from sqlmodel import JSON, Column, Field, Relationship, SQLModel


# ─────────────────────────────────────────────────────────────────────────────
#  Enums
# ─────────────────────────────────────────────────────────────────────────────

class NewsletterStatus(str, Enum):
    draft = "draft"
    sent = "sent"
    failed = "failed"


class VideoCategory(str, Enum):
    github_repo = "github_repo"       # Open-source repo / vibe-coding tool
    llm_model = "llm_model"           # Quantised / local LLM
    skill_tool = "skill_tool"         # Claude / Cursor / AGY skill / .md files
    ui_ux = "ui_ux"                   # UI/UX library or design tool
    other = "other"


class FrequencyOption(str, Enum):
    daily = "daily"               # 7x / week
    five_per_week = "5x_week"     # Mon–Fri
    twice_per_week = "2x_week"    # Mon + Thu
    weekly = "weekly"             # Once (default: Friday)


class SourcePlaylist(str, Enum):
    saved_shorts = "saved_shorts"
    tech_picks = "tech_picks"


# ─────────────────────────────────────────────────────────────────────────────
#  Video Summary (stored as JSON inside NewsletterEdition)
# ─────────────────────────────────────────────────────────────────────────────

class VideoSummary(SQLModel):
    video_id: str
    title: str
    channel: str
    url: str
    thumbnail_url: str
    duration_seconds: int
    source_playlist: str
    category: VideoCategory
    tldr: str                       # One-liner summary
    key_points: List[str]           # Bullet points
    repo_links: List[str]           # GitHub URLs extracted
    model_links: List[str]          # HuggingFace / Ollama / Hugging Face links
    tags: List[str]
    published_at: Optional[str] = None


# ─────────────────────────────────────────────────────────────────────────────
#  Newsletter Edition
# ─────────────────────────────────────────────────────────────────────────────

class NewsletterEditionBase(SQLModel):
    title: str
    edition_number: int
    generated_at: datetime = Field(default_factory=datetime.utcnow)
    playlist_ids: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    video_count: int = 0
    videos: List[dict] = Field(default_factory=list, sa_column=Column(JSON))
    content_markdown: str = ""
    content_html: str = ""
    status: NewsletterStatus = NewsletterStatus.draft
    sent_at: Optional[datetime] = None
    recipients_count: int = 0


class NewsletterEdition(NewsletterEditionBase, table=True):
    __tablename__ = "newsletter_editions"

    id: Optional[int] = Field(default=None, primary_key=True)


class NewsletterEditionRead(NewsletterEditionBase):
    id: int


# ─────────────────────────────────────────────────────────────────────────────
#  Subscriber
# ─────────────────────────────────────────────────────────────────────────────

class SubscriberBase(SQLModel):
    email: str = Field(index=True, unique=True)
    name: Optional[str] = None
    frequency: FrequencyOption = FrequencyOption.weekly
    is_active: bool = True


class Subscriber(SubscriberBase, table=True):
    __tablename__ = "subscribers"

    id: Optional[int] = Field(default=None, primary_key=True)
    subscribed_at: datetime = Field(default_factory=datetime.utcnow)
    unsubscribe_token: str = Field(default_factory=lambda: str(uuid.uuid4()))


class SubscriberCreate(SQLModel):
    email: str
    name: Optional[str] = None
    frequency: FrequencyOption = FrequencyOption.weekly


class SubscriberRead(SubscriberBase):
    id: int
    subscribed_at: datetime


# ─────────────────────────────────────────────────────────────────────────────
#  Processed Video (track which videos have already been summarised)
# ─────────────────────────────────────────────────────────────────────────────

class ProcessedVideo(SQLModel, table=True):
    __tablename__ = "processed_videos"

    id: Optional[int] = Field(default=None, primary_key=True)
    video_id: str = Field(index=True, unique=True)
    edition_id: int = Field(foreign_key="newsletter_editions.id")
    processed_at: datetime = Field(default_factory=datetime.utcnow)
    source_playlist: str = ""


# ─────────────────────────────────────────────────────────────────────────────
#  Email Engagement & Click Telemetry Models
# ─────────────────────────────────────────────────────────────────────────────

class EmailDispatch(SQLModel, table=True):
    __tablename__ = "email_dispatches"

    id: Optional[int] = Field(default=None, primary_key=True)
    edition_id: int = Field(index=True)
    subscriber_id: int = Field(index=True)
    resend_email_id: Optional[str] = None
    sent_at: datetime = Field(default_factory=datetime.utcnow)
    is_opened: bool = Field(default=False, index=True)
    opened_at: Optional[datetime] = None
    open_count: int = Field(default=0)
    links_clicked_count: int = Field(default=0)
    github_clicks_count: int = Field(default=0)


class EmailOpenEvent(SQLModel, table=True):
    __tablename__ = "email_open_events"

    id: Optional[int] = Field(default=None, primary_key=True)
    edition_id: int = Field(index=True)
    subscriber_id: Optional[int] = Field(default=None, index=True)
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    user_agent: Optional[str] = None
    ip_address: Optional[str] = None


class LinkClickEvent(SQLModel, table=True):
    __tablename__ = "link_click_events"

    id: Optional[int] = Field(default=None, primary_key=True)
    edition_id: Optional[int] = Field(default=None, index=True)
    subscriber_id: Optional[int] = Field(default=None, index=True)
    url: str
    is_github: bool = Field(default=False, index=True)
    tag: str = "github"
    source: str = "email"  # "email" or "web"
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    user_agent: Optional[str] = None
