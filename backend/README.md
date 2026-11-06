# Renewly backend (planned)

Not implemented yet. The frontend runs entirely on mock services for now.

Planned stack: FastAPI, PostgreSQL, SQLAlchemy and Alembic.

## API the frontend expects

The base URL is `VITE_API_URL`, for example `http://localhost:8000/api`. The user always comes from the session, never from the request body.

| Method | Path                  | Body                | Returns          |
| ------ | --------------------- | ------------------- | ---------------- |
| GET    | `/subscriptions`      | –                   | `Subscription[]` |
| POST   | `/subscriptions`      | `SubscriptionInput` | `Subscription`   |
| PUT    | `/subscriptions/{id}` | `SubscriptionInput` | `Subscription`   |
| DELETE | `/subscriptions/{id}` | –                   | 204              |

Errors should return `{ "detail": "message" }`, which is FastAPI's default. The frontend shows that message to the user.

`SubscriptionInput` is `{ name, price, currency, billingCycle: "monthly" | "yearly", renewalDate: "YYYY-MM-DD", category, notes? }`. See `frontend/src/types/index.ts`.

## Later

- Real authentication, for example session cookies.
- A scheduled job that finds renewals inside each user's reminder window and sends email reminders.
- Exchange rates fetched from a provider instead of the fixed table.
