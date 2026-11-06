# Mohar

A subscription tracker that can work with your bank. It finds what you pay for in your bank payments (or you add it yourself), warns you before renewals and before free trials turn paid, shows where each subscription is cancelled, and checks afterwards that the charge really stopped.

This is a **frontend prototype**. Authentication and bank connections are simulated: demo accounts, fictional banks, and six months of sample payments per account. All data stays in the browser's `localStorage`. The FastAPI backend is planned and not built yet.

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

All of them use the password **`mohar-demo`**. You can also click an account on the sign-in page.

| Name            | Email           | Data                         | Home region   | Demo highlights                                              |
| --------------- | --------------- | ---------------------------- | ------------- | ------------------------------------------------------------ |
| Maya Chen       | maya@mohar.app  | 9 subscriptions, USD         | United States | Adobe free trial, Netflix price rise, unnamed App Store charge, Audible not tracked |
| Aarav Shrestha  | aarav@mohar.app | 7 subscriptions, USD and NPR | Nepal         | **Low balance warning**, YouTube via eSewa, Spotify via Khalti, Google Play charge |
| Sofia Lindqvist | sofia@mohar.app | 6 subscriptions, EUR         | Nordics       | Disney+ via PayPal, NYT trial, Spotify price rise            |

Each account has its own subscriptions, bank connection and settings. **Settings → Restore sample subscriptions** resets an account's list. Disconnecting the bank removes its payment data.

### A five-minute walkthrough

1. Sign in as Maya. Overview shows "Connect your bank to find what you've missed".
2. **Bank & detection**, pick any partner bank (your region is listed first), then **Allow read-only access**. Mohar reads the sample payments and lists what it found. Each finding has a "How we recognised this" explanation.
3. **Track trial** on Adobe, **Name it** on the App Store payment, and **Not a subscription** on anything you want to ignore.
4. Back on **Overview**, "Worth a look" shows the trial countdown and the Netflix price rise.
5. Open **Headspace → Stop it**. Follow the guide, add a confirmation reference, then **Demo: jump to …** to simulate the next billing date. Headspace is scripted to keep charging, so Mohar flags it. Try Figma for a clean stop.
6. **Subscriptions → Stopped** shows the checks and what you've saved.
7. Sign in as Aarav and connect a partner bank to see the balance warning.
8. Open **Settings → Notifications**: switch on browser notifications, press **Send a test**, then open the bell and **Email outbox**.

## What's in it

- **Partner banks**: a searchable directory of Mohar's partner banks by region, showing whether each connects from Mohar or also runs Mohar inside its own app. The list lives in `src/data/partnerBanks.ts`. The banks are fictional; replace them with real partners when agreements exist.
- **Bank connection (simulated)**: read-only consent screen, account balance, recent payments, sync and disconnect.
- **Notifications**: a reminder engine (`src/utils/reminders.ts`) runs on sign-in, whenever data changes, and every minute. It follows the user's preferences: which events (renewals, trials, price rises, balance, stop checks), how early (reminder timing), and which channels. Each reminder is delivered once, to:
  - **In-app**: the bell inbox plus a pop-up.
  - **Browser**: real system notifications through the Notification API, after the user allows them. Clicking one opens the right page.
  - **Email (simulated)**: a branded email in **Email outbox**, addressed to the user. Nothing is actually sent.
- **Detection from payments**: repeating charges (monthly or yearly), free trials (a 0.00 card check), app store or Google Play charges that need naming, and price rises. Detections are matched to your list so nothing is suggested twice.
- **"Worth a look" insights**: balance won't cover this week's renewals, trial turning paid, price rise (with "Update price"), untracked subscriptions, unnamed payments, stop checks.
- **Stop journey**: last day to cancel, where it's managed for each payment channel, steps, optional confirmation reference, then a check on the next billing date. Mohar never cancels anything for you.
- **Savings tracker**: what stopped subscriptions save per month and so far.
- **Subscription detail page**: payment history from the bank with price rises marked, next charge, reminder date, and how it was recognised.
- **Payment channels**: card, PayPal, App Store, Google Play, eSewa, Khalti, bank transfer.
- **Separate reminder timing** for monthly renewals, yearly renewals and free trials.
- **Dashboard**: stat cards, a 12-month charge forecast, a category donut, the subscription list and the next 30 days.
- **Light and dark themes**, a landing page with a "Works with your bank" section, and a responsive layout.

### What Mohar can and can't know

It only uses what a bank can see: merchant, amount, date and balance. It never claims to know whether you use an app, never moves money or blocks a payment, and never cancels on your behalf. Free-trial end dates are an estimate (7 days after the card check) until you confirm them.

### Calculations

- A monthly plan's monthly cost is its price. A yearly plan's monthly cost is its price divided by 12. Stopped subscriptions are left out of totals.
- Totals are converted to the display currency using fixed approximate rates (`src/utils/currency.ts`).
- If a stored renewal date has passed, the next one is found by stepping forward whole billing cycles (`nextRenewalDate` in `src/utils/billing.ts`).
- Detection rules live in `src/utils/detection.ts`, a pure function so it can move to the server unchanged.

## Project structure

```text
frontend/src/
├── components/   brand, ui, landing, dashboard, bank, charts
├── contexts/     Auth, Subscriptions, Bank (connection, payments, detections), Editor (dialogs), Theme, Toast
├── data/         demo users, seed subscriptions, simulated banks and payments, stop guides
├── hooks/        dashboard stats, insights, typewriter, seen reminders
├── layouts/      dashboard shell (sidebar and mobile drawer)
├── pages/        landing, login, legal, 404, dashboard/* (overview, subscriptions, detail, renewals, bank, settings)
├── routes/       route guards
├── services/     service interfaces, mock implementations, HTTP client for FastAPI
├── types/        shared TypeScript types
└── utils/        billing math, detection, dates, currency, channels, formatting, validation
```

## Moving to a real backend and bank

Components never touch storage directly. They call the services in `src/services/index.ts`, which implement the interfaces in `src/services/types.ts`.

- `VITE_USE_MOCK_API=false` switches subscriptions to `httpSubscriptionService`.
- `BankService` is the seam for a real account-information provider: open banking (for example PSD2 in Europe), a partner bank or wallet API (for example in Nepal), or the bank's own data when Mohar runs inside its app.
- Auth, settings and bank still use mocks. Add HTTP versions next to them and swap them in `services/index.ts`.

See `backend/README.md` for the planned API.

> **Security note.** In this prototype, data is separated by filtering on `userId` in the browser. That isn't security. The backend must take the user from the authenticated session and enforce ownership on every query. Real bank access needs explicit, revocable consent and encrypted token storage on the server.
