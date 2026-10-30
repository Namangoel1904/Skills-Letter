# BeingNotified Newsletter App

> AI-curated weekly newsletter for developers who vibe-code — powered by **Gemini 3.8 Flash**, **YouTube Data API v3**, **Next.js 15**, and **FastAPI**.

---

## Project Structure

```
Skills Letter/
├── backend/          # FastAPI Python backend
├── frontend/         # Next.js 15 App Router frontend
├── .env.example      # All required environment variables
└── README.md
```

---

## Prerequisites

| Tool | Version |
|---|---|
| Python | 3.11+ |
| Node.js | 22+ |
| pnpm | 9+ |
| PostgreSQL | 15+ (or use Render's free DB) |

---

## Setup

### 1. Clone & configure

```bash
# Copy and fill in the .env file
cp .env.example .env
# Edit .env — add your API keys (YouTube, Gemini, Resend, DB URL)
```

### 2. Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # macOS/Linux
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API docs available at: http://localhost:8000/api/docs

### 3. Frontend

```bash
cd frontend
pnpm install
pnpm dev         # → http://localhost:3000
```

---

## Key Environment Variables

| Variable | Description |
|---|---|
| `YOUTUBE_API_KEY` | YouTube Data API v3 key |
| `YOUTUBE_PLAYLIST_IDS` | Comma-separated: `PLxxx_SavedShorts,PLxxx_TechPicks` |
| `YOUTUBE_PLAYLIST_NAMES` | Friendly names matching above order |
| `GEMINI_API_KEY` | From [Google AI Studio](https://aistudio.google.com) |
| `DATABASE_URL` | PostgreSQL connection string |
| `RESEND_API_KEY` | From [resend.com](https://resend.com) |
| `ADMIN_PASSWORD` | Password for admin endpoints |
| `NEWSLETTER_CRON_DEFAULT` | Cron for auto-generation (default: `30 11 * * 5` = Friday 5PM IST) |

---

## YouTube Playlists Setup

1. **Saved Shorts** — Use your existing YouTube "Saved" playlist for Shorts (get the playlist ID from the URL)
2. **Tech Picks** — Create a new **public** YouTube playlist, add curated videos, copy its ID

> ⚠️ The "Watch Later" playlist requires OAuth 2.0. A public/unlisted playlist with just the API key is simpler and recommended.

---

## Deploying to Render

### Backend (Web Service)
- **Build command**: `pip install -r requirements.txt`
- **Start command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Environment**: Add all `.env` variables in Render's dashboard

### Frontend (Static/Next.js)
- **Build command**: `pnpm install && pnpm build`
- **Start command**: `pnpm start`
- Set `NEXT_PUBLIC_API_URL` to your Render backend URL

### Database
- Create a **PostgreSQL** instance on Render (free tier)
- Copy the internal connection string to `DATABASE_URL`

---

## Newsletter Frequency Logic

Subscribers choose their cadence at sign-up:

| Option | Schedule |
|---|---|
| Daily | Every day |
| 5× / week | Monday – Friday |
| 2× / week | Monday + Thursday |
| Weekly *(default)* | Every Friday at 5 PM IST |

The scheduler runs the generation pipeline on the configured cron. On each run, emails are dispatched only to subscribers whose frequency preference includes that day.

---

## Admin

Trigger manual generation:

```bash
curl -u admin:YOUR_PASSWORD -X POST "http://localhost:8000/api/admin/generate"
# Dry run (no email):
curl -u admin:YOUR_PASSWORD -X POST "http://localhost:8000/api/admin/generate?send_email=false"
```

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 15 (App Router, ISR), Tailwind v4, Radix UI, Framer Motion |
| Backend | FastAPI, SQLModel, APScheduler |
| Database | PostgreSQL (asyncpg) |
| AI | Gemini 3.8 Flash (google-genai SDK) |
| YouTube | Google YouTube Data API v3 |
| Email | Resend |
| Deployment | Render |
