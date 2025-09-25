# AI Ad Slot Manager

AI-first ad tech monorepo showcasing a production-ready workflow for orchestrating Prebid.js ad delivery, web performance telemetry, and an explainable rules engine that recommends monetization optimizations.

## Features

- **Article experience** built with Next.js 15, React 19, TailwindCSS, Zustand, and shadcn/ui components. Slots reserve layout space to keep CLS near zero while a mock Prebid.js adapter asynchronously serves ads with a graceful fallback.
- **Metrics pipeline** collects Core Web Vitals (CLS, LCP, FID), total blocking time, ad load latency, timeout rates, and viewability via IntersectionObserver, then streams data to the backend API.
- **Express + Prisma API** exposes REST endpoints for metrics ingestion, analytics summaries, AI recommendations, and ad slot CRUD, backed by PostgreSQL (and Redis-ready) with structured logging.
- **Local rules engine** scores slot performance and recommends actions such as reordering sluggish slots, tuning Prebid timeouts, enabling lazy loading, or flagging CLS-heavy creatives.
- **Dashboard** visualizes per-slot performance trends and recommendation rationales, refreshable on demand.
- **DevOps ready** with Docker, docker-compose, GitHub Actions CI, ESLint/Prettier, Jest + Testing Library + Supertest, and Prisma migrations.

## Architecture

```
+-------------------+        +--------------------+        +------------------------+
|  Next.js Frontend | <--->  |  Express API Layer | <----> | PostgreSQL + Prisma ORM |
| - Article + Ads   |        | - Metrics ingest   |        | - AdSlot, Metric, Rec   |
| - Metrics collector|       | - Analytics + CRUD |        +------------------------+
| - React Query      |       | - AI Rules engine  |
+----------+---------+       +---------+----------+
           |                          |
           v                          v
    Prebid.js Mock             Redis (optional)
    Bidder Adapter             for caching later
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- Docker & docker-compose (optional but recommended for full stack)

### Install dependencies

```bash
npm install
npm run prisma:generate --workspace backend
```

### Local development

Run backend and frontend together with hot reloading:

```bash
npm run dev
```

- API available at http://localhost:4000
- Frontend available at http://localhost:3000

> Tip: Seed ad slots via Prisma Studio or the `/ad-slots` endpoints if you want to override the default client-side configuration.

### Dockerized stack

Bring up Postgres, Redis, the API, and the Next.js app in one command:

```bash
docker-compose up --build
```

Services:
- Postgres: `localhost:5432`
- Redis: `localhost:6379`
- API: `http://localhost:4000`
- Frontend: `http://localhost:3000`

### Testing & linting

```bash
npm run lint
npm run typecheck
npm run test
```

Jest covers the AI rules engine, metrics aggregation, and key frontend UI states. React Testing Library validates dashboard components.

### CI/CD

GitHub Actions workflow (`.github/workflows/ci.yml`) installs dependencies, generates Prisma client, runs lint/typecheck/build, and executes the full test suite on pushes and pull requests.

## Backend API Overview

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/metrics` | `POST` | Ingest slot metrics payloads (validated via zod). |
| `/analytics/summary` | `GET` | Returns per-slot aggregates (CLS, LCP, TBT, load time, timeout rate, viewability, sample count). |
| `/ai/recommend` | `POST` | Executes the rules engine and persists recommendations. |
| `/ai/recommend` | `GET` | Fetches the latest stored recommendations. |
| `/ad-slots` | `GET` | List configured ad slots ordered by waterfall priority. |
| `/ad-slots/:id` | `GET` | Fetch a single slot. |
| `/ad-slots` | `POST` | Create a new ad slot. |
| `/ad-slots/:id` | `PUT` | Update ad slot fields. |
| `/ad-slots/:id` | `DELETE` | Remove an ad slot. |

## Rules Engine Highlights

Rules run locally within the API so publishers can keep data in-house while retaining the option to swap in an external AI service later. Current heuristics include:

- **Reorder slow slots** when ad load time exceeds 2.5s.
- **Adjust Prebid timeout** when timeout rate surpasses 20%.
- **Recommend lazy loading** for below-the-fold placements with weak viewability.
- **Flag CLS-heavy creatives** once cumulative layout shift crosses the 0.1 threshold.

Each recommendation returns an action, rationale, and priority so teams can triage quickly.

## Prisma Data Model

- `AdSlot`: placement metadata, supported sizes, timeout configuration, lazy loading flag, sort order.
- `Metric`: individual measurements tied to a slot.
- `Recommendation`: AI-generated suggestions with rationale and priority.

Migrations can be generated with `npm run prisma:migrate --workspace backend` after adjusting the schema.

## Frontend Notes

- Metrics collector (`lib/metricsCollector.ts`) hooks into `web-vitals`, `PerformanceObserver`, and `IntersectionObserver` to synthesize payloads sent to the API.
- Prebid integration uses the official library plus a mock bidder adapter (`public/prebid-mock-adapter.js`) to illustrate asynchronous bidding and graceful fallbacks.
- Zustand drives demo ad slot configuration; production use would hydrate from the API.
- The dashboard leverages React Query for data freshness and Tailwind/shadcn UI primitives for accessible visuals.

## Contributing

1. Fork and clone the repository.
2. Create your feature branch (do **not** commit to `main`).
3. Run `npm run lint && npm run test` before opening a PR.
4. Update documentation as needed.

## License

MIT License © 2024 AI Ad Slot Manager contributors
