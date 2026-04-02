import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center px-4">
      <h1 className="text-6xl font-bold tracking-tighter text-[var(--text-muted)]">404</h1>
      <h2 className="text-xl font-semibold text-[var(--text-primary)]">Location Not Found</h2>
      <p className="text-sm text-[var(--text-muted)] max-w-md">
        The resource you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="rounded-md border border-neutral-700 px-4 py-2 text-sm font-medium hover:bg-neutral-800 transition"
      >
        Return Home
      </Link>
    </div>
  );
}