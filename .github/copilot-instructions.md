# Copilot Instructions (wrPadi)

## Project Goal

Build a modern restaurant web app for an Indonesian food restaurant featuring authentic salmon fish soup:

- Public website (landing + menu + reviews + location/contact)
- Table reservation (confirm via WhatsApp for now; configurable later)
- Dine-in ordering via QR per table
- Take-away ordering
- Midtrans payment gateway for online payments
- Admin dashboard for managing tables, menu, featured sections, reservations, and order queue

## Non-Negotiable Stack

- Nuxt 4 (TypeScript, SSR by default)
- Nuxt UI v4 for UI components (Tailwind-based). Prefer Nuxt UI components over raw HTML.
- PostgreSQL as primary database (via Prisma)
- Payment provider: Midtrans

## Architecture Rules

- UI layer:
  - `pages/`, `layouts/`, `components/` should not contain direct database access.
  - Business logic belongs in `composables/` and `server/services/`.
- Server/API layer:
  - All DB access must be in server-side code only (e.g. `server/*`).
  - API routes live in `server/api/`.
  - Validate input on server routes (schema validation).
- Keep changes minimal and focused. Do not restructure folders unless explicitly requested.

## Code Quality Guardrails

- Do not add new dependencies without stating why and how it will be used.
- Prefer existing project patterns over inventing new ones.
- Ensure `npm run lint` and `npm run typecheck` pass for any change.
- Avoid `any` in TypeScript. If unavoidable, document why.

## UI Guidelines (Nuxt UI)

- Use Nuxt UI components for: buttons, forms, modals, cards, navigation, and tables.
- **Form fields**: Always add `class="w-full mb-4"` to UInput, UTextarea, USelect, and other form components for consistent full-width styling.
- Keep a consistent design token approach (colors/spacing/radius). Don't hardcode styles per-page.
- Landing page sections should be built as small reusable components (Hero, FeaturedMenu, Favorites, Reviews, CTA).

### Nuxt UI v4 Table API

- **Always wrap UTable in `<ClientOnly>` to prevent hydration mismatches:**
  ```vue
  <ClientOnly>
    <UTable :data="items" :columns="columns" />
    <template #fallback>
      <div class="p-4 text-center text-gray-500">Loading...</div>
    </template>
  </ClientOnly>
  ```
- Use `:data` prop (not `:rows`)
- Column definition format: `{ accessorKey: 'field', header: 'Label' }` (not `key/label`)
- Slot naming: `#columnName-cell` (not `#columnName-data`)
- Access row data: `row.original.fieldName` (not `row.fieldName`)
- Component names: `UDropdownMenu` (not `UDropdown`)
- Valid colors: `primary`, `secondary`, `success`, `error`, `warning`, `info`, `neutral`, `purple` (defined in `app.config.ts`)
- For custom colors: Add to `app.config.ts` under `ui.colors` mapping to Tailwind color names

### SSR & Hydration

- **Avoid hydration mismatches:** Wrap components that render differently on server/client (dates, random data, browser APIs) in `<ClientOnly>`
- Date formatting should always be inside `ClientOnly` when displayed in tables or dynamic content
- Tables with complex client-side interactions should be wrapped in `ClientOnly` entirely

## Domain Rules (Restaurant)

- QR dine-in:
  - Each table has a stable `tableCode` used in QR URLs.
  - Orders must support `DINE_IN` and `TAKEAWAY`.
- Payments:
  - Payment status must be finalized from Midtrans webhook callbacks (webhook is source of truth).
  - Never mark an order as paid solely from client-side redirects.
- Reservations:
  - Start with WhatsApp confirmation (status `PENDING` -> `CONFIRMED` by staff).
  - Keep the design flexible for future deposit/auto-confirm.
