import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { AppShell } from "@/components/layout/app-shell";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans", display: "swap" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "BeingNotified — Your playlists. Distilled into intelligence.",
    template: "%s | BeingNotified",
  },
  description: "A personal AI intelligence layer over YouTube playlists. Less watching. More knowing.",
  openGraph: {
    type: "website",
    siteName: "BeingNotified",
    title: "BeingNotified — Your playlists. Distilled into intelligence.",
    description: "AI-curated insights extracted from the videos you didn't have time to watch.",
  },
};

export const viewport: Viewport = { themeColor: "#09090b", width: "device-width", initialScale: 1 };

/**
 * Runs before first paint. If the intro will play, a black cover prevents a flash of the
 * homepage; the cover has a CSS-only failsafe so a JS failure can never leave the screen blocked.
 */
const introBootstrap = `(function(){try{var s=sessionStorage.getItem('bn:intro-seen')==='1';var r=window.matchMedia('(prefers-reduced-motion: reduce)').matches;if(!s&&!r&&location.pathname==='/'){document.documentElement.dataset.intro='play'}}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: introBootstrap }} />
        <style>{`html[data-intro="play"] body::before{content:"";position:fixed;inset:0;z-index:9990;background:#09090b;pointer-events:none;animation:bn-cover-failsafe .01s linear 6s forwards}@keyframes bn-cover-failsafe{to{opacity:0;visibility:hidden}}`}</style>
      </head>
      <body className={`${geist.variable} ${geistMono.variable} bg-background font-sans text-foreground antialiased selection:bg-primary/25`}>
        <ThemeProvider attribute="class" defaultTheme="dark" themes={["light", "dark"]} enableSystem={false}>
          <AppShell>{children}</AppShell>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
