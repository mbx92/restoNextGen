# ADR 0004: Database Access

## Decision
Use PostgreSQL with Prisma ORM.

## Rules
- Prisma client is used only on the server.
- No direct database access from `pages/`, `components/`, or `composables/` that run on the client.
- API routes (`server/api/*`) call domain services (`server/services/*`), which then call Prisma (`server/db/*`).

## Consequences
- We get a clear data-access boundary and predictable migrations.
- New DB models and relations must be added in `prisma/schema.prisma` and applied via migrations.
