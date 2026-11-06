# Renewly

A subscription tracker prototype. It keeps track of what you pay for, shows what renews next, and flags renewals before they're charged.

This is a **frontend prototype**. Authentication is simulated with demo accounts and all data is stored in the browser's `localStorage`. The FastAPI backend is planned and not built yet.

## Run it locally

Requires Node 20+.

```bash
cd frontend
npm install
cp .env.example .env    # optional, the defaults work
npm run dev
```

Open http://localhost:5173.

Other scripts: `npm run build` (typecheck and production build), `npm run preview`, `npm run typecheck`.

## Demo accounts

All of them use the password **`renewly-demo`**. You can also click an account on the sign-in page.

| Name            | Email               | Data                         |
| --------------- | ------------------- | ---------------------------- |
| Maya Chen       | maya@renewly.app    | 9 subscriptions, USD         |
| Aarav Shrestha  | aarav@renewly.app   | 7 subscriptions, USD and NPR |
| Sofia Lindqvist | sofia@renewly.app   | 6 subscriptions, EUR         |

Each account has its own data. Changes made by one account don't show up in another. Use **Settings → Restore sample subscriptions** to reset an account.

## What's in it

- **Light and dark themes**: the toggle is in the navbar, the dashboard header and the sign-in page. The first visit follows your system setting, and your choice is saved after that. Colors live as CSS variables in `src/index.css`.
- **Fonts**: Bricolage Grotesque for headings, Plus Jakarta Sans for body text, JetBrains Mono for small labels.
- **Landing page**: a centered pill navbar that highlights the section you're in. A hero with an animated grid, a typewriter headline, and an orbit visual on the right with a live spending donut and floating reminder cards (it follows the mouse). Then the problem, features, how it works, a dashboard preview that tilts flat as you scroll, the final CTA and the footer.
- **Demo auth**: sign in, sign out, protected `/app/*` routes, and a redirect away from `/login` when you're already signed in.
- **Dashboard**: stat cards, a **12-month charge forecast** (stacked bars for monthly plans and yearly renewals, with hover details), a **category donut**, the subscription list and the next 30 days.
- **Subscriptions**: add, edit and delete, with validation. Search, filter by billing cycle, and sort.
- **Upcoming renewals**: grouped by time, showing when each reminder is due.
- **Reminders**: a bell panel lists renewals inside your reminder window (1, 3, 7 or 14 days). Reminders only appear in the app. No emails are sent.
- **Settings**: display currency, reminder window, and demo data reset.

### Calculations

- A monthly plan's monthly cost is its price. A yearly plan's monthly cost is its price divided by 12.
- The yearly estimate is the sum of each subscription's yearly cost.
- Totals are converted to the display currency using fixed approximate rates (`src/utils/currency.ts`).
- If a stored renewal date has passed, the next one is found by stepping forward whole billing cycles (`nextRenewalDate` in `src/utils/billing.ts`).

## Project structure

```text
frontend/src/
├── components/   brand, ui (primitives), landing, dashboard
├── contexts/     Auth, Subscriptions (per-user data and settings), Editor (dialogs), Toast
├── data/         demo users and seed subscriptions
├── hooks/        dashboard stats, seen-reminder tracking
├── layouts/      dashboard shell (sidebar and mobile drawer)
├── pages/        landing, login, legal, 404, dashboard/*
├── routes/       route guards
├── services/     service interfaces, mock implementations, HTTP client for FastAPI
├── types/        shared TypeScript types
└── utils/        billing math, dates, currency, formatting, validation
```

## Moving to the FastAPI backend

Components never touch storage directly. They call the services in `src/services/index.ts`, which implement the interfaces in `src/services/types.ts`.

- `VITE_USE_MOCK_API=false` switches subscriptions to `httpSubscriptionService`, which calls `GET/POST /subscriptions` and `PUT/DELETE /subscriptions/{id}` on `VITE_API_URL`.
- Auth and settings still use mocks. Add HTTP versions next to the mock ones and swap them in `services/index.ts`.

See `backend/README.md` for the planned API.

> **Security note.** In this prototype, data is separated by filtering on `userId` in the browser. That isn't security. The backend must take the user from the authenticated session and enforce ownership on every query.
