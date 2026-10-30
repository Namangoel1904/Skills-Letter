/**
 * TechPulse — API client (typed fetch wrappers for FastAPI backend)
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export interface VideoSummary {
  video_id: string;
  title: string;
  channel: string;
  url: string;
  thumbnail_url: string;
  duration_seconds: number;
  source_playlist: string;
  category: "github_repo" | "llm_model" | "skill_tool" | "ui_ux" | "other";
  tldr: string;
  key_points: string[];
  repo_links: string[];
  model_links: string[];
  tags: string[];
  published_at?: string;
  why_it_matters?: string;
}

export interface NewsletterEdition {
  id: number;
  title: string;
  edition_number: number;
  generated_at: string;
  playlist_ids: string[];
  video_count: number;
  videos: VideoSummary[];
  content_markdown: string;
  content_html: string;
  status: "draft" | "sent" | "failed";
  sent_at?: string;
  recipients_count: number;
}

export type FrequencyOption = "daily" | "5x_week" | "2x_week" | "weekly";

export interface SubscribePayload {
  email: string;
  name?: string;
  frequency: FrequencyOption;
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail ?? "API request failed");
  }
  return res.json();
}

// ── Newsletter Editions ────────────────────────────────────────────────────

export async function getLatestEdition(): Promise<NewsletterEdition> {
  return apiFetch<NewsletterEdition>("/api/newsletter/editions/latest");
}

export async function getEditions(skip = 0, limit = 20): Promise<NewsletterEdition[]> {
  return apiFetch<NewsletterEdition[]>(`/api/newsletter/editions?skip=${skip}&limit=${limit}`);
}

export async function getEdition(id: number): Promise<NewsletterEdition> {
  return apiFetch<NewsletterEdition>(`/api/newsletter/editions/${id}`);
}

export interface DropDetail {
  item: VideoSummary;
  edition_id: number;
  edition_number: number;
  edition_title: string;
  edition_date: string;
}

export async function getDropDetail(videoId: string): Promise<DropDetail> {
  return apiFetch<DropDetail>(`/api/newsletter/items/${videoId}`);
}

// ── Subscribers ───────────────────────────────────────────────────────────

export async function subscribe(payload: SubscribePayload): Promise<{ id: number; email: string }> {
  return apiFetch("/api/subscribers/subscribe", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function unsubscribe(token: string): Promise<{ message: string }> {
  return apiFetch(`/api/subscribers/unsubscribe?token=${token}`, { method: "POST" });
}

export async function getSubscriberCount(): Promise<{ count: number }> {
  return apiFetch("/api/subscribers/count");
}

// ── Utils ─────────────────────────────────────────────────────────────────

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

export const CATEGORY_META: Record<VideoSummary["category"], { label: string; emoji: string; color: string; description: string }> = {
  github_repo: { label: "Open Source Gems", emoji: "🛠", color: "indigo", description: "Breakthrough repositories, vibe coding tools, and modern frameworks" },
  llm_model:   { label: "Local AI Models",    emoji: "🤖", color: "violet", description: "Quantized checkpoints, Ollama releases, and efficient local weights" },
  skill_tool:  { label: "Skills & Agentics", emoji: "✨", color: "amber",  description: "Claude, Cursor, AntiGravity rules, and agent automations" },
  ui_ux:       { label: "UI / UX Finds",     emoji: "🎨", color: "pink",   description: "Shadcn components, design systems, and micro-interactions" },
  other:       { label: "Curated Technical Drops", emoji: "📦", color: "slate", description: "Deep dives and architecture discussions" },
};

export const FREQUENCY_OPTIONS: { value: FrequencyOption; label: string; description: string }[] = [
  { value: "daily",     label: "Daily",       description: "Every day" },
  { value: "5x_week",  label: "5× / week",   description: "Monday – Friday" },
  { value: "2x_week",  label: "2× / week",   description: "Monday & Thursday" },
  { value: "weekly",   label: "Weekly",      description: "Every Friday · 5 PM IST (default)" },
];
