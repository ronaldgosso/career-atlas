interface GoogleBooksVolume {
    id: string;
    volumeInfo: {
        title: string;
        authors?: string[];
        description?: string;
        publisher?: string;
        publishedDate?: string;
        imageLinks?: {
            thumbnail?: string;
            smallThumbnail?: string;
        };
        infoLink?: string;
        previewLink?: string;
        categories?: string[];
    };
}

interface GoogleBooksResponse {
    items?: GoogleBooksVolume[];
    totalItems: number;
}

export interface EnrichedBook {
    title: string;
    detail: string;
    url: string;
    reason: string;
    coverImage?: string;
}

// In-memory query cache with 1-hour TTL
const CACHE_TTL_MS = 60 * 60 * 1000;
const booksCache = new Map<string, { data: GoogleBooksVolume[]; timestamp: number }>();

// Circuit breaker state if 429 occurs
let rateLimitedUntil = 0;

/**
 * Search Google Books API for a given query with in-memory caching and 429 protection.
 * Returns verified book data with stable Google Books preview/info links.
 *
 * @param query - Search query (e.g., book title + subject)
 * @param signal - Optional AbortSignal for cancellation
 */
export async function searchGoogleBooks(
    query: string,
    signal?: AbortSignal
): Promise<GoogleBooksVolume[]> {
    const normalizedKey = query.trim().toLowerCase();

    // Check in-memory cache
    const cached = booksCache.get(normalizedKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        return cached.data;
    }

    // If temporarily rate-limited, fail fast to fallback without extra HTTP calls
    if (Date.now() < rateLimitedUntil) {
        return [];
    }

    const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
    const params = new URLSearchParams({
        q: query,
        maxResults: "3",
        printType: "books",
        orderBy: "relevance",
    });

    if (apiKey) {
        params.set("key", apiKey);
    }

    const url = `https://www.googleapis.com/books/v1/volumes?${params.toString()}`;

    try {
        const response = await fetch(url, { signal });

        if (response.status === 429) {
            // Set circuit breaker for 60 seconds
            rateLimitedUntil = Date.now() + 60_000;
            console.warn("[Google Books API] Rate limited (429). Using standard curated links for 60s.");
            return [];
        }

        if (!response.ok) {
            console.warn(`[Google Books API] Request returned status: ${response.status}`);
            return [];
        }

        const data: GoogleBooksResponse = await response.json();
        const items = data.items ?? [];

        // Save to in-memory cache (limit cache size to 200 queries)
        if (booksCache.size > 200) {
            const oldestKey = booksCache.keys().next().value;
            if (oldestKey) booksCache.delete(oldestKey);
        }
        booksCache.set(normalizedKey, { data: items, timestamp: Date.now() });

        return items;
    } catch (err) {
        console.warn("[Google Books API] Search failed:", err instanceof Error ? err.message : String(err));
        return [];
    }
}

/**
 * Enrich AI-generated book recommendations with verified Google Books metadata.
 * Takes raw book titles from Mistral AI, searches Google Books, and returns
 * enriched data with stable URLs, authors, descriptions, and cover images.
 *
 * Falls back to the original AI-generated data if Google Books returns no results.
 */
export async function enrichBooksWithGoogleBooks(
    aiBooks: Array<{ title: string; detail: string; url: string | null; reason: string }>,
    field: string,
    signal?: AbortSignal
): Promise<EnrichedBook[]> {
    const enriched: EnrichedBook[] = [];

    for (const book of aiBooks) {
        const searchQuery = `${book.title} ${field}`.trim();
        const results = await searchGoogleBooks(searchQuery, signal);

        if (results.length > 0) {
            const bestMatch = results[0].volumeInfo;
            const authors = bestMatch.authors?.join(", ") || "Verified Author";
            const edition = bestMatch.publishedDate
                ? ` (${bestMatch.publishedDate.substring(0, 4)})`
                : "";
            const publisher = bestMatch.publisher ? ` — ${bestMatch.publisher}` : "";

            enriched.push({
                title: bestMatch.title || book.title,
                detail: `${authors}${edition}${publisher}`,
                url: bestMatch.previewLink || bestMatch.infoLink || book.url || `https://www.google.com/search?q=${encodeURIComponent(book.title + " book")}`,
                reason: book.reason,
                coverImage: bestMatch.imageLinks?.thumbnail,
            });
        } else {
            const fallbackUrl = book.url && book.url.startsWith("http")
                ? book.url
                : `https://www.google.com/search?q=${encodeURIComponent(book.title + " book")}`;
            enriched.push({
                title: book.title,
                detail: book.detail,
                url: fallbackUrl,
                reason: book.reason,
            });
        }

        // Slight pause between queries if not cached
        await new Promise((r) => setTimeout(r, 100));
    }

    return enriched;
}

export function isGoogleBooksAvailable(): boolean {
    return true;
}
