# Changelog

All notable changes to **Career Atlas** will be documented in this file.

This project follows [Semantic Versioning](https://semver.org/) and keeps a human-readable changelog for every release.

---

## [Unreleased]

### Planned
- Multi-language support (Swahili, Spanish, French, Arabic)
- User profiles with saved preferences and skill tracking
- PDF export of recommendation reports
- Shareable recommendation links
- AI-powered follow-up chat
- Community upvote/downvote for suggestions
- Light theme toggle
- Full PWA install support
- Interview prep module
- Mentorship matching system

---

## [0.1.0] — 2026-04-03

**Initial Release** — Career Atlas ships as an offline-first, location-aware career resource recommender powered by Meta-Llama-3-8B.

### 🚀 What This Version Provides

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

[Unreleased]: https://github.com/ronaldgosso/career-atlas/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/ronaldgosso/career-atlas/releases/tag/v0.1.0
