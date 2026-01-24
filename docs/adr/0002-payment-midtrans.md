# ADR 0002: Payment Gateway

## Decision
Use Midtrans as the payment gateway.

## Key Rules
- Midtrans webhook callbacks are the source of truth for payment status.
- Client-side redirects (finish/failed) are not sufficient for marking an order as paid.
- Persist provider references and webhook payloads for auditing and troubleshooting.
