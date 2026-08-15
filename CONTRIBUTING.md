# Contributing to Career Atlas

Thank you for your interest in contributing! This guide covers everything you need to know to set up your development environment, understand the architecture, and submit quality contributions.

---

## 🚀 Quick Start for Developers

### Prerequisites

| Requirement | Version | Why |
|---|---|---|
| **Node.js** | 20.x or 22.x | Next.js 15 requires Node 18+ |
| **npm** | 10.x+ | Comes with Node.js |
| **Git** | 2.x+ | Version control |

### 1. Clone & Install

```bash
git clone https://github.com/ronaldgosso/career-atlas.git
cd career-atlas
npm install
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your API keys:

```env
# Required — AI recommendations
MISTRAL_API_KEY=your_mistral_api_key_here

# Optional — Real YouTube video search
GOOGLE_GEMINI_API_KEY=AIzaSy...

# Optional — Verified book metadata (works without key at 1k req/day)
GOOGLE_BOOKS_API_KEY=AIzaSy...
```

> - Get a Mistral API key at [console.mistral.ai/api-keys](https://console.mistral.ai/api-keys)
> - Get a free Gemini API key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
> - Get a free Google Books API key at [console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials) (enable "Books API")

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Production Build

```bash
npm run ci      # Full pipeline: lint + typecheck + build
npm run start   # Production server
```

---

## 📦 Project Structure

```
career-atlas/
├── app/                          # Next.js App Router
│   ├── api/
│   │   ├── location/route.ts     # Server-side geolocation proxy
│   │   └── recommend/route.ts    # AI recommendation endpoint
│   ├── dashboard/page.tsx        # Offline cache viewer
│   ├── layout.tsx                # Root layout + navigation
│   ├── page.tsx                  # Home: location + field + results
│   ├── global.css                # Tailwind + custom CSS variables
│   ├── error.tsx                 # Error boundary
│   └── not-found.tsx             # 404 page
├── components/
│   ├── field-selector.tsx        # Categorized field selection grid
│   ├── recommendations-dashboard.tsx  # Tabbed results display
│   ├── loading-orb.tsx           # Animated loading spinner
│   ├── location-switcher.tsx     # Manual city override
│   ├── cache-controls.tsx        # Export JSON / Clear cache
│   └── offline-indicator.tsx     # Offline mode indicator
├── hooks/
│   ├── use-location.ts           # GPS → Nominatim → IP resolution
│   └── use-recommendations.ts    # AI fetch lifecycle with retry
├── lib/
│   ├── ai-client.ts              # Mistral AI streaming client
│   ├── ai-stream-parser.ts       # JSON stream parser
│   ├── cache-manager.ts          # IndexedDB CRUD helpers
│   ├── db.ts                     # IndexedDB initialization
│   ├── gemini-youtube.ts         # Gemini-powered YouTube search
│   ├── google-books.ts           # Google Books API verification
│   ├── location.ts               # Geolocation utilities
│   ├── pdf-export.ts             # jsPDF report generation
│   └── validators.ts             # Zod schemas
├── public/                       # Static assets (logo, favicons)
├── .github/workflows/ci.yml      # GitHub Actions CI pipeline
└── package.json
```

---

## 🏗️ Architecture Overview

### Request Flow

1. **Location Detection** → Browser GPS → Nominatim reverse geocoding → IP fallback
2. **Field Selection** → User picks a field of study from the categorized grid
3. **AI Generation** → 5 parallel Mistral AI calls (Books, Videos, Projects, Courses, Titles)
4. **Book Enrichment** → Google Books API verifies and adds metadata + permanent URLs
5. **Video Enrichment** → Optional Gemini search for real YouTube URLs (or Mistral fallback)
6. **Display** → Results rendered in tabbed dashboard
7. **Persistence** → All results saved to IndexedDB for offline access

### Key Design Decisions

- **Offline-first** → All recommendations are cached in IndexedDB. The dashboard works without network.
- **Graceful degradation** → If any AI service fails, partial results are returned with warnings.
- **Server-side proxies** → Geolocation requests go through `/api/location` to avoid CORS issues.
- **Streaming AI responses** → Mistral AI responses are streamed and parsed.

---

## 🛠️ Development Commands

| Command | Description |
|---|---|
| `npm run dev` | Start development server (Turbopack) |
| `npm run build` | Full production build (lint + typecheck + compile) |
| `npm run start` | Run production server locally |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run ci` | Full CI pipeline (lint + typecheck + build) |

---

## 🤝 How to Contribute

### 1. Find Something to Work On

- Check [open issues](https://github.com/ronaldgosso/career-atlas/issues) for bugs or feature requests
- Look at the [What's Next](README.md#-whats-next) section in the README for planned features
- See something that could be better? Open an issue first to discuss it

### 2. Fork & Branch

```bash
# Fork the repo on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/career-atlas.git
cd career-atlas

# Create a feature branch
git checkout -b feature/your-feature-name
```

**Branch naming convention:**
- `feature/description` — New features
- `fix/description` — Bug fixes
- `docs/description` — Documentation changes
- `refactor/description` — Code refactoring

### 3. Make Your Changes

- Follow the existing code style (TypeScript, React, Tailwind CSS)
- Keep components focused — one responsibility per component
- Use Zod schemas in `lib/validators.ts` for all API inputs/outputs
- Add comments for complex logic, but let the code speak for itself

### 4. Test Your Changes

```bash
npm run ci
```

Ensure the full pipeline passes — lint, typecheck, and build must all be clean.

### 5. Commit & Push

```bash
git add .
git commit -m "feat: brief description of what changed"
git push origin feature/your-feature-name
```

**Commit message convention** (Conventional Commits):
- `feat:` — New feature
- `fix:` — Bug fix
- `docs:` — Documentation only
- `refactor:` — Code change that neither fixes a bug nor adds a feature
- `chore:` — Maintenance, config changes, no production code change
- `style:` — Code style/formatting changes

### 6. Open a Pull Request

1. Go to the [original repo](https://github.com/ronaldgosso/career-atlas)
2. Click **Compare & pull request**
3. Fill in the PR template with:
   - What changed and why
   - How to test it
   - Any screenshots or logs (for UI changes)
4. Wait for review — address any feedback

---

## 📐 Coding Standards

### TypeScript
- Strict mode enabled — no `any` unless absolutely necessary (explain why)
- Use `interface` for objects, `type` for unions/intersections
- Export types from `lib/validators.ts` using `z.infer<typeof Schema>`

### React Components
- Use functional components with explicit type annotations
- Keep hooks in the `hooks/` directory if they're reusable
- Client components must have `"use client"` at the top
- Server components (API routes, layout) do not use `"use client"`

### Styling
- Tailwind CSS only — no inline styles except for dynamic values (e.g., `animationDelay`)
- Follow the Deep Ocean dark theme palette (teal/cyan accents on dark backgrounds)
- Use `clsx` or template literals for conditional classes

### API Routes
- All inputs validated with Zod (`lib/validators.ts`)
- Return structured JSON with consistent error format
- Use `Promise.allSettled` for parallel independent operations

---

## 🐛 Reporting Bugs

When reporting a bug, include:

1. **What happened** — Describe the issue clearly
2. **How to reproduce** — Step-by-step instructions
3. **Expected behavior** — What should have happened
4. **Actual behavior** — What actually happened
5. **Environment** — Browser, OS, Node.js version, deployed or local
6. **Screenshots/logs** — If applicable

---

## 💡 Suggesting Features

Before suggesting a feature:

1. Check existing [issues](https://github.com/ronaldgosso/career-atlas/issues) and the [What's Next](README.md#-whats-next) roadmap
2. If it's not there, open an issue with:
   - **Problem** — What problem does this solve?
   - **Proposal** — How do you envision it working?
   - **Alternatives** — Any alternative approaches you've considered?

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the **GNU General Public License v2.0** — the same license as the project.

---

<p align="center">
  Thanks for contributing! 💙
</p>
