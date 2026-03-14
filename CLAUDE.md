# CLAUDE.md — Clipboard Inbox

## Project
Clipboard Inbox — a lightweight app for capturing links/notes/snippets and triaging them.

## Stack
- Frontend: React + Vite + TypeScript (`/client`)
- Backend: Express + TypeScript (`/server`)
- Database: SQLite via better-sqlite3
- Monorepo with root package.json

## Dev Commands
- `npm install` — install all deps
- `npm run dev` — start both frontend and backend
- `npm run build` — build both

## Data Model
ClipboardItem: id, content, title, url, tags (JSON string), state (inbox/kept/archived), created_at, updated_at

## API
- `GET /api/items` — list items (reverse chronological)
- `POST /api/items` — create item
- `PUT /api/items/:id` — update item
- `DELETE /api/items/:id` — delete item

## Rules
- Keep it simple — no ORM, no heavy frameworks
- Raw better-sqlite3 queries
- Backend port 3001, frontend port 5173
- Auto-detect URLs from pasted content
