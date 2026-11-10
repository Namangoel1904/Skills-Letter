import { cn } from "@/lib/utils";

/** BeingNotified brand icon: a "play" signal with a notification node. */
export function BrandMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden className={cn("shrink-0", className)}>
      <rect width="64" height="64" rx="18" fill="var(--primary)" />
      <path d="M25 19.5v25a1.5 1.5 0 0 0 2.3 1.27l20-12.5a1.5 1.5 0 0 0 0-2.54l-20-12.5A1.5 1.5 0 0 0 25 19.5Z" fill="#fff" />
      <circle cx="49" cy="15" r="6.5" fill="#fff" />
      <circle cx="49" cy="15" r="3" fill="var(--primary)" />
    </svg>
  );
}
