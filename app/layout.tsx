import type { Metadata } from "next";
import Link from "next/link";
import "./global.css";
import { LocationSwitcher } from "@/components/location-switcher";

export const metadata: Metadata = {
    title: "career@las",
    description: "Ambient location-aware career resource recommender",
    icons: {
        icon: [
          { url: "favicon.ico", sizes: "48x48" },
        ],
        apple: [
          { url: "apple-icon.png", sizes: "180x180" },
        ],
      },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="min-h-dvh flex flex-col">
                <header className="sticky top-0 z-50 w-full border-b border-neutral-800 bg-[var(--bg-primary)]/80 backdrop-blur-md">
                    <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-6">
                            <Link href="/" className="text-lg font-semibold tracking-tight text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors">
                                career@las
                            </Link>
                            <Link href="/dashboard" className="text-sm text-[var(--text-muted)] hover:text-white transition-colors">
                                Dashboard
                            </Link>
                        </div>
                        <LocationSwitcher />
                    </div>
                </header>
                <main className="flex-1">{children}</main>
                <footer className="border-t border-neutral-800 px-4 py-4 text-center text-xs text-[var(--text-muted)]">
                    &copy; {new Date().getFullYear()} career@las. Data cached locally.
                </footer>
            </body>
        </html>
    );
}
