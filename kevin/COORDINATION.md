# Coordination — 2026-07-26

## Status: Material-price import complete; follow-up decisions pending

I've read the full codebase and extracted text from all 7 reference PDFs. No code has been changed.

## Files read (audit only)

- `index.html` — 1695 lines, inline JS + HTML
- `quote-experience.js` — 130 lines, presentation wrapper
- `quote-experience.css` — mode-switching and layout
- `emails/*.pdf` — 7 supplier quotes / order confirmations

## File created

- `DS_AUDIT.md` — full audit with 13 prioritised findings and a 3-phase plan

## Top findings at a glance

| # | Severity | Issue |
|---|---|---|
| H1 | High | Customer PDF line items don't sum to rounded total — mismatch when rounding active |
| H2 | High | No ABN / business details on customer quote — compliance risk |
| H3 | High | Mobile bar missing Customer PDF button |
| H4 | High | Xero tax mode only affects one-line copy, not detailed costing copy |
| M1 | Medium | Simple-mode CSS nth-child(4) targets wrong cells in tfoot |
| M2 | Medium | No UOM column — every supplier PDF uses LM, EA, ST, etc. |

Full list and proposed implementation phases are in `DS_AUDIT.md`.

## Next step

Please review `DS_AUDIT.md` and confirm which phase / issues to implement first. I'll hold until then.

## New approved task — material pricing from Kevin''s PDFs

The PDFs in `kevin/emails/` are Kevin''s real quote, supplier-order, and order-confirmation records. They are now approved as source material for improving the app''s Materials Price List.

### Do next (before changing app code)

1. Extract a proposed material-price register from every PDF:
   - supplier;
   - document number and date (where available);
   - item description;
   - SKU/product code (where available);
   - quantity and UOM;
   - unit price ex GST;
   - line total;
   - whether freight/delivery is separate.
2. Reconcile duplicate items across documents. Prefer the newest clearly dated supplier price; flag conflicts instead of guessing.
3. Compare the proposed entries with the existing `DEFAULT_MATERIALS_DB` and identify additions, replacements, and uncertain matches.
4. Write the result to `kevin/DS_MATERIAL_PRICE_AUDIT.md` as a review table. Do **not** change `index.html`, the app''s material database, or the PDFs yet.
5. Include a proposed import format and a short list of decisions needed from Kevin (for example: pricing markups, whether to include delivery/freight, and how long a supplier price remains valid).

The project manager will review the price audit before approving an import.
## Implementation update — material import completed

Codex reviewed the material-price audit, corrected its summary counts, and imported the 24 complete, non-freight proposed additions into `index.html` as `PDF_MATERIALS_2026`. Each imported item carries supplier, SKU, source document, and price-date metadata.

- Existing 35 materials are retained.
- Existing saved browser material lists receive missing imported items on load.
- Missing-price entries and freight/fees were not imported.
- The PDFs remain unchanged.
- Suggested markups remain provisional and should be confirmed with Kevin.