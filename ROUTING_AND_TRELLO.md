# Routing and Trello Blueprint in This App

## Routing

This app uses **Next.js App Router** for navigation. Routing is file-based:

- `src/app/page.jsx` → `/` (Home page)
- `src/app/preview/page.jsx` → `/preview`
- `src/app/dashboard/page.jsx` → `/dashboard`
- `src/app/details/page.jsx` → `/details`
- `src/app/analysis/page.jsx` → `/analysis`
- API routes: `src/app/api/insights/route.js` → `/api/insights`

Navigation is handled by Next.js, using `<Link>` components for client-side navigation. Each file or folder in `src/app/` becomes a route automatically.

## Trello Tasks and Blueprint

- The folder `data-analysis-tutorial/data-analysis-tutorial/` contains Trello cards and blueprint documentation.
- These files are **not** used by the live app to mark tasks as done.
- The actual app (in the root) does **not** automatically mark Trello tasks as done; the blueprint is just a reference for development.

---

**Summary:**
- Routing is automatic and file-based via Next.js App Router.
- Trello tasks in the blueprint folder are for planning only, not for live tracking or automation in the app.
