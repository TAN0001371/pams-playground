# Susan Czermak Watercolours — Prototype (Second Pass)

A polished visual prototype for a complete redesign of [susanczermakwatercolours.com.au](https://susanczermakwatercolours.com.au).

**Status:** PROTOTYPE (second pass) — For Susan's review. Not yet intended to replace the live site.

**Live preview:** https://tan0001371.github.io/pams-playground/susan-watercolours-prototype/

## Concept

"Light, Place & Memory" — a boutique gallery-style artist website that feels like moving through places Susan remembers.

## Second Pass Changes

### Added
- **Artwork detail pages** — hash-routed overlay (#artwork/friends-arcade) with large uncropped images, specs, stories, related works, and "Enquire about this painting" button. Browser back/forward works correctly.
- **Complete gallery** — all 8 paintings with filters (Available, Prints, Sold, by Collection)
- **Room mockups** — two CSS scale visualizations showing Friends in the Arcade and Lake Hawea at realistic wall proportions
- **Sample pricing** — three paintings (The Shepherd $650, Frostie $450, Lakehouse $550) shown with "Sample presentation only — price to be confirmed by Susan" labels. Set `samplePriceAud: null` in the JavaScript data to remove.
- **Improved enquiry** — auto-populates artwork title, shows thumbnail + dimensions + availability

### Fixed
- **Biography audit** — verified all claims against Susan's PST profile. "Hebrides" removed. "Devoted herself fully" corrected to "exploring." People's Choice Award wording verified. See `content-sources.md` audit table.
- **No fake quotes** — Friends in the Arcade section now uses unquoted curatorial description
- **Prototype story labels** — every illustrative story tagged "Illustrative story draft — to be confirmed with Susan"
- **About headings** — Journey: "A life shaped by place" (was: "A life spent noticing places"). About: "The artist behind the paintings" (was duplicate "A life spent noticing places")
- **Portrait placeholder** — SC monogram removed. Replaced with text: "A studio photograph or portrait of Susan will appear here once supplied."
- **Collection integrity** — People Encountered removed (0 works). By the Water, Fields & Country labeled as proposed future collections.

### Preserved
- All first-pass design decisions: colour palette, typography, scroll reveals, sticky nav, generous whitespace
- No scroll hijacking, no loading screens, no decorative splashes, no dramatic transitions
- Respects `prefers-reduced-motion`

## Technology

- Vanilla HTML, CSS, JavaScript — no build step
- Cormorant Garamond + Inter via Google Fonts
- Hash-based client-side routing for artwork detail views (works on GitHub Pages)
- Intersection Observer for scroll reveals
- Responsive (390px+)

## How to View

Open in browser or serve locally:

```bash
cd susan-watercolours-prototype
python3 -m http.server 8080
# visit http://localhost:8080
```

## Removing Sample Pricing

In `index.html`, search for `samplePriceAud` in the DATA object and set all values to `null`. The labels will disappear automatically.

## Image Sources

All artwork images from Susan's existing public website. Signatures preserved. See `content-sources.md` for detailed source URLs.

## Still Needed from Susan

- Artwork dimensions for unmeasured works
- Actual pricing for all available works
- Portrait or studio photograph
- Confirmation/replacement of 6 illustrative stories
- Preferred contact email for enquiry form
- Decision on proposed collections

## Recommended Next Steps

For a non-technical workflow after prototype approval:
- **Squarespace** — if simplicity preferred
- **Next.js + Sanity** — if custom design with CMS dashboard is required
