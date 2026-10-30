"""
TechPulse Newsletter — Manual Generator CLI
Run this script from the backend directory to trigger newsletter generation.

Usage:
    python generate.py               # Generates draft edition without sending emails
    python generate.py --send-email   # Generates edition and sends to all active subscribers
"""
from __future__ import annotations

import argparse
import asyncio
import logging
import sys

# Ensure UTF-8 output on Windows consoles
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

from database import AsyncSessionLocal
from services.newsletter_service import generate_newsletter

# Configure formatted logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("generator")


async def run_pipeline(send_email: bool = False):
    logger.info(f"Starting newsletter generation (send_email={send_email})...")
    
    async with AsyncSessionLocal() as session:
        try:
            edition = await generate_newsletter(db=session, send_email=send_email)
            if edition:
                print("\n" + "=" * 60)
                print(f"🎉 SUCCESS: Generated Edition #{edition.edition_number}")
                print(f"📰 Title: {edition.title}")
                print(f"📹 Curated Videos: {edition.video_count}")
                print(f"📬 Status: {edition.status}")
                if send_email:
                    print(f"✉️  Dispatched to: {edition.recipients_count} subscribers")
                print("=" * 60 + "\n")
            else:
                print("\n" + "-" * 60)
                print("ℹ️  No new videos found in configured playlists since last edition.")
                print("   (All playlist items have already been processed)")
                print("-" * 60 + "\n")
        except Exception as e:
            logger.error(f"Generation failed: {e}", exc_info=True)
            sys.exit(1)


def main():
    parser = argparse.ArgumentParser(description="Generate a TechPulse Newsletter Edition")
    parser.add_argument(
        "--send-email",
        action="store_true",
        help="Send emails to active subscribers after generating (defaults to preview mode: false)",
    )
    args = parser.parse_args()
    asyncio.run(run_pipeline(send_email=args.send_email))


if __name__ == "__main__":
    main()
