import { getLatestEdition } from "@/lib/api";
import { LatestIntelClient } from "./latest-intel-client";

export const revalidate = 60;

export default async function LatestIntelPage() {
  const edition = await getLatestEdition().catch(() => null);

  // Group videos/items by category
  const categories = [
    {
      id: "github_repo",
      title: "Open Source Gems & Frameworks",
      badge: "Repositories",
      emoji: "🛠",
      description: "Direct links to production-ready open source codebases, UI kits, and developer tools.",
      items: (edition?.videos || []).filter((v) => v.category === "github_repo"),
    },
    {
      id: "llm_model",
      title: "Local Weights & Quantized Models",
      badge: "LLM Drops",
      emoji: "🤖",
      description: "Small footprint models you can run locally on your laptop without cloud GPUs.",
      items: (edition?.videos || []).filter((v) => v.category === "llm_model"),
    },
    {
      id: "skill_tool",
      title: "Agentic Skills & Cursor/Claude Prompts",
      badge: "Workflows",
      emoji: "✨",
      description: "Cursor rules, Claude instructions, and AntiGravity skill files to automate vibe-coding.",
      items: (edition?.videos || []).filter((v) => v.category === "skill_tool"),
    },
    {
      id: "ui_ux",
      title: "UI / UX & Component Libraries",
      badge: "Design Engineering",
      emoji: "🎨",
      description: "Shadcn expansions, micro-interactions, and high-craft web components.",
      items: (edition?.videos || []).filter((v) => v.category === "ui_ux"),
    },
    {
      id: "other",
      title: "Architectures & Technical Insights",
      badge: "Deep Dives",
      emoji: "📦",
      description: "Engineering concepts, system designs, and productivity hacks.",
      items: (edition?.videos || []).filter((v) => v.category === "other"),
    },
  ].filter((c) => c.items.length > 0);

  return <LatestIntelClient edition={edition} categories={categories} />;
}
