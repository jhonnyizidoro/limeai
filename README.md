# LimeAI

Clinical note-taking app powered by AI. Accepts voice recordings or typed text, transcribes audio via OpenAI Whisper, and structures the result into a SOAP note using GPT-4o mini.

- [Local Environment Setup](docs/local-setup.md)
- [Deployment Guide](docs/deploy.md)

---

## Stack

| Layer | Tech |
|---|---|
| Backend | [Elysia](https://elysiajs.com) (Node adapter), TypeScript, PostgreSQL |
| ORM | [Kysely](https://kysely.dev) with codegen |
| AI | OpenAI (Whisper + GPT-4o mini) |
| Frontend | React 19, Vite, TanStack Query |
| Storage | Local filesystem or AWS S3 |
| Infra | Docker Compose, GitHub Actions |

---

## Environment Variables

Copy `.env.example` to `.env` and fill in the values.

| Variable | Description | Example |
|---|---|---|
| `POSTGRES_USER` | Database username | `limeai` |
| `POSTGRES_PASSWORD` | Database password | `limeai` |
| `POSTGRES_DB` | Database name | `limeai` |
| `POSTGRES_HOST` | Database host (use `postgres` inside Docker) | `postgres` |
| `POSTGRES_PORT` | Database port | `5432` |
| `OPEN_AI_KEY` | OpenAI API key for Whisper and GPT-4o mini | `sk-...` |
| `STORAGE_TYPE` | Where audio files are stored (`local` or `s3`) | `local` |
| `UPLOADS_URL` | Public base URL for serving uploaded audio files | `http://localhost:8080` |
| `VITE_API_URL` | Backend API URL (baked into the frontend at build time) | `http://localhost:3000` |
| `AWS_ACCESS_KEY` | AWS access key — required when `STORAGE_TYPE=s3` | `AKIA...` |
| `AWS_SECRET_KEY` | AWS secret key — required when `STORAGE_TYPE=s3` | `abc123...` |
| `AWS_BUCKET` | S3 bucket name — required when `STORAGE_TYPE=s3` | `limeai` |
| `AWS_REGION` | AWS region — required when `STORAGE_TYPE=s3` | `us-east-1` |

### `STORAGE_TYPE`: local vs s3

**`local`** — audio files are saved to `./uploads/audio/` on the host machine and served by a dedicated nginx container on port `8080`. No AWS credentials needed. Good for development and simple single-server deployments.

**`s3`** — audio files are uploaded directly to an S3 bucket. The bucket must have public read access (or pre-signed URLs). Requires `AWS_ACCESS_KEY`, `AWS_SECRET_KEY`, `AWS_BUCKET`, and `AWS_REGION`. Recommended for production when multiple servers or CDN delivery is needed.

---

## Backend

Located in [`backend/`](backend/). Elysia runs on Node via `@elysia/node`.

### Structure

```
backend/src/
├── controllers/
│   ├── notes.ts       # POST /notes, GET /notes, GET /notes/:id
│   └── patients.ts    # GET /patients
├── db/
│   ├── index.ts       # Kysely db instance
│   ├── types.ts       # Auto-generated DB types (via kysely-codegen)
│   └── migrations/    # Timestamped migration files
│   └── scripts/
│       ├── migrate.ts       # Runs pending migrations
│       ├── seed.ts          # Seeds sample patients and notes
│       └── generate-types.ts # Regenerates db/types.ts from schema
├── lib/
│   ├── soap.ts              # Structures raw text into SOAP note via GPT-4o mini
│   ├── transcribe/          # Transcribes audio via Whisper
│   ├── uploadAudio/         # Routes audio to local or S3 based on STORAGE_TYPE
│   ├── uploadAudioToFileSystem/
│   └── uploadAudioToS3/
└── utils/
    └── detectMimeType/      # Detects audio MIME type from base64
```

### API Routes

| Method | Path | Description |
|---|---|---|
| `GET` | `/patients` | List all patients (id + name) |
| `GET` | `/notes` | List all notes, each with nested patient data |
| `GET` | `/notes/:id` | Get a single note with patient data |
| `POST` | `/notes` | Create a note from text or audio |

`POST /notes` body:

```json
{
  "patientId": "uuid",
  "text": "optional raw text",
  "audioBase64": "optional base64-encoded audio"
}
```

The creation pipeline: audio → Whisper transcription → raw text → GPT-4o mini → SOAP note. Both `rawText` and `processedText` (SOAP) are stored.

### Elysia

Each route is typed end-to-end using [TypeBox](https://github.com/sinclairzx81/typebox) schemas on both request and response. Swagger UI is available at `/swagger` in development.

### Kysely + Codegen

Kysely is a type-safe SQL query builder. The `DB` type in `db/types.ts` is auto-generated from the live database schema using `kysely-codegen`. Run it manually with:

```bash
cd backend && pnpm exec kysely-codegen
```

In development (non-production), the app runs `generate-types.ts` on startup automatically after migrations.

### Tests

Tests live alongside source files (`*.test.ts`). Run with:

```bash
cd backend && pnpm test
```

---

## Frontend

Located in [`frontend/`](frontend/). React 19 SPA built with Vite.

### Pages

| Route | Component | Description |
|---|---|---|
| `/` | `NotesListPage` | Lists all notes with patient name, MRN, physician, and indicators for SOAP and audio |
| `/notes/new` | `NoteCreatePage` | Form to create a note — toggle between text input or audio file upload, select patient |
| `/notes/:id` | `NoteDetailPage` | Shows full note: patient details, embedded audio player (if audio), SOAP note, raw transcript |

### Type-safe API Client

The frontend uses a custom typed `api` client (`src/api/api.ts`) built on top of types generated by [openapi-typescript](https://github.com/openapi-ts/openapi-typescript).

**How it works:**

1. The backend exposes an OpenAPI spec at `/swagger/json` (via Elysia's Swagger plugin)
2. `openapi-typescript` reads that spec and generates `src/api/types.ts` — a TypeScript interface describing every route, its parameters, request body, and response shape
3. The `api` client maps each method (`get`, `post`, etc.) through generic types that infer the correct request and response types from the route path

**Result:** calling `api.get("/notes/")` returns a fully-typed array of notes. Calling `api.get("/notes/{id}", { params: { id } })` knows both the required path param and the response shape. Wrong bodies or missing params are caught at compile time.

To regenerate types after a backend schema change:

```bash
# Backend must be running
cd frontend && pnpm run gen:types
```

### TanStack Query

Data fetching uses TanStack Query (`@tanstack/react-query`). Queries are keyed by route — e.g. `["notes-list"]` and `["note", id]`. On note creation, the query cache is updated optimistically before navigation.
