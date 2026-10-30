"""
TechPulse Newsletter — Email Service (Resend)
Handles rendering and sending newsletter emails with per-subscriber frequency logic.
"""
from __future__ import annotations

import logging
from datetime import datetime, date
from typing import List

import resend
import markdown as md

from config import get_settings
from models import Subscriber, FrequencyOption, NewsletterEdition

logger = logging.getLogger(__name__)
settings = get_settings()


def _init_resend():
    resend.api_key = settings.resend_api_key


def should_send_today(frequency: FrequencyOption) -> bool:
    """
    Determine if a subscriber with this frequency preference should receive
    an email today based on the day of the week.
    
    Schedule mapping:
    - weekly    → Friday only
    - 5x_week   → Mon–Fri
    - 2x_week   → Monday + Thursday
    - daily     → Every day
    """
    today = date.today().weekday()  # 0=Mon, 4=Fri, 5=Sat, 6=Sun

    if frequency == FrequencyOption.daily:
        return True
    elif frequency == FrequencyOption.five_per_week:
        return today < 5  # Mon–Fri
    elif frequency == FrequencyOption.twice_per_week:
        return today in (0, 3)  # Monday + Thursday
    elif frequency == FrequencyOption.weekly:
        return today == 4  # Friday
    return False


def render_email_html(edition: NewsletterEdition, unsubscribe_url: str) -> str:
    """
    Convert newsletter markdown → full HTML email using Jinja2 template.
    """
    from jinja2 import Environment, FileSystemLoader, select_autoescape
    import os

    template_dir = os.path.join(os.path.dirname(__file__), "..", "templates")
    env = Environment(
        loader=FileSystemLoader(template_dir),
        autoescape=select_autoescape(["html"]),
    )
    template = env.get_template("newsletter_email.html")

    content_html = md.markdown(
        edition.content_markdown,
        extensions=["extra", "codehilite", "nl2br"],
    )

    return template.render(
        edition=edition,
        content_html=content_html,
        unsubscribe_url=unsubscribe_url,
        frontend_url=settings.frontend_url,
        year=datetime.utcnow().year,
    )


def send_newsletter(
    edition: NewsletterEdition,
    subscribers: List[Subscriber],
) -> int:
    """
    Send the newsletter to all eligible subscribers (respecting frequency prefs).
    Returns the count of emails actually sent.
    """
    _init_resend()
    sent_count = 0

    eligible = [s for s in subscribers if s.is_active and should_send_today(s.frequency)]

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
                "from": f"{settings.from_name} <{settings.from_email}>",
                "to": subscriber.email,
                "subject": f"⚡ {edition.title}",
                "html": html_body,
            })
            sent_count += 1
            logger.debug(f"Sent to {subscriber.email}")
        except Exception as e:
            logger.error(f"Failed to send to {subscriber.email}: {e}")

    return sent_count
