# DSA Copilot — Icons

Chrome extensions require PNG icons at 16×16, 32×32, 48×48, and 128×128 pixels.

## For Development

Place your PNG icon files here:
- `icons/icon16.png`
- `icons/icon32.png`
- `icons/icon48.png`
- `icons/icon128.png`

## Quick Placeholder Icons

Run this script from the project root to generate solid-color placeholder icons
using the `sharp` npm package (optional, only for development):

```bash
node scripts/generate-icons.js
```

Or manually create any 128×128 PNG and resize it to the required sizes using
any image editor (Figma, GIMP, Preview, etc.).

## Design Spec

The DSA Copilot icon uses:
- Background: #09090b (near black)
- Primary color: #09d2f5 (cyan brand)
- Symbol: `⟨/⟩` in Space Mono font
- Border radius: ~22% of size
