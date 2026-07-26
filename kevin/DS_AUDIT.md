# Kevin's Quoting App — Audit Report

**Date:** 2026-07-26
**Auditor:** Claude (DeepSeek handoff, pass 1)
**Files reviewed:** `index.html` (1695 lines), `quote-experience.js` (130 lines), `quote-experience.css` (1 line, minified-ish), 7 reference PDFs in `emails/`

---

## 1. Summary of Observations

### 1.1 Architecture

The app is a single-page static site. Core business logic lives in an inline `<script>` block inside `index.html` (lines 645–1691). A thin presentation/wrapping layer sits in `quote-experience.js` (IIFE, 130 lines), which overrides several `window.*` functions at load time. `quote-experience.css` handles mode-switching, grid layout, and the simple/advanced toggle.

**Finding:** Business logic is split across two files. `index.html` holds ~1045 lines of JavaScript; `quote-experience.js` wraps and occasionally duplicates it. This makes it unclear which version of `copyQuote`, `saveQuote`, `printClientQuote`, etc. actually runs. The `.js` file wins (it loads last and assigns to `window.*`), but the dead inline definitions in `index.html` remain, creating confusion for anyone maintaining the code.

### 1.2 Reference PDF Analysis

The 7 supplier PDFs (Bowens, Timbeck, WR Timbers) reveal standard Australian construction-quote fields that Kevin's app either handles or lacks:

| Field | App Status |
|---|---|
| Quote/order number | Present (`nqQuoteNumber`, auto-generated) |
| Quote date + expiry date | Present |
| Customer name, address, phone, email | Partial — only job name and location; no phone/email capture |
| Separate delivery address | **Missing** — location field doubles as both |
| Supplier ABN + contact details on quote | **Missing** — the customer-facing PDF has no business header |
| Product codes (SKU) | **Missing** — materials have only free-text names |
| Unit of Measure (UOM) | **Missing** — all PDFs use LM (linear metres), EA (each), ST (set), PK (pack), m², etc. |
| Unit price ex GST + line total ex GST | Present (unit cost × qty × markup) |
| Subtotal ex GST, GST, Total inc GST | Present |
| Payment terms / deposit | **Missing** |
| Freight / cartage line items | **Not a dedicated section** — can be added as "Other Cost" but no first-class support |
| Signature block | **Missing** on customer PDF |
| Supplier notes / Ts & Cs | Partial — scope/exclusions fields exist but no formal terms block |
| Discount column | **Missing** — supplier PDFs sometimes show line-level discounts |

---

## 2. Prioritised Issues

### HIGH — Functional / Customer-Facing

#### H1. Customer PDF: line items don't sum to rounded total when rounding is applied

**Location:** `quote-experience.js:110–115` (printClientQuote), `index.html:1307–1318` (printForSelf)

**What happens:**
1. User sets rounding to "Nearest $100" on a job costing $5,157.50 inc GST.
2. The sidebar shows $5,200 (correct).
3. Saving stores `grandTotal: 5200` (rounded) and `costedTotal: 5157.50` (unrounded).
4. When the customer PDF is generated, line items are computed on-the-fly from the unrounded materials/labour arrays. They sum to $5,157.50. But the total at the bottom shows $5,200. GST is reverse-calculated from the rounded total, so it doesn't equal 10% of the line items either.
5. A customer who adds up the line items sees a discrepancy.

**Impact:** Looks unprofessional. Could undermine trust in the quote.

**Fix:** When rounding is active, either (a) show a note "Total rounded to nearest $X" and display both the calculated and rounded amounts, or (b) proportionally adjust the last line item so everything ties out. Option (a) is simpler and standard practice in construction ("rounded for presentation").

#### H2. Missing ABN / business details on customer-facing quote

**Location:** `quote-experience.js:115` (printClientQuote)

**What happens:** The generated customer quote HTML has no business header — no company name, ABN, address, phone, or email. In Australia, quotes and tax invoices over $1,000 must show the supplier's ABN to be valid tax invoices.

**Impact:** Legal/compliance risk. Also looks less professional compared to every supplier PDF reviewed (all of which show full company details).

**Fix:** Add a business-details section (persisted in localStorage, editable once). Include: Business name, ABN, address, phone, email. Render these in the customer PDF header.

#### H3. Mobile bottom bar is missing the "Customer PDF" button

**Location:** `index.html:516–522` (mobilePriceBar)

**What happens:** The desktop sidebar has 5 action buttons (Save, Copy Xero, Copy detailed, Customer PDF, Internal PDF). The mobile bar has only Save and a generic copy button. A phone user cannot generate a customer quote.

**Fix:** Add a PDF/share button to the mobile bar, or make the current 📋 button a dropdown.

#### H4. Xero tax mode only affects "Copy Xero total", not "Copy detailed costing"

**Location:** `quote-experience.js:99–107`

**What happens:** The `nqXeroTaxMode` (tax exclusive / tax inclusive) selector is used in `copyXeroTotal()` but ignored in `copyQuote()`. If Kevin pastes the detailed costing into Xero, the figures won't match his Xero settings when tax-inclusive mode is selected.

**Fix:** Apply the same tax-mode logic to `copyQuote()`, or rename the Xero mode selector to clarify it only affects the one-line copy.

---

### MEDIUM — UX / Workflow

#### M1. Simple-mode CSS targets wrong cells in table footers

**Location:** `quote-experience.css` line containing `nth-child(4)`

**What happens:** The CSS hides the 4th `<td>` in every row to remove the Markup% column. Data rows work correctly (4th `<td>` = markup input). But the total row in `<tfoot>` has a different structure — its 4th `<td>` is a trailing empty cell, not the markup display cell. The markup summary cell (`nqMatMarkupPct`) is the 2nd child of the tfoot row and is never hidden, appearing as a stray empty cell in simple mode.

**Impact:** Cosmetic — simple mode materials/labour footers show a blank cell where markup info would be.

**Fix:** Use class-based hiding (`.markup-col { display: none; }`) instead of brittle `nth-child` selectors. Add the class to both `<th>` and `<td>` elements in the markup column.

#### M2. No UOM (Unit of Measure) on materials

**Location:** Materials table, `index.html:399`

**What happens:** Every supplier PDF uses UOM codes (LM, EA, ST, PK, m², kg, etc.). Kevin's app has free-text item names only. The materials DB includes a `unit` field, but it's not shown in the job-costing materials table or the customer PDF.

**Impact:** Ambiguity — "Timber cladding, qty 40" means nothing without the unit. Kevin has to remember or guess.

**Fix:** Add a UOM column to the job-costing materials table (pulled from the materials DB when picking, editable inline). Show it on the customer PDF.

#### M3. No dedicated freight / delivery line

**Location:** Job costing template structure

**What happens:** Every supplier PDF includes freight/cartage as a line item. Kevin can add it as an "Other Cost" but it's not a first-class concept. The templates don't include freight by default.

**Fix:** No code change needed for now — train Kevin to add freight as an Other Cost. Consider adding a "Freight" quick-add button in future.

#### M4. The sidebar "take-home" insight uses the unrounded total

**Location:** `index.html:1145–1151` (recalcQuote)

**What happens:** When rounding is active, `recalcQuote()` computes the insight using `c.grandTotal` (unrounded), but the sidebar grand total shows `p.total` (rounded). Kevin sees "$5,200 total" but the insight says "That's $86/hr effective" when it should be based on the rounded $5,200 (which would be ~$87/hr).

**Impact:** Minor numeric inconsistency. Confusing if Kevin is verifying figures.

**Fix:** Use `pricing().total` in the insight calculation when rounding is active.

#### M5. Customer PDF from history doesn't include quote status / metadata

**Location:** `quote-experience.js:121` (renderHistory override)

**What happens:** The history tab adds "Customer PDF" buttons to each saved job. These call `printClientQuote(state.quotes[i])`. The generated PDF includes the quote number, date, and validity — but NOT the status (Draft/Sent/Accepted/Lost), which could be confusing if Kevin prints a Draft quote by accident.

**Fix:** Add a visual indicator (watermark or header note) when printing a quote with Draft status.

---

### LOW — Maintainability / Code Quality

#### L1. Duplicate function definitions between index.html and quote-experience.js

Functions defined in BOTH files:

| Function | index.html (inline) | quote-experience.js (override) |
|---|---|---|
| `copyQuote()` | Line 1264 | Line 104 |
| `saveQuote()` | Line 1233 | Line 88 |
| `printClientQuote()` | — (only in .js) | Line 110 |
| `recalcQuote()` | Line 1120 | Line 31 (wraps original) |

The `.js` versions win (loaded later), but the dead inline code remains and will confuse future editors.

**Fix:** Move the inline definitions into `quote-experience.js` (or a new shared module). Keep only DOM-ready initialization in `index.html`.

#### L2. Inline onclick handlers in innerHTML strings

**Location:** `index.html:1312–1317` (printForSelf), `index.html:1326` (renderHistory), `quote-experience.js:121`

**What happens:** Rendered HTML strings contain inline JavaScript like `onclick="printForSelf(state.quotes['+i+'])"`. This is fragile (array index shifts), hard to debug, and defeats CSP.

**Fix:** Use event delegation or `data-*` attributes. Attach handlers via `addEventListener`.

#### L3. No input validation for numeric fields

**What happens:** Entering text in a number input silently converts to 0 (HTML default behavior). There's no user-facing warning.

**Fix:** Add `inputmode="decimal"` attributes and consider a validation pass before saving.

#### L4. `newQuoteFresh()` resets template to 'sauna', not 'sauna-small'

**Location:** `index.html:1402–1408`

**What happens:** Clicking "Start a new job" always defaults to the medium sauna template, even if the user was working on a small one. Not a bug per se, but inconsistent with the template chip that's highlighted.

**Fix:** Remember the last selected template type and restore it, or default to the last-used template.

---

## 3. Calculation Verification

### 3.1 GST and rounding

GST is 10%. Rounding is applied to the GST-inclusive total, then ex-GST and GST are reverse-calculated:

```
exGst = roundedTotal / 1.1
gst = roundedTotal - exGst
```

This is correct for Australian quoting where you typically quote a round inc-GST figure.

### 3.2 The two pricing pathways

There are two parallel calculation paths:

1. **`calculateJobTotals()`** (index.html:1086) — computes unrounded totals. Used by: original `recalcQuote()`, sidebar insight, original `copyQuote`.
2. **`pricing()`** (quote-experience.js:13) — takes `calculateJobTotals()` output and applies rounding. Used by: `displayPricing()`, `copyXeroTotal()`, `copyQuote()` (the .js override), sidebar display.

The `.js` override of `recalcQuote` calls **both** (original + displayPricing), so the sidebar shows rounded figures. But the insight section still uses path 1's unrounded `c.grandTotal`. See M4.

### 3.3 Profit calculation order

```
subtotal = materials + labour + subbies + other + overhead
contingency = subtotal × contingency%
profit = (subtotal + contingency) × profit%
gst = (subtotal + contingency + profit) × 10%
```

Profit is calculated on subtotal + contingency (not just subtotal). This means profit is also earned on the contingency buffer. This is legitimate — the contingency is part of the job cost, and profit applies to all costs.

### 3.4 Overhead calculation

```
overheadCost = totalHours × overheadRate × overheadPct%
```

Where `overheadRate = annualOverhead / billableHours` and `overheadPct` defaults to 100%. This spreads annual fixed costs across labour hours. Setting overheadPct < 100% means the job covers less than its fair share of overhead — useful for small jobs.

This is sound.

---

## 4. Compatibility Notes

- **`normalizeLabour()`** (index.html:1000) handles migration from the old flat `rate` field to the new `cost` + `markup` split. Old saved data with `rate` is treated as `cost=rate, markup=0`, preserving exact pricing.
- **Missing meta-fields on old saved quotes** (quoteNumber, quoteDate, validUntil, status, scope, exclusions, rounding, xeroTaxMode) are handled by `setQuoteFields()` defaults and `finishSave()` enrichment.
- **`saveQuote()` backward compat** — the `.js` wrapper calls the original `saveQuote()` then enriches the saved object with new meta fields via `Object.assign()`.
- **Firebase cloud sync** is enabled (`FIREBASE_CONFIG` has real values). Allowed emails are `kevinwilliambarrett@gmail.com` and `grpa_ss@hotmail.com`. The shared document model (`appData/shared`) means both accounts share one data set. This is working and should NOT be changed.

---

## 5. Proposed Implementation Plan

### Phase 1: Critical fixes (start here)

1. **H1: Fix customer PDF line-item/rounding mismatch** — When rounding is active, show both the raw calculated total and the rounded total, with a note. Keep the breakdown internally consistent (use unrounded figures throughout the line items and subtotal, then show the rounding step).

2. **H2: Add business details to customer PDF** — Persist a business-info object in localStorage. Add a simple settings UI (or an "Edit business details" button in the overhead tab). Render ABN, business name, address, phone on the customer quote.

3. **H3: Add customer PDF button to mobile bar** — One extra button in `mobilePriceBar`.

### Phase 2: UX polish

4. **M1: Fix simple-mode CSS with class-based column hiding** — Replace `nth-child(4)` with `.markup-col` class. Add the class in `renderCurrentQuote()` and on the `<th>` elements.

5. **M4: Fix sidebar insight rounding** — Use `pricing()` in the insight calculation.

6. **M2: Add UOM to materials table and customer PDF** — Include the `unit` field from materials DB. Show a small UOM label.

7. **H4: Apply Xero tax mode to detailed costing copy** — Extend `copyQuote()` to respect `nqXeroTaxMode`.

### Phase 3: Code quality (deferrable)

8. **L1: Consolidate duplicate functions** — Move the inline `copyQuote`, `saveQuote` definitions into `quote-experience.js`. Keep only initialization in `index.html`.

9. **L2: Replace inline onclick handlers in dynamic HTML** — Use data attributes + delegation.

---

## 6. Risks

- **Firebase overwrites:** The shared-document model (`appData/shared`) means if one device saves while another is editing, data can be overwritten. The `onSnapshot` listener mitigates this for real-time sync, but offline→online merges are last-write-wins (no CRDT).
- **localStorage limits:** ~5MB. With many saved quotes + materials DB + overhead + templates, this is unlikely to be hit, but backup/restore is the only safety net.
- **Quote-experience.js not loading:** If the CDN or file is unavailable, `setQuoteMode`, `copyXeroTotal`, and the overridden `saveQuote`/`copyQuote`/`printClientQuote` are all undefined. The app would partially work but buttons would silently fail. Consider adding a guard.

---

## 7. Verification Commands

```powershell
node --check kevin\quote-experience.js
git diff --check
git status --short
```

---

**Status:** Audit complete. Awaiting approval before implementing any code changes.
