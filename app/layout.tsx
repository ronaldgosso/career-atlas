import type { Metadata } from "next";
import "./global.css";

export const metadata: Metadata = {
  title: "career@las",
  description: "Ambient location-aware career resource recommender",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-dvh flex flex-col" suppressHydrationWarning>
        <header className="sticky top-0 z-50 w-full border-b border-neutral-800 bg-[var(--bg-primary)]/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <span className="text-lg font-semibold tracking-tight text-[var(--text-primary)]">
              career@las
            </span>
            <div className="flex gap-2 text-xs text-[var(--text-muted)]">
              <span className="hidden sm:inline">Offline-Ready</span>
              <span className="h-4 w-px bg-neutral-800 hidden sm:inline" />
              <span>Next.js 15</span>
            </div>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-neutral-800 px-4 py-4 text-center text-xs text-[var(--text-muted)]">
          © {new Date().getFullYear()} Ronald Gosso. Data cached locally.
        </footer>
      </body>
    </html>
  );
}