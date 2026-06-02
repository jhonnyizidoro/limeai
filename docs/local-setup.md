# Local Environment Setup

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Node.js 22+](https://nodejs.org)
- [pnpm](https://pnpm.io) (`npm install -g pnpm`)

---

## 1. Clone the repo

```bash
git clone https://github.com/jhonnyizidoro/limeai.git
cd limeai
```

## 2. Configure environment

```bash
cp .env.example .env
```

Open `.env` and fill in the required values:

- `OPEN_AI_KEY` — get one at [platform.openai.com](https://platform.openai.com)
- `STORAGE_TYPE` — set to `local` to skip AWS setup
- `UPLOADS_URL` — set to `http://localhost:8080` for local storage
- `VITE_API_URL` — set to `http://localhost:3000`
- Postgres values can stay as the defaults from `.env.example`

## 3. Start services

```bash
docker compose up
```

This starts four containers:

| Container | URL | Description |
|---|---|---|
| `backend` | http://localhost:3000 | Elysia API server (hot reload via tsx) |
| `frontend` | http://localhost:5173 | Vite dev server (HMR) |
| `postgres` | localhost:5432 | PostgreSQL database |
| `static` | http://localhost:8080 | nginx serving uploaded audio files |

On first run, the backend automatically:
1. Runs all pending database migrations
2. Regenerates `backend/src/db/types.ts` from the live schema
3. Seeds sample patients and notes

## 4. Open the app

Navigate to http://localhost:5173.

Swagger API docs are available at http://localhost:3000/swagger.

---

## Useful Commands

### Backend

```bash
# Run tests
cd backend && pnpm test

# Regenerate DB types after a schema change (backend must be running)
cd backend && pnpm exec kysely-codegen

# Add a new migration
# Create a file: backend/src/db/migrations/<timestamp>_<name>.ts
# Restart the backend container — migrations run on startup
```

### Frontend

```bash
# Run tests
cd frontend && pnpm test

# Regenerate API types from the live backend OpenAPI spec
# (backend must be running at VITE_API_URL)
cd frontend && pnpm run gen:types
```

---

## Adding a Migration

Migration files live in `backend/src/db/migrations/`. Name them with a timestamp prefix so they run in order:

```
20260601T000000_create_patients.ts
20260601T010000_create_notes.ts
```

Each file exports an `up` function:

```typescript
import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("example")
    .addColumn("id", "uuid", (col) => col.primaryKey())
    .execute();
}
```

Restart the backend container (or the dev server) — migrations run automatically on startup.

---

## Audio Storage (local mode)

When `STORAGE_TYPE=local`, uploaded audio files are saved to `./uploads/audio/` on your host machine and mounted into both the `backend` and `static` containers. The `static` nginx container serves them at `http://localhost:8080`.

Set `UPLOADS_URL=http://localhost:8080` so the frontend can construct the correct audio URLs.
