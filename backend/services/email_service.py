"""
TechPulse Newsletter — Email Service (Resend)
Handles rendering and sending newsletter emails with per-subscriber frequency logic,
schedule mappings, and subscription confirmation welcome emails.
"""
from __future__ import annotations

import logging
from datetime import datetime, date, timedelta
from typing import List, Optional

import resend
import markdown as md

from config import get_settings
from models import Subscriber, FrequencyOption, NewsletterEdition

logger = logging.getLogger(__name__)
settings = get_settings()


def _init_resend():
    resend.api_key = settings.resend_api_key


def get_sender_email() -> str:
    """
    Resolve sender email address.
    Resend rejects unverified consumer domains like @gmail.com or @yahoo.com.
    If an unverified consumer domain is configured, fallback to Resend's testing sandbox 'onboarding@resend.dev'.
    """
    from_addr = (settings.from_email or "").strip()
    consumer_domains = ["@gmail.com", "@yahoo.com", "@outlook.com", "@hotmail.com", "@icloud.com"]
    if not from_addr or any(d in from_addr.lower() for d in consumer_domains):
        return "onboarding@resend.dev"
    return from_addr


# ─────────────────────────────────────────────────────────────────────────────
#  Frequency Schedule Mappings
# ─────────────────────────────────────────────────────────────────────────────

FREQUENCY_SCHEDULE_MAP = {
    FrequencyOption.weekly: {
        "label": "Weekly Flagship",
        "badge": "Weekly",
        "days": "Every Friday at 5:00 PM IST (11:30 UTC)",
        "description": "Weekly comprehensive technical intel & top curated picks",
    },
    FrequencyOption.twice_per_week: {
        "label": "2× / week Dispatch",
        "badge": "2x Weekly",
        "days": "Every Monday & Thursday at 5:00 PM IST",
        "description": "Start-of-week & mid-week distilled technical updates",
    },
    FrequencyOption.five_per_week: {
        "label": "5× / week Dispatch",
        "badge": "Mon – Fri",
        "days": "Monday through Friday (Every Weekday) at 5:00 PM IST",
        "description": "Daily weekday radar for active vibe-coders",
    },
    FrequencyOption.daily: {
        "label": "Daily Morning Drops",
        "badge": "Every Day",
        "days": "Monday through Sunday (All 7 Days)",
        "description": "Continuous 7-day flow of new technical drops",
    },
}


def should_send_today(frequency: FrequencyOption) -> bool:
    """
    Determine if a subscriber with this frequency preference should receive
    an email today based on the day of the week.
    
    Schedule mapping:
    - weekly    → Friday only (day 4)
    - 5x_week   → Mon–Fri (days 0, 1, 2, 3, 4)
    - 2x_week   → Monday + Thursday (days 0, 3)
    - daily     → Every day (days 0..6)
    """
    today = date.today().weekday()  # 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri, 5=Sat, 6=Sun

    if frequency == FrequencyOption.daily:
        return True
    elif frequency == FrequencyOption.five_per_week:
        return today < 5  # Mon–Fri
    elif frequency == FrequencyOption.twice_per_week:
        return today in (0, 3)  # Monday & Thursday
    elif frequency == FrequencyOption.weekly:
        return today == 4  # Friday
    return False


# ─────────────────────────────────────────────────────────────────────────────
#  Email Rendering (Jinja2)
# ─────────────────────────────────────────────────────────────────────────────

def render_email_html(edition: NewsletterEdition, unsubscribe_url: str) -> str:
    """
    Convert newsletter markdown + structured video cards → full HTML email using Jinja2 template.
    """
    from jinja2 import Environment, FileSystemLoader, select_autoescape
    import os

    template_dir = os.path.join(os.path.dirname(__file__), "..", "templates")
    env = Environment(
        loader=FileSystemLoader(template_dir),
        autoescape=select_autoescape(["html"]),
    )
    template = env.get_template("newsletter_email.html")

    # Group videos by category for structured card presentation
    category_order = ["github_repo", "llm_model", "skill_tool", "ui_ux", "other"]
    category_meta = {
        "github_repo": {
            "label": "Open Source Gems & Frameworks",
            "icon": "🛠",
            "description": "Breakthrough repositories & vibe-coding tooling",
        },
        "llm_model": {
            "label": "Local AI Models & Weights",
            "icon": "🤖",
            "description": "Quantized weights & local inference checkpoints",
        },
        "skill_tool": {
            "label": "Agentic Skills & Prompts",
            "icon": "✨",
            "description": "Cursor rules, Claude instructions & AGY prompts",
        },
        "ui_ux": {
            "label": "UI / UX & Component Kits",
            "icon": "🎨",
            "description": "Design systems, Shadcn expansions & micro-interactions",
        },
        "other": {
            "label": "Architectures & Deep Dives",
            "icon": "📦",
            "description": "System design & engineering technical discussions",
        },
    }

    categorized_videos = []
    videos = edition.videos or []
    for cat_key in category_order:
        cat_videos = [v for v in videos if v.get("category") == cat_key]
        if cat_videos:
            categorized_videos.append({
                "key": cat_key,
                "meta": category_meta.get(cat_key, category_meta["other"]),
                "videos": cat_videos,
            })

    known_cats = set(category_order)
    other_extras = [v for v in videos if v.get("category") not in known_cats]
    if other_extras:
        categorized_videos.append({
            "key": "other",
            "meta": category_meta["other"],
            "videos": other_extras,
        })

    # Extract editorial intro from content_markdown (text before the first ##)
    editorial_intro = ""
    if edition.content_markdown:
        parts = edition.content_markdown.split("## ", 1)
        raw_intro = parts[0].strip()
        lines = [
            l for l in raw_intro.split("\n")
            if not l.startswith("#")
            and not l.startswith("**Date")
            and not l.startswith("Date:")
            and not l.startswith("---")
        ]
        editorial_intro = " ".join(l.strip() for l in lines if l.strip())

    content_html = md.markdown(
        edition.content_markdown or "",
        extensions=["extra", "codehilite", "nl2br"],
    )

    return template.render(
        edition=edition,
        categorized_videos=categorized_videos,
        editorial_intro=editorial_intro,
        content_html=content_html,
        unsubscribe_url=unsubscribe_url,
        frontend_url=settings.frontend_url,
        year=datetime.utcnow().year,
    )


def render_welcome_email_html(
    subscriber: Subscriber,
    latest_edition: Optional[NewsletterEdition],
    unsubscribe_url: str,
) -> str:
    """
    Render confirmation welcome email informing subscriber of their exact schedule.
    """
    from jinja2 import Environment, FileSystemLoader, select_autoescape
    import os

    template_dir = os.path.join(os.path.dirname(__file__), "..", "templates")
    env = Environment(
        loader=FileSystemLoader(template_dir),
        autoescape=select_autoescape(["html"]),
    )
    template = env.get_template("welcome_email.html")

    schedule_info = FREQUENCY_SCHEDULE_MAP.get(
        subscriber.frequency,
        {
            "label": "Weekly Flagship",
            "days": "Every Friday at 5:00 PM IST",
            "description": "Weekly technical intel",
        },
    )

    return template.render(
        subscriber=subscriber,
        frequency_label=schedule_info["label"],
        delivery_days=schedule_info["days"],
        delivery_description=schedule_info["description"],
        latest_edition=latest_edition,
        unsubscribe_url=unsubscribe_url,
        frontend_url=settings.frontend_url,
        year=datetime.utcnow().year,
    )


# ─────────────────────────────────────────────────────────────────────────────
#  Dispatch Functions
# ─────────────────────────────────────────────────────────────────────────────

def send_welcome_email(
    subscriber: Subscriber,
    latest_edition: Optional[NewsletterEdition] = None,
) -> bool:
    """
    Send an immediate confirmation/welcome email to a newly subscribed or reactivated user.
    """
    _init_resend()
    if not settings.resend_api_key:
        logger.warning("RESEND_API_KEY is not configured — skipping welcome email")
        return False

    unsubscribe_url = (
        f"{settings.frontend_url}/unsubscribe?token={subscriber.unsubscribe_token}"
    )

    schedule_info = FREQUENCY_SCHEDULE_MAP.get(
        subscriber.frequency,
        {"label": "Weekly Dispatch", "days": "Every Friday at 5:00 PM IST"},
    )

    try:
        html_body = render_welcome_email_html(subscriber, latest_edition, unsubscribe_url)

        resend.Emails.send({
            "from": f"{settings.from_name} <{get_sender_email()}>",
            "to": subscriber.email,
            "subject": f"⚡ Welcome to TechPulse — Subscription Confirmed ({schedule_info['label']})",
            "html": html_body,
        })
        logger.info(f"Successfully sent welcome confirmation email to {subscriber.email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send welcome confirmation email to {subscriber.email}: {e}")
        return False


def send_newsletter(
    edition: NewsletterEdition,
    subscribers: List[Subscriber],
) -> int:
    """
    Send the newsletter to all eligible subscribers (respecting frequency prefs and signup date).
    Subscribers ONLY receive editions generated from the time they subscribed forward.
    Returns the count of emails actually sent.
    """
    _init_resend()
    sent_count = 0

    # Tolerance for editions sent right after generation
    cutoff_time = (edition.generated_at or datetime.utcnow()) + timedelta(minutes=15)

    eligible = [
        s for s in subscribers
        if s.is_active
        and should_send_today(s.frequency)
        and (s.subscribed_at <= cutoff_time)
    ]

    logger.info(
        f"Sending edition #{edition.edition_number} to {len(eligible)}/{len(subscribers)} subscribers"
    )

    for subscriber in eligible:
        unsubscribe_url = (
            f"{settings.frontend_url}/unsubscribe?token={subscriber.unsubscribe_token}"
        )
        try:
            html_body = render_email_html(edition, unsubscribe_url)

            resend.Emails.send({
                "from": f"{settings.from_name} <{get_sender_email()}>",
                "to": subscriber.email,
                "subject": f"⚡ {edition.title}",
                "html": html_body,
            })
            sent_count += 1
            logger.debug(f"Sent to {subscriber.email}")
        except Exception as e:
            logger.error(f"Failed to send to {subscriber.email}: {e}")

    return sent_count
