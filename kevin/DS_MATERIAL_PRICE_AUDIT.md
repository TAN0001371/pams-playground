# Material Price Audit — Kevin's Supplier PDFs

**Date:** 2026-07-26
**Source documents:** 7 PDFs in `kevin/emails/` (3 Bowens, 2 Timbeck Architectural, 1 WR Timbers, 1 Bowens order confirmation)
**Data quality:** 6 of 7 PDFs yielded full line-item pricing via text extraction. Quote -17408784 (Bowens, Aug 2025) has columnar pricing that PyPDF2 cannot parse — 7 material line items plus 2 freight/fee lines are missing unit prices; those items are listed and flagged.

---

## 1. Supplier Summary

| Supplier | ABN | Account | Contact | Role |
|---|---|---|---|---|
| **Bowens** (Bowen & Pomeroy) | 78 004 174 887 | 10984 | 03 9763 7522, Rowville VIC | Primary — framing, cladding, insulation, concrete, hardware |
| **Timbeck Architectural** (A. Oregon Sales) | 41 009 766 189 | 18575 | 07 3888 7778, QLD | Specialist — WRC/Hemlock cedar, VJ/Shiplap profiles |
| **WR Timbers** | 91 648 844 222 | — | 03 9761 4300, Kilsyth South VIC | Specialist — Lunawood thermally-modified timber |

**Observed pattern:** Kevin orders framing, insulation, and sheet goods from Bowens (5 of 7 docs). He orders specialty cedar cladding from Timbeck. He orders Lunawood from WR Timbers.

---

## 2. Complete Extracted Price Register

All prices are **ex GST** and shown as **unit price**. The "Newest Date" column is used for reconciliation where the same product appears in multiple documents.

### 2.1 Timber — Framing (Pine)

| # | Supplier | SKU | Description | UOM | Unit Price | Line Total | Qty | Doc Date | Doc # | Newest? |
|---|---|---|---|---|---|---|---|---|---|---|
| T1 | Bowens | P10F090045 | MGP10 Pine Framing 90×45, lengths up to 5.1 m | LM | $3.65 | $560.92 | 153.6 | 2026-03-13 | Order 17627835 | ★ only price |
| T2 | Bowens | P10F120045 | MGP10 Pine Framing 120×45 Structural | LM | $7.46 | $295.56 | 39.6 | 2026-03-13 | Order 17627835 | ★ only price |
| T3 | Bowens | P10F090035L | MGP10 Pine Framing 90×35, lengths 5.4–6.0 m | LM | $2.97 | $444.82 | 150.0 | 2025-12-03 | Quote 17535262 | ★ only price |
| T4 | Bowens | P10F090045L | MGP10 Pine Framing 90×45, lengths 5.4–6.0 m | LM | **missing** | **missing** | 108.0 | 2025-08-18 | Quote 17408784 | — |
| T5 | Bowens | P10F070045 | MGP10 Pine Framing 70×45 Structural | LM | **missing** | **missing** | 86.4 | 2025-08-18 | Quote 17408784 | — |
| T6 | Bowens | MLFPT190030 | Primed H3 LOSP Treated Pine Fascia 190×30 mm | LM | $15.41 | $147.92 | 9.6 | 2026-03-13 | Order 17627835 | ★ only price |

### 2.2 Timber — Cladding & Paneling

| # | Supplier | SKU | Description | UOM | Unit Price | Line Total | Qty | Doc Date | Doc # | Newest? |
|---|---|---|---|---|---|---|---|---|---|---|
| C1 | Timbeck | WRVJ086009 | WRC 086×009 VJ Paneling P20-01 404S | LM | $11.85 | $3,910.50 | 330.0 | 2026-04-29 | Quotation 141013 | ★ only price |
| C2 | Timbeck | HLSL084009B | Hemlock 084×009 Shiplap Paneling 12 mm Gap P21-01B | LM | $7.20 | $4,060.80 | 564.0 | 2026-07-10 | Order Conf 141651 | ★ only price |
| C3 | Bowens | MLWBSP175025 | Baltic Pine Weatherboard Primed ex 175 mm Square | LM | $4.66 | $1,189.23 | 255.0 | 2026-03-13 | Order 17627835 | ★ only price |
| C4 | Bowens | **0251541841 | QLD Spotted Gum (BAL29) Feature Grade Cladding, End-matched, Random Lengths 76×19 | LM | $6.76 | $4,159.64 | 615.0 | 2025-07-08 | Quote 17363991 | ★ only price |
| C5 | WR Timbers | — | Lunawood Triple Shadow Cladding 140×32 | LM | $24.08 | $6,263.21 | 260.1 | 2025-06-18 | QUO00012696 | ★ only price |
| C6 | Bowens | HEL3012 | Hardies EasyLap Cladding Panel 3000×1200×8.5 mm | ST | $116.46 | $232.93 | 2.0 | 2026-03-13 | Order 17627835 | ★ only price |
| C7 | Bowens | AXH2412 | Hardies Scyon Axon 133 Smooth 2450×1200×9 mm | ST | $125.74 | $1,005.89 | 8.0 | 2025-12-03 | Quote 17535262 | ★ only price |
| C8 | Bowens | AXH2712 | Hardies Scyon Axon 133 Smooth 2750×1200×9 mm | ST | **missing** | **missing** | 7.0 | 2025-08-18 | Quote 17408784 | — |

### 2.3 Timber — Decking, DAR, Battens, & Specialty

| # | Supplier | SKU | Description | UOM | Unit Price | Line Total | Qty | Doc Date | Doc # | Newest? |
|---|---|---|---|---|---|---|---|---|---|---|
| D1 | WR Timbers | — | Lunawood Juan Clip Decking 118×26 | LM | $15.21 | $702.70 | 46.2 | 2025-06-18 | QUO00012696 | ★ only price |
| D2 | WR Timbers | — | Lunawood SHP Solar Batten 42×42 (square dressed) | LM | $10.48 | $1,068.96 | 102.0 | 2025-06-18 | QUO00012696 | ★ only price |
| D3 | WR Timbers | — | Lunawood DAR 140×42 | LM | $31.72 | $970.63 | 30.6 | 2025-06-18 | QUO00012696 | — |
| D4 | Bowens | **0251585163 | Luna Wood DAR 142×42 | LM | $29.85 | $456.77 | 15.3 | 2025-12-03 | Quote 17535262 | ★ newer |
| D5 | Bowens | **0251553801 | Luna Wood DAR 142×42 | LM | **missing** | **missing** | 30.6 | 2025-08-18 | Quote 17408784 | — |
| D6 | Bowens | **0251585166 | 20×19 Pine Batten, Standard grade | LM | $2.73 | $245.45 | 90.0 | 2025-12-03 | Quote 17535262 | ★ only price |
| D7 | Timbeck | WRSQ090017 | WRC 090×017 Dressed DAR | LM | $19.02 | $958.61 | 50.4 | 2026-04-29 | Quotation 141013 | ★ only price |
| D8 | Timbeck | WRSQ140012 | WRC 140×012 Dressed DAR Fascia/Pelmet | LM | $23.77 | $99.83 | 4.2 | 2026-04-29 | Quotation 141013 | ★ only price |
| D9 | Timbeck | HLSQ090017 | Hemlock 090×017 Dressed DAR | LM | $10.90 | $627.84 | 57.6 | 2026-07-10 | Order Conf 141651 | ★ only price |
| D10 | Bowens | YUGD11530 | F7 Premium Cypress Pine 115×115 mm, 3.0 m DAR & Pencil Round | EA | $118.72 | $118.72 | 1.0 | 2026-03-13 | Order 17627835 | ★ only price |

### 2.4 Flooring

| # | Supplier | SKU | Description | UOM | Unit Price | Line Total | Qty | Doc Date | Doc # | Newest? |
|---|---|---|---|---|---|---|---|---|---|---|
| F1 | Bowens | MBPFLOORING | Magnum Board Flooring 2700×600×18 mm T&G | ST | $116.44 | $349.31 | 3.0 | 2025-12-03 | Quote 17535262 | ★ only price |
| F2 | Bowens | MBPFLOORING | Magnum Board Flooring 2700×600×18 mm T&G | ST | **missing** | **missing** | 3.0 | 2025-08-18 | Quote 17408784 | — |

### 2.5 Insulation

| # | Supplier | SKU | Description | UOM | Unit Price | Line Total | Qty | Doc Date | Doc # | Newest? |
|---|---|---|---|---|---|---|---|---|---|---|
| I1 | Bowens | 4006277 | Pink Wall Batts R1.5, 1160×430×70 mm, 24-pack, coverage 13.6 m² | PK | $60.22 | $180.65 | 3.0 | 2025-12-03 | Quote 17535262 | ★ only price |
| I2 | Bowens | 4006098 | Pink Ceiling Batts R2.5, 1160×430×130 mm, 16-pack, coverage 8.86 m² | PK | $51.23 | $102.45 | 2.0 | 2025-12-03 | Quote 17535262 | ★ only price |
| I3 | Bowens | 4010570 | Pink Soundbreak R2.7, 1160×430×90 mm, 8-pack, coverage 4.5 m² (Green Batts, Ceiling/Wall) | PK | **missing** | **missing** | 2.0 | 2025-08-18 | Quote 17408784 | — |
| I4 | Bowens | 4006039 | Pink Ceiling Batts R4.1, 1160×430×215 mm, 10-pack, coverage 5.6 m² | PK | **missing** | **missing** | 1.0 | 2025-08-18 | Quote 17408784 | — |

### 2.6 Concrete & Masonry

| # | Supplier | SKU | Description | UOM | Unit Price | Line Total | Qty | Doc Date | Doc # | Newest? |
|---|---|---|---|---|---|---|---|---|---|---|
| M1 | Bowens | 800201 | Dingo Fast Set 20 kg Hi-Strength Concrete 40 MPa | EA | $11.41 | $57.05 | 5.0 | 2026-03-13 | Order 17627835 | ★ only price |

### 2.7 Membranes & Wraps

| # | Supplier | SKU | Description | UOM | Unit Price | Line Total | Qty | Doc Date | Doc # | Newest? |
|---|---|---|---|---|---|---|---|---|---|---|
| W1 | Bowens | AFW5030 | Airflo White 1.5×30 m Wall Wrap VPM | EA | $129.28 | $129.28 | 1.0 | 2026-03-13 | Order 17627835 | ★ only price |

### 2.8 Freight, Delivery & Fees

| # | Supplier | SKU | Description | UOM | Unit Price | Line Total | Qty | Doc Date | Doc # |
|---|---|---|---|---|---|---|---|---|---|
| FR1 | Bowens | CARTAGE | Cartage (standard delivery) | EA | $99.50 | $99.50 | 1.0 | 2025-12-03 | Quote 17535262 |
| FR2 | Bowens | CARTAGE25C | Cartage to site by crane truck (ex Rowville) | EA | **missing** | **missing** | 1.0 | 2025-08-18 | Quote 17408784 |
| FR3 | Bowens | MANUF03 | Manufacturer / supplier delivery fee | EA | **missing** | **missing** | 1.0 | 2025-08-18 | Quote 17408784 |
| FR4 | Timbeck | FUEL LEVY | 2% fuel levy on invoice value | EA | $101.38 | $101.38 | 1.0 | 2026-04-29 | Quotation 141013 |
| FR5 | Bowens | **0251541844 | Pick and repack fee | EA | $88.89 | $88.89 | 1.0 | 2025-07-08 | Quote 17363991 |

---

## 3. Reconciled Duplicates

### D3 / D4 / D5 — Lunawood DAR 140–142×42

| Doc | Date | Supplier | Size | Unit Price |
|---|---|---|---|---|
| QUO00012696 | 2025-06-18 | WR Timbers | 140×42 | $31.72/LM |
| Quote 17408784 | 2025-08-18 | Bowens | 142×42 | **missing** |
| Quote 17535262 | 2025-12-03 | Bowens | 142×42 | $29.85/LM |

**Resolution:** Prefer **Bowens $29.85/LM** (newest, Dec 2025). The 1-2 mm difference (140 vs 142) is nominal-vs-actual variation in dressed timber. WR Timbers' higher price ($31.72) may reflect Lunawood's thermal-modification premium or an older price point. **Flag:** Kevin should confirm whether Bowens Luna Wood DAR is indeed the same thermally-modified product as WR Timbers' Lunawood, or whether it's a different (non-thermally-modified) grade.

### F1 / F2 — Magnum Board Flooring

| Doc | Date | Unit Price |
|---|---|---|
| Quote 17408784 | 2025-08-18 | **missing** |
| Quote 17535262 | 2025-12-03 | $116.44/ST |

**Resolution:** Use **$116.44/ST** from Dec 2025. No conflict to resolve (the earlier price is missing).

### T1 / T4 — MGP10 90×45 Framing (standard vs long)

| Doc | Date | SKU | Length | Unit Price |
|---|---|---|---|---|
| Order 17627835 | 2026-03-13 | P10F090045 | up to 5.1 m | $3.65/LM |
| Quote 17408784 | 2025-08-18 | P10F090045L | 5.4–6.0 m | **missing** |

**Note:** These are different SKUs (standard vs long-length). The L variant typically commands a small premium. These should remain **separate** entries.

---

## 4. Comparison with Existing DEFAULT_MATERIALS_DB

### 4.1 Proposed additions (not in DB, sourced from PDFs)

| Category | Item | UOM | Cost | Suggested Markup | Source |
|---|---|---|---|---|---|
| Timber | MGP10 Pine Framing 90×45 (up to 5.1 m) | LM | $3.65 | 25% | Bowens, Mar 2026 |
| Timber | MGP10 Pine Framing 120×45 Structural | LM | $7.46 | 25% | Bowens, Mar 2026 |
| Timber | MGP10 Pine Framing 90×35 (5.4–6.0 m) | LM | $2.97 | 25% | Bowens, Dec 2025 |
| Timber | Primed H3 LOSP Pine Fascia 190×30 mm | LM | $15.41 | 25% | Bowens, Mar 2026 |
| Timber | Pine Batten 20×19 Standard | LM | $2.73 | 20% | Bowens, Dec 2025 |
| Timber | WRC VJ Paneling 86×9 P20-01 | LM | $11.85 | 30% | Timbeck, Apr 2026 |
| Timber | WRC Dressed DAR 90×17 | LM | $19.02 | 30% | Timbeck, Apr 2026 |
| Timber | WRC Dressed DAR 140×12 Fascia | LM | $23.77 | 30% | Timbeck, Apr 2026 |
| Timber | Hemlock Shiplap Paneling 84×9 | LM | $7.20 | 30% | Timbeck, Jul 2026 |
| Timber | Hemlock Dressed DAR 90×17 | LM | $10.90 | 30% | Timbeck, Jul 2026 |
| Timber | Baltic Pine Weatherboard Primed ex175 mm | LM | $4.66 | 25% | Bowens, Mar 2026 |
| Timber | QLD Spotted Gum Cladding 76×19 (BAL29) | LM | $6.76 | 30% | Bowens, Jul 2025 |
| Timber | Lunawood Triple Shadow Cladding 140×32 | LM | $24.08 | 30% | WR Timbers, Jun 2025 |
| Timber | Lunawood Juan Clip Decking 118×26 | LM | $15.21 | 30% | WR Timbers, Jun 2025 |
| Timber | Lunawood SHP Solar Batten 42×42 | LM | $10.48 | 25% | WR Timbers, Jun 2025 |
| Timber | Lunawood/Luna Wood DAR 140/142×42 | LM | $29.85 | 30% | Bowens, Dec 2025 |
| Timber | Cypress Pine 115×115×3.0 m DAR, pencil round | EA | $118.72 | 25% | Bowens, Mar 2026 |
| Cladding | Hardies Scyon Axon 133 2450×1200×9 mm | ST | $125.74 | 20% | Bowens, Dec 2025 |
| Cladding | Hardies EasyLap Cladding Panel 3000×1200×8.5 mm | ST | $116.46 | 20% | Bowens, Mar 2026 |
| Flooring | Magnum Board Flooring 2700×600×18 mm T&G | ST | $116.44 | 20% | Bowens, Dec 2025 |
| Insulation | Pink Wall Batts R1.5 24-pack (13.6 m²) | PK | $60.22 | 20% | Bowens, Dec 2025 |
| Insulation | Pink Ceiling Batts R2.5 16-pack (8.86 m²) | PK | $51.23 | 20% | Bowens, Dec 2025 |
| Concrete | Dingo Fast Set 20 kg 40 MPa | EA | $11.41 | 20% | Bowens, Mar 2026 |
| Membrane | Airflo White Wall Wrap 1.5×30 m VPM | EA | $129.28 | 20% | Bowens, Mar 2026 |

### 4.2 DB items with comparable PDF data (potential replacements)

| DB Item | DB Cost | DB UOM | PDF Item | PDF Cost | PDF UOM | Verdict |
|---|---|---|---|---|---|---|
| Timber studs 90×45 | $8.50 | each | MGP10 Pine Framing 90×45 | $3.65 | LM | **Different UOM** — DB is per-piece, PDF is per-linear-metre. Keep both; the DB item is a convenience price for single studs. Framing by the LM is cheaper for bulk take-offs. |
| Timber framing H2 treated | $4.20 | LM | MGP10 Pine Framing 90×35 | $2.97 | LM | **Different grade/size** — PDF is 90×35 MGP10, DB is unspecified H2. Keep both. |
| Battening timber 42×19 | $3.50 | LM | Pine Batten 20×19 | $2.73 | LM | **Different size** — 42×19 vs 20×19. Keep both. |
| Decking board 90×19 Merbau | $12.50 | LM | Lunawood Juan Clip Decking 118×26 | $15.21 | LM | **Different species/size** — keep both. |
| Western Red Cedar T&G 140×19 | $22.00 | LM | WRC VJ Paneling 86×9 | $11.85 | LM | **Different profile** — T&G vs VJ. Keep both. |
| Rockwool insulation 50 mm | $18.00 | m² | Pink Wall Batts R1.5 | $60.22/pk | PK | **Different product & UOM** — Rockwool vs glasswool. Keep both. Convert PK to per-m² for comparison: $60.22 ÷ 13.6 m² = $4.43/m². Rockwool is ~4× the cost. |
| Vapour barrier foil | $85.00 | roll | Airflo Wall Wrap 1.5×30 m | $129.28 | EA | **Different product** — foil vs synthetic wrap. Keep both. |
| Deck screws 65 mm box | $35.00 | box | — | — | — | No PDF match; keep. |
| Plasterboard 10 mm 2400×1200 | $26.73 | sheet | — | — | — | No PDF match (Scyon/EasyLap are different products); keep. |

### 4.3 DB items with no match in PDFs (keep unchanged)

All sauna-specific items (heaters, controller, glass door, thermometer, LED strip, bucket/ladle) and tiling items have no supplier PDF coverage — Kevin's sauna hardware and tiling suppliers are not represented in the 7 PDFs. **Keep all existing DB entries.**

---

## 5. Uncertain Matches & Items Needing Kevin's Input

| # | Question | Context |
|---|---|---|
| Q1 | Is Bowens' "Luna Wood DAR 142×42" the same thermally-modified product as WR Timbers' "Lunawood DAR 140×42"? | WR Timbers is a Lunawood specialist. Bowens lists it with a special-order SKU (`**0251585163`). The Bowens price is lower ($29.85 vs $31.72). If identical, merge entries; if different grades, keep both. |
| Q2 | What markup does Kevin actually apply to cladding timbers? | DB uses 30% for WRC T&G and 25% for decking. The PDFs don't tell us Kevin's markup — they show supplier sell prices. Suggested markups in §4.1 are guesses based on DB patterns. |
| Q3 | Should freight/delivery/cartage become a first-class line-item type in the app? | 5 of 7 PDFs have separate freight/cartage/fuel-levy charges. The existing "Other Costs" section can hold them, but a dedicated "Freight" quick-add might save time. |
| Q4 | How long should a supplier price be considered valid? | The PDFs span Jun 2025 to Jul 2026 (13 months). Timber prices fluctuate. WR Timbers' quote says "valid for 30 days." Bowens quotes typically expire in 30 days. |
| Q5 | Should the DB include a "last updated" or "price date" field? | Currently the DB has no date tracking. Adding a `priceDate` field would help Kevin know when to re-check prices. |
| Q6 | Do we want to store supplier names and SKUs in the materials DB? | The DB currently has only `cat`, `item`, `unit`, `cost`, `markup`. Adding `supplier` and `sku` would make reordering easier but complicates the UI. |
| Q7 | Are the incomplete prices from Quote 17408784 worth chasing up? | 7 of 9 line items have missing unit prices. This Bowens quote (Aug 2025) includes framing, Scyon cladding, flooring, and insulation that overlap with items priced in other docs. Most already have a price from a newer source; only P10F070045 (70×45 framing) and the two missing insulation SKUs (4010570, 4006039) are unique. |

---

## 6. Proposed Import Format

For directly pasting into the app's Materials DB or a future bulk-import feature:

```json
{
  "_comment": "Proposed additions to DEFAULT_MATERIALS_DB — review markups before importing",
  "_generated": "2026-07-26",
  "_source": "kevin/emails/ PDF extraction",
  "items": [
    {"cat":"Timber","item":"MGP10 Pine Framing 90x45 (up to 5.1m)","unit":"LM","cost":3.65,"markup":25,"supplier":"Bowens","sku":"P10F090045"},
    {"cat":"Timber","item":"MGP10 Pine Framing 120x45 Structural","unit":"LM","cost":7.46,"markup":25,"supplier":"Bowens","sku":"P10F120045"},
    {"cat":"Timber","item":"MGP10 Pine Framing 90x35 (5.4-6.0m)","unit":"LM","cost":2.97,"markup":25,"supplier":"Bowens","sku":"P10F090035L"},
    {"cat":"Timber","item":"Primed H3 LOSP Pine Fascia 190x30mm","unit":"LM","cost":15.41,"markup":25,"supplier":"Bowens","sku":"MLFPT190030"},
    {"cat":"Timber","item":"Pine Batten 20x19 Standard grade","unit":"LM","cost":2.73,"markup":20,"supplier":"Bowens","sku":"0251585166"},
    {"cat":"Timber","item":"WRC VJ Paneling 86x9 P20-01","unit":"LM","cost":11.85,"markup":30,"supplier":"Timbeck Architectural","sku":"WRVJ086009"},
    {"cat":"Timber","item":"WRC Dressed DAR 90x17","unit":"LM","cost":19.02,"markup":30,"supplier":"Timbeck Architectural","sku":"WRSQ090017"},
    {"cat":"Timber","item":"WRC Dressed DAR 140x12 Fascia/Pelmet","unit":"LM","cost":23.77,"markup":30,"supplier":"Timbeck Architectural","sku":"WRSQ140012"},
    {"cat":"Timber","item":"Hemlock Shiplap Paneling 84x9 12mm Gap","unit":"LM","cost":7.20,"markup":30,"supplier":"Timbeck Architectural","sku":"HLSL084009B"},
    {"cat":"Timber","item":"Hemlock Dressed DAR 90x17","unit":"LM","cost":10.90,"markup":30,"supplier":"Timbeck Architectural","sku":"HLSQ090017"},
    {"cat":"Timber","item":"Baltic Pine Weatherboard Primed ex175mm","unit":"LM","cost":4.66,"markup":25,"supplier":"Bowens","sku":"MLWBSP175025"},
    {"cat":"Timber","item":"QLD Spotted Gum Cladding 76x19 BAL29 Feature Grade","unit":"LM","cost":6.76,"markup":30,"supplier":"Bowens","sku":"0251541841"},
    {"cat":"Timber","item":"Lunawood Triple Shadow Cladding 140x32","unit":"LM","cost":24.08,"markup":30,"supplier":"WR Timbers","sku":""},
    {"cat":"Timber","item":"Lunawood Juan Clip Decking 118x26","unit":"LM","cost":15.21,"markup":30,"supplier":"WR Timbers","sku":""},
    {"cat":"Timber","item":"Lunawood SHP Solar Batten 42x42 square dressed","unit":"LM","cost":10.48,"markup":25,"supplier":"WR Timbers","sku":""},
    {"cat":"Timber","item":"Luna Wood DAR 142x42 (Bowens)","unit":"LM","cost":29.85,"markup":30,"supplier":"Bowens","sku":"0251585163"},
    {"cat":"Timber","item":"Cypress Pine 115x115 3.0m DAR Pencil Round","unit":"EA","cost":118.72,"markup":25,"supplier":"Bowens","sku":"YUGD11530"},
    {"cat":"Cladding","item":"Hardies Scyon Axon 133 2450x1200x9mm","unit":"ST","cost":125.74,"markup":20,"supplier":"Bowens","sku":"AXH2412"},
    {"cat":"Cladding","item":"Hardies EasyLap Cladding Panel 3000x1200x8.5mm","unit":"ST","cost":116.46,"markup":20,"supplier":"Bowens","sku":"HEL3012"},
    {"cat":"Flooring","item":"Magnum Board Flooring 2700x600x18mm T&G","unit":"ST","cost":116.44,"markup":20,"supplier":"Bowens","sku":"MBPFLOORING"},
    {"cat":"Insulation","item":"Pink Wall Batts R1.5 24pk (13.6m2)","unit":"PK","cost":60.22,"markup":20,"supplier":"Bowens","sku":"4006277"},
    {"cat":"Insulation","item":"Pink Ceiling Batts R2.5 16pk (8.86m2)","unit":"PK","cost":51.23,"markup":20,"supplier":"Bowens","sku":"4006098"},
    {"cat":"Concrete","item":"Dingo Fast Set 20kg Hi-Strength 40MPa","unit":"EA","cost":11.41,"markup":20,"supplier":"Bowens","sku":"800201"},
    {"cat":"Membrane","item":"Airflo White Wall Wrap 1.5x30m VPM","unit":"EA","cost":129.28,"markup":20,"supplier":"Bowens","sku":"AFW5030"}
  ]
}
```

---

## 7. Summary

| Metric | Count |
|---|---|
| PDFs with complete pricing | 6 of 7 |
| Total line items extracted | 37 |
| Line items with complete unit pricing | 28 |
| Line items missing unit prices (including freight/fees) | 9 |
| Reconciled duplicates (same/similar products) | 3 groups |
| Proposed new DB entries | 24 |
| Existing DB items retained | All 35 (no exact match replaced) |
| Possible DB price updates | 0 (no exact product match for replacement) |
| Questions for Kevin | 7 |

### Next steps

1. **Imported:** the 24 complete, non-freight additions are now merged into `DEFAULT_MATERIALS_DB` and existing saved material lists on load.
2. **Kevin answers** the 7 questions in §5, especially Q1 (Lunawood grade) and Q2 (actual markups).
3. Missing-price lines and freight/fees remain excluded until separately approved.
4. Existing app materials and all PDFs remain preserved.