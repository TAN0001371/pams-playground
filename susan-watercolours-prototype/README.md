# Susan Czermak Watercolours — Prototype

A polished visual prototype for a complete redesign of [susanczermakwatercolours.com.au](https://susanczermakwatercolours.com.au).

**Status:** PROTOTYPE — For Susan's review. Not yet intended to replace the live site.

## Concept

"Light, Place & Memory" — a boutique gallery-style artist website that feels like moving through places Susan remembers. Classy, elegant, quiet, highly curated.

## Technology

- Vanilla HTML, CSS, JavaScript — no build step required
- Cormorant Garamond (serif) + Inter (sans-serif) via Google Fonts
- CSS custom properties for the design system
- Intersection Observer for scroll-triggered reveal animations
- Responsive design (mobile-first, works at 390px+)
- Semantic HTML, keyboard accessible

## How to View

Open `index.html` in any browser:

```bash
open index.html
```

Or serve locally:

```bash
python3 -m http.server 8080
# then visit http://localhost:8080
```

## Image Sources

All artwork images were sourced from Susan's existing public website at susanczermakwatercolours.com.au. Images remain unmodified aside from file naming for consistency. Susan's signature and watermarks are preserved.

See `content-sources.md` for detailed source notes.

## Prototype / Illustrative Content

Some artwork narratives in `index.html` and `content.json` are illustrative drafts. These are tagged with `prototypeStory: true` in `content.json`.

Before public launch, these must be confirmed by Susan:
- Artwork stories (6 pieces)
- Artwork dimensions marked as `null` in content.json
- Pricing (all currently unset)
- Artist portrait photograph

**No factual dates, locations, awards, ownership, exhibitions, or biographical claims have been invented.**

## Before Public Launch

1. Confirm all artwork stories with Susan
2. Provide Susan's preferred portrait photograph
3. Confirm artwork dimensions and pricing
4. Choose a domain/hosting approach
5. Consider migrating to a CMS (see below)

## Recommended CMS Options

For a non-technical workflow:
- **Next.js + Sanity/Contentful** — modern headless CMS, Susan edits content in a dashboard
- **Squarespace** — if simplicity is preferred over custom design
- **Siteleaf + Jekyll** — lightweight, file-based

## Image Specifications for Susan

For best results when adding new works:
- Minimum 2000px on the longest edge
- JPEG, sRGB colour space
- Photograph in diffuse natural light
- Avoid glare on framed works
- Include a close detail crop for the artwork story page

## Repository

Part of the pams-playground repository at `susan-watercolours-prototype/`.
