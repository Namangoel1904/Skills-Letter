# Deploying BeingNotified Skill Letter on Render

This guide outlines the complete process for deploying the **BeingNotified Skill Letter** application (PostgreSQL + FastAPI Backend + Next.js 15 Frontend) on [Render](https://render.com).

---

## Method 1: Instant Blueprint Deployment (Recommended)

Render Blueprints automatically provisions the managed database, backend, and frontend in one step using the root `render.yaml`.

1. Push your repository to **GitHub**:
   ```bash
   git push origin main
   ```
2. Log into [dashboard.render.com](https://dashboard.render.com).
3. Click **New +** in the top navigation and select **Blueprint**.
4. Connect your GitHub repository (`Skills-Letter`).
5. Render will automatically read `render.yaml` and show:
   - **skill-letter-db** (Managed PostgreSQL)
   - **skill-letter-api** (FastAPI Python Web Service)
   - **skill-letter-frontend** (Next.js Node Web Service)
6. Fill in the required secret environment variables under `skill-letter-api`:
   - `GEMINI_API_KEY`: Your key from [Google AI Studio](https://aistudio.google.com).
   - `YOUTUBE_API_KEY`: Your YouTube Data API v3 key from Google Cloud Console.
   - `YOUTUBE_PLAYLIST_IDS`: `PLT57M0_CWy0E`
   - `RESEND_API_KEY`: Your API key from [Resend](https://resend.com).
7. Click **Apply**. Render will deploy all three components automatically.

---

## Method 2: Manual Service Creation

If you prefer to configure each service manually in the Render dashboard:

### Step 1: Create PostgreSQL Database
1. Go to **New +** → **PostgreSQL**.
2. **Name**: `skill-letter-db`
3. **Database**: `skill_letter`
4. **User**: `skill_letter_user`
5. **Plan**: Free
6. Click **Create Database**. Copy the **Internal Database URL** once provisioned.

---

### Step 2: Deploy Backend Web Service (FastAPI)
1. Go to **New +** → **Web Service**.
2. Connect your GitHub repository.
3. Configure the service settings:
   - **Name**: `skill-letter-api`
   - **Language**: `Python 3`
   - **Branch**: `main`
   - **Region**: Same region as your database
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Health Check Path**: `/health`
4. Under **Environment Variables**, add:
   | Key | Value / Source |
   |---|---|
   | `DATABASE_URL` | Paste your Internal Database URL from Step 1 |
   | `PYTHON_VERSION` | `3.11.9` |
   | `GEMINI_API_KEY` | Your Google Gemini API Key |
   | `YOUTUBE_API_KEY` | Your YouTube Data API v3 Key |
   | `YOUTUBE_PLAYLIST_IDS` | `PLT57M0_CWy0E` |
   | `YOUTUBE_PLAYLIST_NAMES` | `Skill Letter` |
   | `RESEND_API_KEY` | Your Resend API Key |
   | `FROM_EMAIL` | `onboarding@resend.dev` |
   | `FROM_NAME` | `Skill Letter` |
   | `ADMIN_PASSWORD` | Strong password for the admin console |
   | `SCHEDULER_TIMEZONE` | `Asia/Kolkata` |
   | `FRONTEND_URL` | Your frontend Render URL (e.g. `https://skill-letter-frontend.onrender.com`) |
5. Click **Deploy Web Service**.
6. Once deployed, test the health check: `https://<your-backend>.onrender.com/health` (should return `{"status": "ok"}`).

---

### Step 3: Deploy Frontend Web Service (Next.js)
1. Go to **New +** → **Web Service**.
2. Connect the same GitHub repository.
3. Configure the service settings:
   - **Name**: `skill-letter-frontend`
   - **Language**: `Node`
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `pnpm install && pnpm build`
   - **Start Command**: `pnpm start`
4. Under **Environment Variables**, add:
   | Key | Value |
   |---|---|
   | `NODE_VERSION` | `20.18.0` |
   | `NEXT_PUBLIC_API_URL` | `https://<your-backend>.onrender.com` (from Step 2) |
5. Click **Deploy Web Service**.

---

## Verifying Deployment
1. Visit your frontend URL: `https://<your-frontend>.onrender.com`.
2. Verify:
   - Root page `/` displays video loop, wordmark animation, and action pills.
   - Latest Intel `/latest` renders the full dispatch catalog without errors.
   - Subscribing opens the modal and sends confirmation email.
   - `/admin` logs in with your `ADMIN_PASSWORD`.

