# Architecture

## Overview
This project is a Nuxt 4 web app with:
- Public SSR pages (SEO-friendly)
- Server API routes under `server/api/`
- A future admin dashboard under `/admin`
- PostgreSQL database access via Prisma (server-side only)
- Midtrans payment integration (server-side verification via webhooks)

## Folder Conventions
- `pages/`: route-level pages and orchestration (minimal logic)
- `components/`: presentational components (use Nuxt UI)
- `composables/`: reusable client/shared logic (`useXxx`)
- `server/api/`: API endpoints (request validation, auth checks)
- `server/services/`: business logic / integrations (DB, Midtrans)
- `server/db/`: Prisma client wrapper and DB helpers
- `prisma/`: Prisma schema and migrations
- `docs/adr/`: architecture decisions (source of truth)

## Boundaries
- UI code must not import Prisma or any server-only modules.
- DB writes and reads must happen on the server.
- Payment must be confirmed via Midtrans server callbacks.

## API Response Guidelines
- Use meaningful HTTP status codes.
- Return predictable JSON shapes.
- Prefer explicit enums for domain statuses (order, reservation, payment).
