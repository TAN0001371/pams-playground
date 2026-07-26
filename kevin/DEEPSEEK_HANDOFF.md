# DeepSeek handoff — Kevin''s quoting app

## Role

You are the implementation engineer. Work on the quoting web app in this folder:

`kevin/index.html`

Supporting files:

- `kevin/quote-experience.js`
- `kevin/quote-experience.css`
- `kevin/emails/` — reference documents only; do **not** edit, rename, move, upload, or commit these PDFs.

A project manager (Codex) will review changes, test the user experience, and handle publishing. Keep work focused and report back with a short summary and exact files changed.

## Available reference material

The `emails` folder includes example customer quotes and supplier/order documents:

- `Quote -17535262.pdf`
- `Quote -17408784.pdf`
- `Quote -17363991.pdf`
- `QUOTATION 141013.pdf`
- `QUO00012696.pdf`
- `Order_17627835.pdf`
- `ORDER CONFIRMATION 141651.pdf`

Review them only to identify useful real-world fields, terminology, common material lines, quote layout, and supplier pricing patterns. Treat all content as private project material.

## Product goal

Make Kevin''s app a fast, reliable construction quoting tool that helps him:

1. Pick a job template, adjust materials/labour, and get a defensible price.
2. See a complete Recommended Quote breakdown at all times:
   - materials
   - labour
   - overhead
   - subcontractors/other costs
   - contingency
   - profit
   - ex-GST amount
   - GST (10%)
   - total including GST
3. Copy either a Xero-ready total or detailed costing.
4. Create a clean customer-facing quote/PDF without exposing internal costs, markup, overhead, or profit.
5. Reuse saved work and keep historical jobs intact.

## Current decisions — do not undo

- The existing calculation approach and saved historical quotes must remain compatible.
- Simple mode and Advanced mode are for editing complexity only. Both modes **must keep the full Recommended Quote breakdown visible**.
- Simple mode should hide markup columns, advanced settings, subcontractors, other costs, and internal-only actions.
- Advanced mode should expose those controls and open the extra cost sections.
- Sauna starters are:
  - Small: 1–2 people
  - Medium: 2–4 people (the legacy/default `sauna` template)
  - Large: 4–6 people
- Do not remove or alter existing data in browser storage or the Firebase/cloud sync behaviour.
- Do not change anything outside `kevin/` unless explicitly necessary.
- Do not add external dependencies, build tooling, or frameworks. This is a static site.

## First task: audit before changing code

1. Read `kevin/index.html`, `quote-experience.js`, and `quote-experience.css`.
2. Review the PDFs in `kevin/emails/` as reference only.
3. Identify:
   - any broken or confusing Simple/Advanced behaviour;
   - calculations or rounding that could be inconsistent;
   - fields used in real documents that are missing from the customer-facing quote;
   - duplicated logic or maintainability risks.
4. Write an audit report in `kevin/DS_AUDIT.md` with:
   - observations;
   - a prioritised fix list;
   - exact intended changes;
   - risks/compatibility notes.
5. Stop after the audit and ask Codex for approval before implementing any substantial redesign.

## Implementation quality bar

- Keep the HTML valid and JavaScript free of syntax errors.
- Preserve old saved quotes: handle missing newer fields with sensible defaults.
- Never change total calculations merely for display; if rounding is applied, clearly define whether it is calculated from the final GST-inclusive quote.
- Make interactions obvious on desktop and mobile.
- Use Australian GST at 10%.
- Escape customer-entered content before placing it in printed HTML.
- Use clear labels. Avoid hiding pricing data that Kevin needs to verify.

## Required verification after any implementation

Run and report:

```powershell
node --check kevin\quote-experience.js
git diff --check
git status --short
```

Also manually verify these flows:

1. Select each of the three sauna sizes.
2. Switch Simple ↔ Advanced: the Recommended Quote breakdown remains visible.
3. Adjust a cost/hours line and confirm ex-GST, GST, and total update.
4. Apply each rounding option.
5. Save a new quote, edit it, duplicate it, and search it in history.
6. Generate the customer quote/PDF and confirm internal costs are absent.
7. Confirm existing saved quote data can still load.

## Ready-to-paste prompt for DeepSeek

> Act as the implementation engineer for Kevin''s static construction quoting app. First read `kevin/DEEPSEEK_HANDOFF.md` completely and follow it as the project brief. Inspect the app and the reference PDFs in `kevin/emails/`, then create `kevin/DS_AUDIT.md` only—do not implement changes yet. Focus on the current Simple/Advanced mode behaviour, the three Small/Medium/Large sauna templates, accurate GST/rounding, the full Recommended Quote breakdown, Xero copying, and customer-facing quote output. Preserve backwards compatibility and do not edit the PDFs or anything outside `kevin/`. End your audit with a prioritised plan and wait for Codex approval.