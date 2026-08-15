# Changelog

All notable changes to **Career Atlas** will be documented in this file.

This project follows [Semantic Versioning](https://semver.org/) and keeps a human-readable changelog for every release.

---

## [Unreleased]

### Planned
- Multi-language support (Swahili, Spanish, French, Arabic)
- User profiles with saved preferences and skill tracking
- Shareable recommendation links
- AI-powered follow-up chat
- Community upvote/downvote for suggestions
- Light theme toggle
- Full PWA install support
- Interview prep module
- Mentorship matching system

---

## [0.4.0] — 2026-08-15

### 🌪️ Mistral AI Migration
- **Replaced HuggingFace with Mistral AI** — Switched inference provider to Mistral AI (`mistral-small-latest`)
- **Native Streaming SSE Client** — Built a resilient streaming client in `lib/ai-client.ts` with exponential backoff and abort handling
- **Cleaned Dependencies** — Removed `@huggingface/inference` dependency from `package.json` and `next.config.ts`
- **Updated Error Handling** — Added Mistral-specific error classification and direct console links in the UI error card
- **Updated Documentation** — Updated `.env.example`, `README.md`, and `CONTRIBUTING.md` to reference `MISTRAL_API_KEY`

---

## [0.3.0] — 2026-04-07

### 📖 Google Books Verification
- **Automatic book enrichment** — AI-generated book recommendations are verified and enriched via the Google Books API
- **Verified metadata** — Author names, publisher info, and edition years are pulled from the Google Books database instead of relying on AI-generated text
- **Permanent, stable URLs** — All book links point to `books.google.com` URLs that never rot, maintained by Google
- **Graceful fallback** — If Google Books returns no match, the original AI-generated data is preserved with a generic Google search URL
- **Optional API key** — Works without a key at 1,000 requests/day; add `GOOGLE_BOOKS_API_KEY` for higher quotas
- **New library** — `lib/google-books.ts` with `searchGoogleBooks()` and `enrichBooksWithGoogleBooks()` utilities

### ⚙️ Expanded Fields of Study
- **Engineering & Manufacturing** ⚙️ — Mechanical, electrical, civil engineering careers
- **Construction & Real Estate** 🏗️ — Architecture, property management, smart buildings
- **18 total fields** now supported across 5 categories in the Field Selector

### 🎬 Gemini Video Search Improvements
- **Service-specific error tracking** — Gemini failures no longer block the entire request; Llama 3 fallback activates automatically
- **Partial success handling** — If Gemini fails but other categories succeed, results are returned with a warning banner

### 📄 Project Section UI Cleanup
- **Removed "Visit" button from Projects tab** — Projects are AI-generated suggestions (not external links), so the visit button was misleading

### 📜 Auto-Scroll on Field Selection
- **Smooth scroll to loading section** — When a user selects a field, the page automatically scrolls down to show the loading activity
- **Uses `useRef` + `useEffect`** — Clean, dependency-free scroll behavior with `scrollIntoView({ behavior: "smooth" })`

### 🔧 Infrastructure
- **CONTRIBUTING.md** — Dedicated developer onboarding guide with setup instructions, architecture overview, and contribution guidelines
- **README.md restructured** — Features table and Quick Start kept in README; detailed contribution workflow moved to CONTRIBUTING.md
- **CHANGELOG.md** — This release documented as v0.3.0

### 🐛 Bug Fixes
- **ESLint `prefer-const`** — Separated `booksResult` (`let`) from other `const` destructured variables in recommend route
- **JSX closing tag** — Fixed malformed `</section >` and extra `</div>` in `page.tsx`
- **TypeScript type inference** — Used `booksResultRaw` to preserve proper type inference when reassigning `booksResult`
- **`isLoading` use-before-declaration** — Moved `isLoading` const above the `useEffect` that depends on it

---

## [0.2.0] — 2026-04-03

###  Gemini-Powered YouTube Video Search
- **Optional Gemini integration** — Toggle "Enable Gemini" in the Field Selector to replace AI-generated video recommendations with real, currently available YouTube results
- **Google Gemini 2.0 Flash** with Google Search grounding for verified video URLs
- **Graceful fallback** — If Gemini is unavailable, the API key is missing, or the search returns no results, it automatically falls back to Llama 3 AI-generated videos
- **Zero configuration required** — Works out of the box; just add `GOOGLE_GEMINI_API_KEY` to enable
- **Visual indicators** — Blue hint banner when Gemini is off (warning about AI-generated videos), green badge when Gemini is on ("Gemini-powered • Real YouTube search results")

### 📄 Professional PDF Export
- **jsPDF-powered PDF generation** — Clean, professional A4 PDF reports generated client-side
- **Per-record export** — Export individual recommendation sets from the dashboard
- **Full content coverage** — All 5 categories (Books, Videos, Projects, Courses, Professional Titles) with titles, details, links, reasons, and salary ranges
- **Color-coded level badges** — Entry/Mid-Level/Senior/Lead badges with distinct colors
- **Page numbers & attribution** — Every page includes page count and "Generated by Career Atlas • Ronald Gosso" footer
- **Auto page breaks** — Content flows cleanly across pages
- **Smart filenames** — `career-atlas-software-engineering-dareslaam.pdf`

### 🐛 Source-Specific Error Tracking
- **5 distinct error sources** identified with unique styling:
  - 🤖 **HuggingFace** (amber) — Bad token, model loading, rate limited, model down
  - ✨ **Gemini** (blue) — Invalid API key, quota exceeded, service unavailable
  - 🌐 **Network** (red) — Cannot reach API, CORS, fetch failure
  - ⚠️ **Validation** (orange) — Invalid request payload, missing fields
  - **Unknown** (red) — Unexpected server errors
- **Human-readable messages** — Each error source has tailored, actionable messages (e.g., "Model is loading or overloaded. Retry in a minute.")
- **Technical details** — Monospace code block for raw error details when available
- **Context-aware actions** — HuggingFace errors show "Check API key" link; Gemini errors offer retry without Gemini
- **Partial success** — If some categories succeed but others fail, the app returns partial results with a yellow warning banner listing what went wrong
- **Safe error handling** — Guarded against `undefined.replace()` crashes, safe string handling in error classifiers

### 📍 CORS-Fixed Geolocation
- **Server-side IP geolocation proxy** — All geolocation requests now go through `/api/location` API route (server-side fetch), eliminating CORS errors from direct browser-to-ipapi.co requests
- **Unified endpoint** — Single `/api/location` handles both GPS reverse-geocoding (`?lat=&lon=`) and IP-based fallback (no params)
- **Server caching** — Nominatim and ipapi.co responses cached for 24h on the server edge

### 📋 Expanded Fields of Study
- **16 recognized fields** organized into 3 categories:
  - 💻 **Technology** (10 fields) — IT, Data Science, Cybersecurity, Software Engineering, Cloud & DevOps, UI/UX Design, Product Management, ML Engineering, Network Admin, Digital Marketing Tech
  - 🏛️ **Professional Services** (2 fields) — Finance & Accounting, Law & Legal Tech
  - 🩺 **Health & Education** (2 fields) — Healthcare & MedTech, Education & EdTech
- **Categorized UI** — Field selector now displays fields grouped under category headers with emoji icons
- **Gemini toggle** — Integrated into the Field Selector with a description of what it does

### 🔧 Infrastructure & Bug Fixes
- **Vercel header fix** — Replaced regex-based `source` pattern with native path parameter syntax (`/:path*.:file(...)`) to fix deployment error
- **CI workflow fixed** — Corrected nested directory structure (`.github/workflows/ci.yml/ci.yml` → `.github/workflows/ci.yml`)
- **Footer branding** — Changed "career@las" to "Ronald Gosso" with GitHub link
- **Logo replacement** — Replaced globe SVG with compass icon from `icon-512.png`
- **Project documentation** — Comprehensive README with badges, architecture diagrams, quick start guide, and Gemini setup instructions

### 📊 Data Schema Updates
- **Warnings array** — `metadata.warnings` field added to `RecommendationPayload` for partial-success scenarios
- **Gemini flag** — `use_gemini: boolean` added to `RecommendRequestSchema` for API routing

### 🗑️ Removed
- `lib/location.ts` — Geolocation logic moved to server-side API route (`/api/location/route.ts`)
- Print-based PDF export — Replaced with jsPDF programmatic generation

---

## [0.1.0] — 2026-04-02

**Initial Release** — Career Atlas ships as an offline-first, location-aware career resource recommender powered by Meta-Llama-3-8B.

### 🚀 What This Version Provided

#### Core Features
- **Auto Location Detection** — 3-phase resolution pipeline:
  - Browser Geolocation API (GPS) with 2.5s timeout
  - Nominatim reverse geocoding (OpenStreetMap) for city/country resolution
  - IP-based fallback via ipapi.co
  - Hardcoded global fallback (Worldwide) as last resort
- **7-Day Location Cache** — Detected locations cached in IndexedDB to reduce API calls and enable offline reuse
- **Manual Location Override** — Switch between 12 major global cities from the header (New York, London, Berlin, Tokyo, Mumbai, and more)
- **10 Professional Fields** (Tech/IT focused):
  - Information Technology (IT)
  - Data Science & Analytics
  - Cybersecurity
  - Software Engineering
  - Cloud & DevOps
  - UI/UX Design
  - Product Management
  - Machine Learning Engineering
  - Network Administration
  - Digital Marketing Tech
- **AI-Powered Recommendations** — 5 categories generated in parallel via Hugging Face (Meta-Llama-3-8B-Instruct):
  - 📚 **Books** — 3 curated book recommendations with author, link, and reasoning
  - 🎬 **Video Tutorials** — 3 video series with channel, link, and learning value
  - 💻 **Projects** — 3 hands-on project ideas with scope, GitHub links, and skill outcomes
  - 🎓 **Online Resources** — 3 courses/certifications with platform, link, and value proposition
  - 💼 **Professional Titles** — 3 job titles with career level (Entry → Lead), salary range, and progression context
- **Parallel AI Execution** — All 5 category calls run concurrently (not sequentially) for faster response times
- **Streaming with Retry** — Exponential backoff retry logic (3 retries: 1s, 2s, 4s) for Hugging Face API calls
- **Cancel & Retry** — Abort in-flight requests mid-stream; retry failed generations with one click

#### Offline-First Dashboard
- **Persistent Cache** — Every recommendation is saved to IndexedDB (`recommendations` store)
- **Offline Viewing** — Full dashboard works without network connectivity
- **Expandable Records** — Click to expand/collapse any cached recommendation
- **Delete Individual Records** — Remove specific cached entries
- **Export as JSON** — Download all cached recommendations as a `.json` file
- **Clear All Cache** — Bulk-delete with confirmation prompt
- **Offline Indicator** — Visual pill banner when `navigator.onLine === false`

#### UI/UX
- **Deep Ocean Dark Theme** — Custom CSS variables with teal/cyan accent palette
- **Animated Loading Orb** — Multi-ring spinner with orbiting particles
- **Wave Progress Indicator** — Animated bars during AI generation
- **Tabbed Dashboard** — 5 tabs with emoji icons for each recommendation category
- **Level Badges** — Color-coded badges (Entry/Mid-Level/Senior/Lead) for salary cards
- **Gradient Salary Display** — Eye-catching gradient text for salary ranges
- **Hover Animations** — Scale transitions, border glow, and gradient overlays on cards
- **Responsive Design** — Mobile-first grid layouts that adapt to all screen sizes
- **Safe Area Insets** — PWA-ready padding for notched devices
- **Custom Scrollbar Hiding** — Clean horizontal tab overflow scrolling

#### Security & Performance
- **Security Headers** — X-Frame-Options (DENY), X-Content-Type-Options (nosniff), Referrer-Policy, DNS Prefetch
- **Static Asset Caching** — 1-year immutable cache for images, SVGs, and fonts
- **Clean URLs** — Extension-free URLs via Vercel config
- **Strict TypeScript** — No build errors allowed (`ignoreBuildErrors: false`)
- **ESLint Enforcement** — Core Web Vitals + TypeScript rules enforced on every build
- **Turbopack** — Fast development builds with Next.js Turbopack

#### Developer Experience
- **Zod Validation Everywhere** — Input validation at API boundary, output validation of AI responses, typed throughout
- **AbortController Support** — Clean cancellation of in-flight requests
- **Error Boundaries** — Client-side error boundary with "Try again" reset
- **404 Page** — Custom "Location Not Found" page with link back home
- **GitHub Actions CI** — Automated lint + typecheck + build on push to main/develop and PRs
- **Multi-Node CI** — Tests run on both Node 20.x and 22.x
- **`.env.example`** — Documented environment variable template

### 🛠️ Tech Stack
| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| UI | React 19 |
| Styling | Tailwind CSS 3.4 |
| Language | TypeScript 5.7 |
| AI | @huggingface/inference × Meta-Llama-3-8B-Instruct |
| Validation | Zod |
| Storage | IndexedDB (idb) |
| Geolocation | Browser API + Nominatim + ipapi.co |
| Deployment | Vercel |
| CI | GitHub Actions |

### 📝 Notes
- **Region Support** — Tanzania is fully supported (Dar es Salaam, Dodoma, Arusha, Mwanza, Zanzibar) along with any GPS-detectable city worldwide
- **Currency** — Salary ranges currently default to USD (`$` symbol); per-country calibration is planned for a future release
- **License** — GNU General Public License v2.0

---

[Unreleased]: https://github.com/ronaldgosso/career-atlas/compare/v0.3.0...HEAD
[0.3.0]: https://github.com/ronaldgosso/career-atlas/releases/tag/v0.3.0
[0.2.0]: https://github.com/ronaldgosso/career-atlas/releases/tag/v0.2.0
[0.1.0]: https://github.com/ronaldgosso/career-atlas/releases/tag/v0.1.0
