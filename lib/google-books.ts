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

/**
 * Search Google Books API for a given query.
 * Returns verified book data with stable, permanent Google Books URLs.
 * Free tier: 1,000 requests/day — no API key required for basic usage.
 *
 * @param query - Search query (e.g., book title + subject)
 * @param signal - Optional AbortSignal for cancellation
 */
export async function searchGoogleBooks(
    query: string,
    signal?: AbortSignal
): Promise<GoogleBooksVolume[]> {
    const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
    const params = new URLSearchParams({
        q: query,
        maxResults: "5",
        printType: "books",
        orderBy: "relevance",
    });

    if (apiKey) {
        params.set("key", apiKey);
    }

    const url = `https://www.googleapis.com/books/v1/volumes?${params.toString()}`;

    try {
        const response = await fetch(url, { signal });

        if (!response.ok) {
            console.warn(`[Google Books API] Request failed: ${response.status} ${response.statusText}`);
            return [];
        }

        const data: GoogleBooksResponse = await response.json();
        return data.items ?? [];
    } catch (err) {
        console.warn("[Google Books API] Search failed:", err instanceof Error ? err.message : String(err));
        return [];
    }
}

/**
 * Enrich AI-generated book recommendations with verified Google Books metadata.
 * Takes raw book titles from Llama 3, searches Google Books, and returns
 * enriched data with stable URLs, authors, descriptions, and cover images.
 *
 * Falls back to the original AI-generated data if Google Books returns no results.
 *
 * @param aiBooks - Array of AI-generated book recommendations
 * @param field - The professional field (e.g., "Software Engineering")
 * @param signal - Optional AbortSignal for cancellation
 */
export async function enrichBooksWithGoogleBooks(
    aiBooks: Array<{ title: string; detail: string; url: string | null; reason: string }>,
    field: string,
    signal?: AbortSignal
): Promise<EnrichedBook[]> {
    const enriched: EnrichedBook[] = [];

    for (const book of aiBooks) {
        // Search using title + field for better relevance
        const searchQuery = `${book.title} ${field}`.trim();
        const results = await searchGoogleBooks(searchQuery, signal);

        if (results.length > 0) {
            // Pick the best match (first result is ranked by relevance)
            const bestMatch = results[0].volumeInfo;
            const authors = bestMatch.authors?.join(", ") || "Unknown Author";
            const edition = bestMatch.publishedDate
                ? ` (${bestMatch.publishedDate.substring(0, 4)})`
                : "";
            const publisher = bestMatch.publisher ? ` — ${bestMatch.publisher}` : "";

            enriched.push({
                title: bestMatch.title || book.title,
                detail: `${authors}${edition}${publisher}`,
                url: bestMatch.previewLink || bestMatch.infoLink || book.url || "",
                reason: book.reason,
                coverImage: bestMatch.imageLinks?.thumbnail,
            });
        } else {
            // Fallback: keep the AI-generated data with a generic Google Books search URL
            const fallbackUrl = book.url || `https://www.google.com/search?q=${encodeURIComponent(book.title + " book")}`;
            enriched.push({
                title: book.title,
                detail: book.detail,
                url: fallbackUrl,
                reason: book.reason,
            });
        }
    }

    return enriched;
}

/**
 * Check if Google Books API is accessible.
 * Used to determine whether to attempt enrichment or skip directly to fallback.
 */
export function isGoogleBooksAvailable(): boolean {
    return true; // Google Books API is free and doesn't require an API key for basic usage
}
