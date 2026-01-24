# wrPadi

Modern restaurant web app (Nuxt 4 + Nuxt UI v4) with:
- Public landing/menu/reviews/location
- Table reservation (WhatsApp confirmation)
- Dine-in ordering via QR per table + take-away ordering
- Midtrans payment gateway (webhook is the source of truth)
- Admin dashboard (tables, menu, featured sections, reservations, order queue)

## Requirements
- Node.js 20+ (this repo was bootstrapped with Node 22)
- PostgreSQL (for Prisma)

## Setup
```bash
npm install
cp .env.example .env
```

## Development
```bash
npm run dev
```

Health endpoint: `GET /api/health`

## Quality Guardrails
```bash
npm run lint
npm run typecheck
```

## Database (Prisma)
```bash
npm run db:generate
npm run db:migrate
npm run db:studio
```

## Project Guidance
- Copilot rules live in `.github/copilot-instructions.md`
- Architecture overview: `docs/ARCHITECTURE.md`
- Decisions: `docs/adr/`
- MCP guidance: `docs/MCP.md`
