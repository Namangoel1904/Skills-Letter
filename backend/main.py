"""
Being Notified — FastAPI Application Entry Point
"""
from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import get_settings
from database import init_db
from routers import newsletter, subscribers, admin
from scheduler import start_scheduler, stop_scheduler

# ── Logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)
settings = get_settings()


# ── App lifecycle ─────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown lifecycle handler."""
    logger.info("🚀 Being Notified backend starting up...")
    await init_db()
    start_scheduler()
    yield
    logger.info("👋 Being Notified backend shutting down...")
    stop_scheduler()


# ── FastAPI app ───────────────────────────────────────────────────────────────

app = FastAPI(
    title="Being Notified Newsletter API",
    description="Backend for Being Notified — powered by Gemini AI",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# CORS — allow Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────

app.include_router(newsletter.router)
app.include_router(subscribers.router)
app.include_router(admin.router)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "Being Notified Newsletter API"}
