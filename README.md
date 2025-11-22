<div align="center">

# Agentic Data Quality Analysis Platform

An educational, AI-assisted data quality exploration and remediation tutorial built with Next.js and vanilla JavaScript/CSS. Empower non‑technical analysts to understand, visualize, and improve the health of their tabular datasets quickly.

</div>

## Table of Contents
1. Purpose & Problem
2. What You Build
3. Core Features
4. How It Works (Architecture)
5. Tutorial Flow & Milestones
6. Setup & Installation
7. Usage Guide
8. Testing
9. Accessibility & Performance Goals
10. Tech Stack
11. Learning Outcomes (CCC.1 Mapping)
12. Contributing & Extensions
13. License

---
## 1. Purpose & Problem
Modern data teams struggle with scattered tools: profiling scripts, adhoc spreadsheets, and opaque AI summaries. Business stakeholders often lack an approachable interface to:
- See immediate quality issues (missing, outliers, duplicates, type drift)
- Understand impact in plain language
- Receive prioritized recommendations

The platform solves this by combining deterministic profiling with agentic AI insights inside an intuitive web workflow—no backend database or heavy infra required.

## 2. What You Build
An interactive Next.js application that:
- Accepts CSV / JSON / Excel files client‑side
- Profiles columns & aggregates quality indicators
- Generates a composite quality score
- Produces AI‑generated explanations + remediation tips
- Visualizes metrics (distributions, issue counts, score trend)

## 3. Core Features
- File Upload (CSV, JSON, XLS/XLSX) with size & format validation
- Column Profiling: type inference, null %, distinct count, outlier spotting
- Quality Scoring: weighted aggregation of issue severities
- AI Insights: natural language summaries & prioritized fixes
- Visual Dashboards: charts for score, missingness, cardinality, distributions
- Drill‑Down: per‑column stats & issues listing
- Resilient Error Boundary & graceful fallbacks (no API key mode)

## Project Requirements & Scope

### Project Name

Agentic Data Quality Platform

### One-sentence description

AI-augmented web app that profiles tabular datasets, surfaces data-quality metrics (completeness, uniqueness, validity), and generates prioritized remediation guidance for analysts.

### Primary goal

Deliver an approachable, practical data-quality analysis tool that lets non-engineer data consumers quickly understand dataset health, receive prioritized remediation guidance (AI + heuristics), and take action.

### Success criteria

- Users can upload a CSV/JSON/Excel file and receive an interactive profile (columns, missing counts, unique counts, outliers).
- The app delivers prioritized remediation guidance via the AI insights endpoint, and falls back to deterministic heuristics when AI is unavailable.
- The project includes automated tests (unit + route tests) and has a stable local dev flow + README for setup and running.

### Target users

Data analysts, engineers doing ad-hoc data exploration, and engineering students learning data quality best-practices.

### User needs

- Rapid dataset profiling with easy-to-read metrics and column summaries.
- Clear, prioritized remediation guidance that is actionable (what to fix, why it matters, how to proceed).
- Resilient behavior — helpful heuristics when AI service is unavailable, and a simple path to iterate on results.

### MVP (must-have)

1. File upload + parse (CSV/JSON/Excel) and schema detection.
2. Column-level profiling (missing, unique, type, numeric outliers) and an overall quality score.
3. AI-driven remediation insights endpoint with clear fallback heuristics and client-side UI to surface insights.

### Should-have

1. Persistent recent analyses and lightweight history (recent analyses panel on home screen).
2. Basic dashboards / visualizations for outliers and distribution per column.

### Could-have (stretch goals)

1. Integration with monitoring / alerting tools (e.g., scheduled pipeline checks or Great Expectations style checks).
2. Automated remediation helpers (generate SQL or transformation suggestions for common fixes; exportable change lists)

### Technical stack summary

- Frontend: Next.js 16 + React 18 (App Router)
- Routing: App Router (file-based) with client/server boundaries for data and API calls
- Data management: In-memory context (client-side profiling) with optional persistence for recent analyses
- Styling: Custom CSS (design tokens in `src/app/globals.css` + component styles in `src/styles/*`)
- API: Local `/api/insights` endpoint that integrates with OpenAI and a deterministic heuristics fallback when AI is unavailable

### Typical timeline (14 days)

- Sprint 1 (Days 1–3): Project setup, file parsing, schema detection, and basic profiling UI.
- Sprint 2 (Days 4–7): Column metrics, quality scoring, basic dashboard and visualizations.
- Sprint 3 (Days 8–10): AI-backed insights endpoint + deterministic heuristics fallback, client integration and UX.
- Sprint 4 (Days 11–14): Tests, accessibility polish, UX improvements, deployment docs, and final delivery materials.

### Deliverables / checklist

- Deployed application (Vercel / Netlify or equivalent)
- GitHub repository with README and clear setup instructions
- Test suite for core modules and API routes (unit + route tests)
- Project documentation and brief architecture notes
- Presentation materials and demo notes for course submission

## 4. How It Works (Architecture)
Client only. Parsing via Papa Parse / SheetJS. Profiling logic in `lib/dataAnalysis.js`. AI call (if key provided) via `/api/insights` endpoint using OpenAI; falls back to heuristic text if missing. State managed with React context (`lib/DataContext.jsx`). All styling is modular CSS in `src/styles`. Chart rendering handled by Chart.js via `react-chartjs-2` wrappers.

```
Upload → Parse → Profile → Score → (AI Explain) → Visualize → Explore Details
```

## 5. Tutorial Flow & Milestones
- Milestone 1: Environment, layout, file upload UX
- Milestone 2: Data profiling & scoring engine
- Milestone 3: AI integration + charts + insights accordion
- Milestone 4: Testing (Vitest + RTL), performance & polish
Reference documents: `data-analysis-tutorial/start_here.md`, `overview.md`, `04-SETUP_INSTRUCTIONS.md`.

## 6. Setup & Installation
Prerequisites: Node.js 18+, npm (or pnpm), Git, OpenAI API key (optional for AI insights).

Clone & install:
```bash
git clone <your-repo-url>
cd Data-Analysis
npm install
```

Environment variables (`.env.local`):
```bash
OPENAI_API_KEY=sk-...           # optional; enables real AI insights
NEXT_PUBLIC_MAX_FILE_SIZE_MB=50
NEXT_PUBLIC_SUPPORTED_FORMATS=csv,json,xlsx
# NEXT_PUBLIC_INSIGHTS_ENDPOINT=https://your-domain.com/api/insights

# Alternate key names also supported: NEXT_PUBLIC_OPENAI_API_KEY, VITE_OPENAI_API_KEY.
```

Run dev server:
```bash
npm run dev
# Open http://localhost:3000
```

## 7. Usage Guide
1. Navigate to the home page and upload a dataset.
2. Review preview table & initial stats.
3. Open Analysis view: inspect quality score + charts.
4. Expand AI Insights (requires `OPENAI_API_KEY`).
5. Drill into columns for detailed profiling.
6. Export or copy insights (future enhancement).

Without an API key: heuristic text placeholders appear—still useful for structural review.

## 8. Testing
Run unit tests:
```bash
npm test
```
Vitest + React Testing Library cover parsing, profiling logic, and component rendering. Extend tests in `src/test/__tests__/` for new features.

## 9. Accessibility & Performance Goals
- WCAG 2.1 AA contrast & keyboard operability
- Focus outlines preserved; semantic landmarks
- Lighthouse targets: Performance ≥85, Accessibility ≥90, FCP <1.5s, TTI <3s
- Client parsing only—no network roundtrips for file content

## 10. Tech Stack
- Framework: Next.js 16 (App Router) + React 18
- Parsing: Papa Parse / SheetJS (`xlsx`)
- Visualization: Chart.js + react-chartjs-2
- AI (optional): OpenAI via route `/api/insights`
- Styling: Vanilla CSS modules (no Tailwind)
- Testing: Vitest + @testing-library/react

## 11. Learning Outcomes (CCC.1)
- CCC.1.1: Problem framing (data quality need)
- CCC.1.2: Design of modular profiling pipeline
- CCC.1.3: Implementation with accessible, performant UI
- CCC.1.4: Testing deterministic logic & UI behavior
- CCC.1.5: Clear documentation & user guidance

## 12. Contributing & Extensions
Ideas:
- Add report export (Markdown / PDF)
- Pluggable scoring weights via UI
- Column anomaly timeline (if multiple uploads)
- Lightweight in‑browser caching of last analyses
Open a PR with a concise description and test coverage for new logic in `dataAnalysis.js`.

## 13. License
MIT – Educational use encouraged. See `LICENSE`.

---
Quick Reference:
```bash
npm install      # dependencies
npm run dev      # start dev server
npm test         # run tests
```

Optional: See `README-NEXT.md` for default Next.js scaffold reference.

