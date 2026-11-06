# Mohar backend (planned)

Not implemented yet. The frontend runs entirely on mock services for now.

Planned stack: FastAPI, PostgreSQL, SQLAlchemy and Alembic.

## API the frontend expects

The base URL is `VITE_API_URL`, for example `http://localhost:8000/api`. The user always comes from the session, never from the request body.

### Subscriptions

| Method | Path                       | Body                | Returns          |
| ------ | -------------------------- | ------------------- | ---------------- |
| GET    | `/subscriptions`           | –                   | `Subscription[]` |
| POST   | `/subscriptions`           | `SubscriptionInput` | `Subscription`   |
| PUT    | `/subscriptions/{id}`      | `SubscriptionInput` | `Subscription`   |
| DELETE | `/subscriptions/{id}`      | –                   | 204              |
| PUT    | `/subscriptions/{id}/stop` | `StopRecord`        | `Subscription`   |
| DELETE | `/subscriptions/{id}/stop` | –                   | `Subscription`   |

`SubscriptionInput` is `{ name, price, currency, billingCycle, renewalDate, category, status, channel, source, merchantKey?, notes? }`. `StopRecord` is `{ stoppedAt, checkOn, reference?, note?, check }`. See `frontend/src/types/index.ts`.

### Bank (planned, mirrors `BankService`)

| Method | Path                         | Returns                                             |
| ------ | ---------------------------- | --------------------------------------------------- |
| GET    | `/bank/institutions`         | `BankInstitution[]`                                 |
| POST   | `/bank/connections`          | Starts consent with the provider; returns a redirect URL |
| GET    | `/bank/connection`           | `BankConnection` or 404                             |
| DELETE | `/bank/connection`           | 204, and deletes stored payment data                |
| POST   | `/bank/connection/sync`      | `BankConnection`                                    |
| GET    | `/bank/transactions`         | `Transaction[]`                                     |
| GET    | `/bank/detections`           | `DetectedSubscription[]` (detection runs server-side) |
| POST   | `/bank/detections/{key}/dismiss` | 204                                             |

### Notifications (planned, mirrors `NotificationService`)

| Method | Path                          | Returns                 |
| ------ | ----------------------------- | ----------------------- |
| GET    | `/notifications`              | `AppNotification[]`     |
| POST   | `/notifications/read`         | 204 (`{ ids }` or all)  |
| GET    | `/emails`                     | `EmailMessage[]` (sent log) |
| POST   | `/notifications/test`         | 204, sends a test through enabled channels |

The scheduler runs the same rules as `frontend/src/utils/reminders.ts`, stores each reminder by its key so it's only sent once, sends email through a provider (for example SMTP or a transactional email API), and sends browser push through Web Push with a service worker.

Errors should return `{ "detail": "message" }`, which is FastAPI's default. The frontend shows that message to the user.

## Later

- Real authentication, for example session cookies.
- An account-information provider integration with encrypted, revocable tokens.
- A scheduled job that syncs payments, runs detection, performs stop checks on each `checkOn` date, and sends reminders by email and Web Push.
- Exchange rates fetched from a provider instead of the fixed table.
