import { Archive, Bookmark, BellRing, Compass, Hash, Home, ListVideo, Newspaper, Settings, ShieldCheck, type LucideIcon } from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  admin?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/", icon: Home },
  { label: "Latest Digest", href: "/latest", icon: Newspaper },
  { label: "My Playlists", href: "/playlists", icon: ListVideo },
  { label: "Discover", href: "/discover", icon: Compass },
  { label: "Topics", href: "/topics", icon: Hash },
  { label: "Saved", href: "/saved", icon: Bookmark },
  { label: "Archive", href: "/archive", icon: Archive },
  { label: "Subscriptions", href: "/subscriptions", icon: BellRing },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Admin Console", href: "/admin", icon: ShieldCheck, admin: true },
];

export const ADMIN_TOKEN_KEY = "techpulse_admin_token";

export function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/archive") return pathname.startsWith("/archive") || pathname.startsWith("/edition");
  if (href === "/latest") return pathname.startsWith("/latest") || pathname.startsWith("/drop");
  return pathname === href || pathname.startsWith(href + "/");
}
