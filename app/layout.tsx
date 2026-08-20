import type { Metadata, Viewport } from "next";
import "./global.css";
import { HorizontalScrollProvider } from "@/components/horizontal-scroll-provider";
import { ServiceWorkerRegister } from "@/components/service-worker-register";

export const viewport: Viewport = {
    themeColor: "#020617",
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
};

export const metadata: Metadata = {
    title: {
        default: "Career Atlas — Executive Talent & Career Intelligence",
        template: "%s | Career Atlas",
    },
    description: "Market-calibrated hiring benchmarks, capstone projects, verified masterclasses, and executive talent dossiers across 55+ global tech hubs.",
    applicationName: "Career Atlas",
    authors: [{ name: "Career Atlas Advisory" }],
    keywords: [
        "Career Atlas",
        "tech salaries",
        "career roadmap",
        "software engineering compensation",
        "executive talent advisory",
        "global tech hubs",
    ],
    metadataBase: new URL("https://career-atlas.app"),
    openGraph: {
        title: "Career Atlas — Executive Talent & Career Intelligence",
        description: "Market-calibrated hiring benchmarks, capstone projects, and verified masterclasses for 55+ global tech hubs.",
        type: "website",
        locale: "en_US",
        siteName: "Career Atlas",
    },
    twitter: {
        card: "summary_large_image",
        title: "Career Atlas — Executive Talent & Career Intelligence",
        description: "Market-calibrated hiring benchmarks, capstones, and verified learning roadmaps.",
    },
    icons: {
        icon: [
            { url: "/favicon.ico", sizes: "48x48" },
        ],
        apple: [
            { url: "/apple-icon.png", sizes: "180x180" },
        ],
    },
    manifest: "/manifest.webmanifest",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className="min-h-dvh flex flex-col bg-slate-950 text-slate-100 antialiased" suppressHydrationWarning>
                <ServiceWorkerRegister />
                <HorizontalScrollProvider>
                    <main className="flex-1">{children}</main>
                    <footer className="border-t border-teal-500/10 bg-slate-950/80 px-4 py-4 text-center text-xs text-teal-200/50 backdrop-blur-md flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2">
                        <span>&copy; {new Date().getFullYear()} Career Atlas. Market-calibrated intelligence cached locally.</span>
                        <span className="hidden sm:inline">•</span>
                        <span>
                            Crafted by{" "}
                            <a
                                href="https://github.com/ronaldgosso"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-semibold text-teal-300 hover:text-cyan-200 underline underline-offset-4 transition-colors"
                            >
                                Ronald Gosso
                            </a>
                        </span>
                    </footer>
                </HorizontalScrollProvider>
            </body>
        </html>
    );
}
