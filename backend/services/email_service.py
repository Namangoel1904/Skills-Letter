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

def render_email_html(
    edition: NewsletterEdition,
    unsubscribe_url: str,
    subscriber_frequency_label: Optional[str] = None,
    subscriber_email: Optional[str] = None,
) -> str:
    """
    Convert newsletter markdown + structured video cards → full high-fashion Magazine-style HTML email.
    Inspired by L'Officiel / Vogue / MAGZY editorial layouts with cover hero, 2-column spread,
    vibrant editorial accents, and circular action triggers.
    """
    from jinja2 import Environment, FileSystemLoader, select_autoescape
    import os

    template_dir = os.path.join(os.path.dirname(__file__), "..", "templates")
    env = Environment(
        loader=FileSystemLoader(template_dir),
        autoescape=select_autoescape(["html"]),
    )
    template = env.get_template("newsletter_email.html")

    category_meta = {
        "github_repo": {
            "label": "Open Source Gems & Frameworks",
            "short": "Open Source",
            "icon": "🛠",
            "color": "#047857",
            "bg": "#ecfdf5",
            "border": "#a7f3d0",
            "description": "Breakthrough repositories & vibe-coding tooling",
        },
        "llm_model": {
            "label": "Local AI Models & Weights",
            "short": "Local AI",
            "icon": "🤖",
            "color": "#6d28d9",
            "bg": "#f5f3ff",
            "border": "#ddd6fe",
            "description": "Quantized weights & local inference checkpoints",
        },
        "skill_tool": {
            "label": "Agentic Skills & Prompts",
            "short": "Agentic Tools",
            "icon": "✨",
            "color": "#b45309",
            "bg": "#fffbeb",
            "border": "#fde68a",
            "description": "Cursor rules, Claude instructions & AGY prompts",
        },
        "ui_ux": {
            "label": "UI / UX & Component Kits",
            "short": "Design & UI",
            "icon": "🎨",
            "color": "#be123c",
            "bg": "#fff1f2",
            "border": "#fecdd3",
            "description": "Design systems, Shadcn expansions & micro-interactions",
        },
        "other": {
            "label": "Architectures & Deep Dives",
            "short": "Engineering",
            "icon": "📦",
            "color": "#0e7490",
            "bg": "#ecfeff",
            "border": "#a5f3fc",
            "description": "System design & engineering technical discussions",
        },
    }

    raw_videos = edition.videos or []
    cover_story = None
    editorial_pairs = []
    numbered_briefs = []
    resource_directory = []

    if raw_videos:
        # 1. Lead Cover Story
        c = dict(raw_videos[0])
        dur = c.get("duration_seconds", 0)
        c["duration_text"] = f"{max(dur // 60, 3)} min read" if dur else "Deep Dive"
        cmeta = category_meta.get(c.get("category"), category_meta["other"])
        c["category_label"] = cmeta["label"]
        c["category_short"] = cmeta["short"]
        c["category_color"] = cmeta["color"]
        c["category_bg"] = cmeta["bg"]
        c["category_border"] = cmeta["border"]
        c["category_icon"] = cmeta["icon"]
        cover_story = c

        # 2. Stories for 2-column editorial grid & numbered briefs
        rest = [dict(v) for v in raw_videos[1:]]
        max_grid = 4 if len(rest) > 6 else 6
        grid_items = rest[:max_grid]
        brief_items = rest[max_grid:]

        for i in range(0, len(grid_items), 2):
            pair = grid_items[i : i + 2]
            for itm in pair:
                imeta = category_meta.get(itm.get("category"), category_meta["other"])
                itm["category_short"] = imeta["short"]
                itm["category_color"] = imeta["color"]
                itm["category_bg"] = imeta["bg"]
                itm["category_border"] = imeta["border"]
                itm["category_icon"] = imeta["icon"]
            editorial_pairs.append(pair)

        for idx, itm in enumerate(brief_items):
            imeta = category_meta.get(itm.get("category"), category_meta["other"])
            itm["category_short"] = imeta["short"]
            itm["category_color"] = imeta["color"]
            itm["category_bg"] = imeta["bg"]
            itm["category_border"] = imeta["border"]
            itm["category_icon"] = imeta["icon"]
            itm["num_str"] = f"{idx + 1:02d}"
            numbered_briefs.append(itm)

        # 3. Clean & Deduplicated Resource Directory (No line-breaking bugs!)
        seen_urls = set()
        for v in raw_videos:
            raw_title = (v.get("title") or "Technical Resource").strip()
            clean_title = raw_title[:46] + ("…" if len(raw_title) > 46 else "")

            for r in (v.get("repo_links") or []):
                r = r.strip()
                if r and r not in seen_urls:
                    seen_urls.add(r)
                    repo_parts = r.rstrip("/").split("/")
                    repo_label = "/".join(repo_parts[-2:]) if len(repo_parts) >= 2 and not repo_parts[-2].endswith(".com") else repo_parts[-1]
                    resource_directory.append({
                        "title": raw_title,
                        "clean_title": clean_title,
                        "repo_label": repo_label,
                        "url": r,
                        "type": "GitHub",
                        "badge_color": "#047857",
                        "badge_bg": "#ecfdf5",
                        "badge_border": "#a7f3d0",
                        "channel": v.get("channel", "Community"),
                        "video_id": v.get("video_id"),
                    })

            for m in (v.get("model_links") or []):
                m = m.strip()
                if m and m not in seen_urls:
                    seen_urls.add(m)
                    model_parts = m.rstrip("/").split("/")
                    model_label = "/".join(model_parts[-2:]) if len(model_parts) >= 2 and not model_parts[-2].endswith(".co") else model_parts[-1]
                    resource_directory.append({
                        "title": raw_title,
                        "clean_title": clean_title,
                        "repo_label": model_label,
                        "url": m,
                        "type": "Weights",
                        "badge_color": "#6d28d9",
                        "badge_bg": "#f5f3ff",
                        "badge_border": "#ddd6fe",
                        "channel": v.get("channel", "Community"),
                        "video_id": v.get("video_id"),
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

    issue_date_str = (
        edition.generated_at.strftime("%B %d, %Y")
        if edition.generated_at
        else datetime.utcnow().strftime("%B %d, %Y")
    )

    return template.render(
        edition=edition,
        cover_story=cover_story,
        editorial_pairs=editorial_pairs,
        numbered_briefs=numbered_briefs,
        resource_directory=resource_directory,
        editorial_intro=editorial_intro,
        content_html=content_html,
        issue_date_str=issue_date_str,
        subscriber_frequency_label=subscriber_frequency_label,
        subscriber_email=subscriber_email,
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
            "subject": f"Welcome to Notified — Subscription Confirmed ({schedule_info['label']})",
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
            freq_label = FREQUENCY_SCHEDULE_MAP.get(subscriber.frequency, {}).get("label", "Weekly Flagship")
            html_body = render_email_html(
                edition,
                unsubscribe_url,
                subscriber_frequency_label=freq_label,
                subscriber_email=subscriber.email,
            )

            # Professional subject without emojis
            raw_title = (edition.title or "").replace("⚡", "").replace("TechPulse", "Notified").strip()
            if not raw_title.lower().startswith("notified"):
                subject = f"Notified Issue #{edition.edition_number}: {raw_title}"
            else:
                subject = raw_title

            resend.Emails.send({
                "from": f"{settings.from_name} <{get_sender_email()}>",
                "to": subscriber.email,
                "subject": subject,
                "html": html_body,
            })
            sent_count += 1
            logger.debug(f"Sent to {subscriber.email}")
        except Exception as e:
            logger.error(f"Failed to send to {subscriber.email}: {e}")

    return sent_count
