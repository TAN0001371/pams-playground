# Content Sources — Second Pass Audit

## Biographical Fact Verification

| Claim | Source | Verified Wording | Site Wording | Status |
|-------|--------|-----------------|--------------|--------|
| Born on small island off coast of Scotland | PST profile | "born on a small island off the coast of Scotland" | "born on a small island off the coast of Scotland" | ✅ VERIFIED |
| "Hebrides" | — | — | Not mentioned on any site | ❌ REMOVED |
| Father was marine biologist | PST profile | "father worked as a marine biologist" | "father worked as a marine biologist" | ✅ VERIFIED |
| Lived in Scotland, NZ, England, USA, France, Australia | About page | "lived in Scotland, New Zealand, England, USA, France and Australia" | "lived in Scotland, New Zealand, England, USA, France and Australia" | ✅ VERIFIED |
| Worked as programmer, farmer, teacher | PST profile | "worked variously as a computer programmer, as a farmer, and as a teacher" | "worked variously as a computer programmer, as a farmer, and as a teacher" | ✅ VERIFIED |
| Exploring watercolour for 25 years | PST profile | "exploring the world and watercolour for the last twenty five years" | "exploring the world and watercolour for the last twenty five years" | ✅ VERIFIED (not "devoted herself fully") |
| Lived 10 years in SW France village | PST profile | "lived in a village in SW France for 10 years" | "lived in a village in SW France for 10 years" | ✅ VERIFIED |
| Solo exhibitions since 2001, mainly France | PST profile | "Since 2001 Susan has had regular solo exhibitions of her work mainly in France" | "Since 2001 Susan has had regular solo exhibitions of her work mainly in France" | ✅ VERIFIED |
| People's Choice Award 2022 | PST profile | "Susan won the People's Choice Award at the 2022 PST Exhibition at the Mornington Studio" | "won the People's Choice Award at the 2022 PST Exhibition at the Mornington Studio" | ✅ VERIFIED |
| International collections | PST profile | "private and official collections in France, Italy, Germany, Holland, Switzerland, UK, USA, New Zealand, Italy, Australia and Belgium" | Same + Belgium additionally listed | ✅ VERIFIED |
| Realist style, hopes appears impressionist | PST profile | "style is realist and she hopes that sometimes the work may appear somewhat impressionist" | Verified | ✅ VERIFIED |
| Studio in Melbourne area | About page | "studio is located in the Melbourne area of Victoria" | "studio is located in the Melbourne area of Victoria" | ✅ VERIFIED |

## Collection Integrity Review

| Collection | Paintings Available | Status |
|-----------|-------------------|--------|
| By the Water | 1 (Two Dinghies) | ⚠️ Thin — proposed future collection |
| Fields & Working Country | 1 (Chambert) | ⚠️ Thin — proposed future collection |
| Villages & Roads | 1 (Friends in Arcade) | ⚠️ Thin — proposed future collection |
| From France | 4 (Shepherd, Water Trough, Friends, Chambert) | ✅ Solid |
| Quiet Weather | 2 (Frostie, Lakehouse) | ⚠️ Adequate — could grow |
| Travels Further Away | 2 (Lake Hawea, Two Dinghies) | ⚠️ Adequate — could grow |
| People Encountered | 0 | ❌ No works — removed |

**Action:** People Encountered removed. By the Water, Fields & Country, and Villages & Roads merged into broader categories or labeled as proposed future collections.

## Artwork Images

| File | Source URL | Attribution |
|------|-----------|-------------|
| `Czermak-LakeHawea-NewZealand.jpg` | `susanczermakwatercolours.com.au/wp-content/uploads/2021/09/` | © Susan Czermak |
| `CzermakDinghiesPortugal.jpeg` | `susanczermakwatercolours.com.au/wp-content/uploads/2021/10/` | © Susan Czermak |
| `CzermakShepherd1000.jpeg` | `susanczermakwatercolours.com.au/wp-content/uploads/2021/10/` | © Susan Czermak |
| `SusanChambert.jpeg` | `susanczermakwatercolours.com.au/wp-content/uploads/2021/10/` | © Susan Czermak |
| `friends-arcade.jpg` | `susanczermakwatercolours.com.au/wp-content/uploads/2021/10/` | © Susan Czermak |
| `water-trough.jpg` | `susanczermakwatercolours.com.au/wp-content/uploads/2021/09/` | © Susan Czermak |
| `Frostie0488w.jpg` | `susanczermakwatercolours.com.au/wp-content/uploads/2025/11/` | © Susan Czermak |
| `Lakehouse5897w.jpg` | `susanczermakwatercolours.com.au/wp-content/uploads/2025/11/` | © Susan Czermak |

## Sample Pricing Mode

Three paintings have *sample presentation pricing* enabled with `samplePriceAud` in content.json. These display as "Sample presentation only — price to be confirmed by Susan" and use a visually distinct presentation format.

Set `samplePriceAud: null` in content.json to remove all sample pricing before publication.

## Prototype Story Labels

Six artwork stories are tagged `prototypeStory: true` in content.json. Each appears with the label:
**"Illustrative story draft — to be confirmed with Susan."**

Set `prototypeStory: false` in content.json when Susan confirms a story.

## Items Still Needed from Susan

- [ ] Artwork dimensions for all unmeasured works
- [ ] Actual pricing for all available works
- [ ] Portrait or studio photograph
- [ ] Confirmation/replacement of 6 illustrative stories
- [ ] Preferred contact email for enquiry form
- [ ] Decision on which collections to keep/merge
