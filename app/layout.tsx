import type { Metadata } from "next";
import "./global.css";
import { LocationSwitcher } from "@/components/location-switcher";

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
            <body className="min-h-dvh flex flex-col">
                <header className="sticky top-0 z-50 w-full border-b border-neutral-800 bg-[var(--bg-primary)]/80 backdrop-blur-md">
                    <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
                        <span className="text-lg font-semibold tracking-tight text-[var(--text-primary)]">
                            career@las
                        </span>
                        <LocationSwitcher />
                    </div>
                </header>
                <main className="flex-1">{children}</main>
                <footer className="border-t border-neutral-800 px-4 py-4 text-center text-xs text-[var(--text-muted)]">
                    &copy; {new Date().getFullYear()}{" "}
                    <a
                        href="https://github.com/ronaldgosso"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-400 hover:text-teal-300 hover:underline transition-colors"
                    >
                        Ronald Gosso
                    </a>
                </footer>
            </body>
        </html>
    );
}
