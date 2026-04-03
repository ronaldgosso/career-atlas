<p align="center">
  <img src="public/icon-512.png" alt="Career Atlas Logo" width="120" height="120" />
</p>

<h1 align="center">Career Atlas</h1>

<p align="center">
  <em>Ambient location-aware career resource recommender — powered by AI, built for offline-first.</em>
</p>

<p align="center">
  <a href="https://github.com/ronaldgosso/career-atlas/actions/workflows/ci.yml">
    <img src="https://github.com/ronaldgosso/career-atlas/actions/workflows/ci.yml/badge.svg" alt="CI Status" />
  </a>
  <a href="https://nextjs.org/">
    <img src="https://img.shields.io/badge/Next.js-15.1-000000?logo=nextdotjs&logoColor=white" alt="Next.js" />
  </a>
  <a href="https://react.dev/">
    <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React" />
  </a>
  <a href="https://www.typescriptlang.org/">
    <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  </a>
  <a href="https://vercel.com/">
    <img src="https://img.shields.io/badge/Deployed%20on-Vercel-000000?logo=vercel&logoColor=white" alt="Vercel" />
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/github/license/ronaldgosso/career-atlas?color=43A047&logo=gnu" alt="License GPL-2.0" />
  </a>
  <a href="https://huggingface.co/">
    <img src="https://img.shields.io/badge/AI-Meta%20Llama%203%208B-FFD21E?logo=huggingface&logoColor=black" alt="Llama 3 8B" />
  </a>
</p>

<p align="center">
  <a href="#-features">Features</a> ·
  <a href="#-architecture">Architecture</a> ·
  <a href="#-quick-start">Quick Start</a> ·
  <a href="#-tech-stack">Tech Stack</a> ·
  <a href="#-whats-next">What's Next</a> ·
  <a href="#-contributing">Contributing</a> ·
  <a href="#-license">License</a>
</p>

---

## 🧭 Overview

**Career Atlas** is an intelligent career resource recommender that tailors books, video tutorials, hands-on projects, online courses, and professional job titles with salary ranges to **your geographic location** and **chosen professional field**.

It works **offline-first** — every recommendation is cached locally via IndexedDB, so you can revisit your career library without a network connection. The app auto-detects your region using GPS, reverse geocodes with OpenStreetMap/Nominatim, and gracefully falls back to IP-based geolocation.

> **Currently focused on Tech/IT fields** — with Finance, Healthcare, and more on the roadmap. See [What's Next](#-whats-next) for details.

---

## ✨ Features

<table>
  <tr>
    <td><b>📍 Location-Aware</b></td>
    <td>Auto-detects your city and country via GPS, with Nominatim reverse-geocoding and IP fallback. Location cached for 7 days.</td>
  </tr>
  <tr>
    <td><b>🤖 AI-Powered Recommendations</b></td>
    <td>Leverages Meta-Llama-3-8B-Instruct (via Hugging Face) to generate 5 categories of career resources in parallel.</td>
  </tr>
  <tr>
    <td><b>📚 5 Recommendation Categories</b></td>
    <td>Books, Video Tutorials, Hands-on Projects, Online Courses, and Professional Job Titles with salary ranges.</td>
  </tr>
  <tr>
    <td><b>🌐 Offline-First Dashboard</b></td>
    <td>All recommendations are persisted to IndexedDB. Browse your full history offline on the Dashboard page.</td>
  </tr>
  <tr>
    <td><b>📥 Export &amp; Clear Cache</b></td>
    <td>Export all cached recommendations as JSON, or clear them with a single click.</td>
  </tr>
  <tr>
    <td><b>🔄 Cancel &amp; Retry</b></td>
    <td>Abort in-flight AI requests mid-stream. Retry failed generations with a single click.</td>
  </tr>
  <tr>
    <td><b>🎨 Deep Ocean Theme</b></td>
    <td>Polished dark UI with teal/cyan accents, animated loading states, and responsive design.</td>
  </tr>
  <tr>
    <td><b>🔒 Security Headers</b></td>
    <td>X-Frame-Options, X-Content-Type-Options, Referrer-Policy, and more configured via Vercel.</td>
  </tr>
</table>

---

## 🏗️ Architecture
![High-level Architecture](./public/highLevelArch.png)

### Location Resolution Pipeline
![Location Resolution Pipeline](./public/location-aware.png)

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20.x or 22.x
- **npm** (comes with Node.js)
- A free **Hugging Face** account and API token

### 1. Clone the repository

```bash
git clone https://github.com/ronaldgosso/career-atlas.git
cd career-atlas
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env.local
```

Then edit `.env.local` and add your Hugging Face API token:

```env
HUGGINGFACE_API_KEY=hf_your_token_here
```

> Get a free token at [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) — read access is sufficient.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Production build

```bash
npm run build    # lint + typecheck + build
npm run start    # production server
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 15](https://nextjs.org/) (App Router) |
| **UI Library** | [React 19](https://react.dev/) |
| **Styling** | [Tailwind CSS 3.4](https://tailwindcss.com/) |
| **Language** | [TypeScript 5.7](https://www.typescriptlang.org/) |
| **AI Engine** | [@huggingface/inference](https://huggingface.co/docs/huggingface.js) × Meta-Llama-3-8B-Instruct |
| **Validation** | [Zod](https://zod.dev/) |
| **Local Storage** | [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) via [idb](https://github.com/jakearchibald/idb) |
| **Geolocation** | Browser Geolocation API · [Nominatim](https://nominatim.openstreetmap.org/) · [ipapi.co](https://ipapi.co/) |
| **Deployment** | [Vercel](https://vercel.com/) |
| **CI/CD** | GitHub Actions (Node 20 &amp; 22, lint + typecheck + build) |

---

## 📦 Project Structure

```
career-atlas/
├── app/
│   ├── api/recommend/route.ts   ← AI recommendation endpoint
│   ├── dashboard/page.tsx        ← Offline cache viewer
│   ├── layout.tsx                ← Root layout + nav
│   ├── page.tsx                  ← Home: location + field + results
│   ├── global.css                ← Tailwind + custom CSS vars
│   ├── error.tsx                 ← Error boundary
│   └── not-found.tsx             ← 404 page
├── components/
│   ├── field-selector.tsx        ← 10-field selection grid
│   ├── recommendations-dashboard.tsx  ← Tabbed results view
│   ├── loading-orb.tsx           ← Animated spinner
│   ├── location-switcher.tsx     ← Manual city override
│   ├── cache-controls.tsx        ← Export JSON / Clear cache
│   └── offline-indicator.tsx     ← Offline mode pill
├── hooks/
│   ├── use-location.ts           ← GPS → Nom → IP resolution
│   ├── use-ambient-locations.ts  ← (legacy) simpler GPS hook
│   └── use-recommendations.ts    ← AI fetch lifecycle
├── lib/
│   ├── ai-client.ts              ← Hugging Face streaming client
│   ├── ai-stream-parser.ts       ← JSON stream parser
│   ├── cache-manager.ts          ← IndexedDB CRUD helpers
│   ├── db.ts                     ← IndexedDB initialization
│   ├── location.ts               ← Geolocation utilities
│   └── validators.ts             ← Zod schemas
├── public/
│   ├── icon-512.png              ← App logo (compass)
│   └── ...                       ← Favicons, manifest icons
├── .github/workflows/
│   └── ci.yml                    ← CI pipeline
└── package.json
```

---

## 🔮 What's Next

### Fields of Study 📋

| Status | Field | Description |
|---|---|---|
| ✅ | **Information Technology (IT)** | General IT careers |
| ✅ | **Data Science & Analytics** | Data engineering, analytics, BI |
| ✅ | **Cybersecurity** | Security, penetration testing, SOC |
| ✅ | **Software Engineering** | Full-stack, backend, frontend dev |
| ✅ | **Cloud & DevOps** | AWS, Azure, GCP, CI/CD, IaC |
| ✅ | **UI/UX Design** | User research, prototyping, design systems |
| ✅ | **Product Management** | Agile, roadmapping, stakeholder mgmt |
| ✅ | **Machine Learning Engineering** | MLOps, model training, deployment |
| ✅ | **Network Administration** | Routing, switching, wireless |
| ✅ | **Digital Marketing Tech** | MarTech, analytics, automation |
| ✅ | **Finance & Accounting** | Financial analysis, accounting, fintech |
| ✅ | **Healthcare & MedTech** | Health informatics, clinical tech |
| ✅ | **Education & EdTech** | Curriculum design, learning platforms |
| ✅ | **Law & Legal Tech** | Legal research, compliance tech |
| ✅ | **Creative Arts & Media** | Graphic design, video production, writing |
| ✅ | **Engineering & Manufacturing** | Mechanical, electrical, civil engineering |
| 🔲 | **Hospitality & Tourism** | Hotel management, travel tech, event planning |
| 🔲 | **Agriculture & AgriTech** | Farm management, food science, sustainability |
| 🔲 | **Construction & Real Estate** | Architecture, property management, smart buildings |
| 🔲 | **Transportation & Logistics** | Supply chain, fleet management, aviation tech |

### Regions & Locations 🌍

| Status | Region | Notes |
|---|---|---|
| ✅ | **Tanzania** | Full support — Dar es Salaam, Dodoma, Arusha, Mwanza, Zanzibar |
| ✅ | **Global (via GPS)** | Any city detected by Nominatim |
| ✅ | **Manual Override** | 12 major cities (NY, London, Berlin, Tokyo, Mumbai, etc.) |
| 🔲 | **Expanded African Regions** | Kenya, Nigeria, South Africa, Ghana, Rwanda, Ethiopia |
| 🔲 | **Southeast Asia** | Indonesia, Philippines, Vietnam, Thailand, Malaysia |
| 🔲 | **South America** | Brazil, Argentina, Colombia, Chile, Peru |
| 🔲 | **Regional Salary Calibration** | Local currency symbols and PPP-adjusted ranges per country |

### Features & Enhancements 🚀

- [ ] **Multi-language support** (Swahili, Spanish, French, Arabic)
- [ ] **User profiles** — save preferences, track skill progression
- [ ] **PDF export** of recommendation reports
- [ ] **Share recommendations** via shareable links
- [ ] **AI-powered chat** — ask follow-up questions about any recommendation
- [ ] **Community rankings** — upvote/downvote AI suggestions
- [ ] **Dark/Light theme toggle**
- [ ] **PWA install** — full offline app experience
- [ ] **Analytics dashboard** — track career growth milestones
- [ ] **Resume builder** — auto-generate resumes from selected resources
- [ ] **Interview prep** — field-specific interview questions and tips
- [ ] **Mentorship matching** — connect with professionals in your field

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a **Pull Request**

### Development Commands

```bash
npm run dev        # Start dev server (Turbopack)
npm run build      # Full build (lint + typecheck + compile)
npm run start      # Production server
npm run lint       # ESLint
npm run typecheck  # TypeScript type checking
npm run ci         # Full CI pipeline (lint + typecheck + build)
```

---

## 📄 License

This project is licensed under the **GNU General Public License v2.0** — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **[Hugging Face](https://huggingface.co/)** — AI inference infrastructure
- **[Meta Llama 3](https://llama.meta.com/)** — Open-source language model
- **[OpenStreetMap](https://www.openstreetmap.org/)** — Free geocoding via Nominatim
- **[ipapi.co](https://ipapi.co/)** — IP-based geolocation fallback
- **[Vercel](https://vercel.com/)** — Hosting and edge infrastructure

---

<p align="center">
  Made with 💙 by <a href="https://github.com/ronaldgosso">Ronald Gosso</a>
</p>
