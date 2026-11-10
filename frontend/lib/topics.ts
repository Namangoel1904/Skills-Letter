import type { VideoSummary } from "@/lib/api";

/** Display labels for the backend's real video categories. */
export const CATEGORY_LABEL: Record<VideoSummary["category"], string> = {
  github_repo: "Open Source",
  llm_model: "Local Models",
  skill_tool: "Skills & Agents",
  ui_ux: "UI / UX",
  other: "Deep Dives",
};

export const CATEGORY_ORDER: VideoSummary["category"][] = ["github_repo", "llm_model", "skill_tool", "ui_ux", "other"];

export const CATEGORY_BLURB: Record<VideoSummary["category"], string> = {
  github_repo: "Repositories, frameworks and developer tools worth bookmarking.",
  llm_model: "Local and quantized models you can actually run.",
  skill_tool: "Agent workflows, prompts and automation skills.",
  ui_ux: "Component libraries, design systems and interaction craft.",
  other: "Architecture discussions and long-form technical dives.",
};

export function categoryLabel(c: string) {
  return CATEGORY_LABEL[c as VideoSummary["category"]] ?? CATEGORY_LABEL.other;
}

export function normalizeTag(t: string) {
  return t.trim().toLowerCase().replace(/^#/, "");
}
