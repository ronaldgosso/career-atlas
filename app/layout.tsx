import type { Metadata } from "next";
import "./global.css";

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
        <html lang="en" suppressHydrationWarning>
            <body className="min-h-dvh flex flex-col" suppressHydrationWarning>
                <main className="flex-1">{children}</main>
                <footer className="border-t border-neutral-800 px-4 py-4 text-center text-xs text-[var(--text-muted)]">
                    &copy; {new Date().getFullYear()} Career Atlas. Data cached locally.
                </footer>
            </body>
        </html>
    );
}
