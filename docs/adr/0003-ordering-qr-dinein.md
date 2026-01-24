# ADR 0003: Dine-in Ordering via QR

## Decision
Support dine-in ordering by scanning a QR code per table.

## Key Rules
- Each table has a stable `tableCode` used in the QR URL.
- The QR URL should resolve to a friendly route that sets/validates the current table context.
- Orders must support `DINE_IN` and `TAKEAWAY` modes.
