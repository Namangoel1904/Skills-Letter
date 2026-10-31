import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const headingFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Notified — The Chronicle of Open Source, Local AI & Vibe Coding",
    template: "%s | Notified",
  },
  description:
    "AI-distilled intelligence on open-source repos, quantized local LLMs, cutting-edge Agentic workflows, and Apple-grade UI components.",
  keywords: [
    "notified",
    "tech newsletter",
    "open source",
    "vibe coding",
    "quantized models",
    "claude skills",
    "cursor rules",
    "developer tools",
  ],
  openGraph: {
    type: "website",
    siteName: "Notified",
    title: "Notified — The Chronicle of Open Source, Local AI & Vibe Coding",
    description: "Curated open source tools, local models, and developer skills delivered directly to your inbox.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${headingFont.variable} font-sans antialiased selection:bg-primary/20 selection:text-primary`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <div className="relative min-h-screen flex flex-col bg-background text-foreground overflow-x-hidden">
            {/* Ambient background light grid */}
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.18),rgba(0,0,0,0))] pointer-events-none -z-10" />
            <div className="fixed inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none -z-10 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
