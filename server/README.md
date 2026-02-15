# PandaPal Document Parsing API

## Setup

```bash
cd server
npm install
cp .env.example .env
# Edit .env and set ANTHROPIC_API_KEY
```

## Run

```bash
npm start
# Or with auto-reload: npm run dev
```

Server listens on `PORT` (default 3001).

## Endpoints

- **POST /api/upload** — Multipart form: `files` (array of PDF/image), optional `pasted_text`. Returns `{ parsed_plan, conflicts, extracted_text_preview }`.
- **POST /api/confirm-care-plan** — JSON body: `{ care_plan }`. Saves caregiver-confirmed plan (stub).
- **GET /health** — Health check.

## Environment

- `PORT` — Server port (default 3001).
- `ANTHROPIC_API_KEY` — Required for Claude parsing.

## Mobile app

Set the API base URL when running the app (e.g. your machine IP for device):

```bash
EXPO_PUBLIC_API_URL=http://192.168.1.x:3001 npx expo start
```
