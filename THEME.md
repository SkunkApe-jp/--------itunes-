# Theme & Architecture Notes

## Green Color System

This project uses a **green color palette** (`rgb(34 197 94)` — Tailwind's `green-500`) for all interactive and accent colors. The classes are deliberately named `custom-blue-*` to avoid refactoring every component.

### Color Scale

| Class | Value | Use |
|---|---|---|
| `bg-custom-blue-50` / `bg-custom-blue-500/5` | `rgb(34 197 94 / 0.05)` | Hover tints, subtle backgrounds |
| `bg-custom-blue-100` | `rgb(34 197 94 / 0.1)` | Light fill |
| `bg-custom-blue-500` | `rgb(34 197 94)` | Full accent, buttons, rings |
| `text-custom-blue-500` | `rgb(34 197 94)` | Accent text, icons |
| `border-custom-blue-500` | `rgb(34 197 94)` | Borders, focus rings |

### CSS Variable (for inline styles)

```css
--theme-green: 34 197 94;
--custom-blue-500: rgb(var(--theme-green));
--custom-blue-50:  rgb(var(--theme-green) / 0.05);
```

---

## Why Colors Rendered Transparent (The Dual-Tailwind Problem)

This app runs **two Tailwind instances simultaneously**:

| Layer | Source | Version | How it reads config |
|---|---|---|---|
| Build (Vite + PostCSS) | `index.css` → `@import "tailwindcss"` | **v4** | `@theme {}` block in CSS |
| Runtime (CDN) | `index.html` → `<script src="cdn.tailwindcss.com">` | **v3** | `tailwind.config = {}` JS object |

**The bug:** The CDN Tailwind v3 config in `index.html` only had `darkMode: 'class'` — it had no knowledge of `custom-blue-*` colors. When it processed a class like `bg-custom-blue-500`, it generated nothing at all. In a race between v3 (no output) and v4 (correct output), the CDN's reset styles could win.

**The fix:** Extended `tailwind.config` in `index.html` with the full `custom-blue` + `blue` color maps so both Tailwind instances agree.

The `!important` overrides in `custom-blue-theme.css` are kept as the final safety net (they always win).

---

## Why Fullscreen Markdown Was "Half-Assed"

The `FullscreenOverlay` was using `prose prose-lg dark:prose-invert` from `@tailwindcss/typography`. Two problems:

1. **`text-center` on the prose wrapper** — cascaded into every markdown element, including paragraphs and lists, making long-form content unreadable.
2. **Typography plugin not available to CDN Tailwind** — `@tailwindcss/typography` is a PostCSS plugin loaded at build time. The CDN Tailwind v3 in `index.html` runs without it, so `prose` generated no styles. CDN's own base resets then stripped all formatting.

**The fix:** Replaced `prose` entirely with an explicit `components` map passed to `<ReactMarkdown>`. Every element — headings, paragraphs, lists, code, blockquotes, tables — has its own `style={}` object. This is immune to whichever Tailwind instance wins.

---

## Font System

| Variable | Font | Weight | Used for |
|---|---|---|---|
| `--font-pp-editorial` | PP Editorial Old | 200 | Node titles, headings |
| `--font-atkinson` | Atkinson Hyperlegible Next | 200 (extralight) | Body text, sans-serif everywhere |
| `--font-mono` | SF Mono / Monaco / Inconsolata | — | Code blocks |

```css
/* index.css */
@import url('https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible+Next:wght@200;400;700&display=swap');

:root {
  --font-atkinson: 'Atkinson Hyperlegible Next', sans-serif;
}
```

Apply via Tailwind utility: `font-sans` → maps to `--font-atkinson`.

---

## File Map

| File | Purpose |
|---|---|
| `index.css` | Tailwind v4 entry. `@theme` block defines colors. Font imports. |
| `index.html` | CDN Tailwind v3 config. Must mirror `@theme` colors. Also holds base CSS vars. |
| `src/assets/custom-blue-theme.css` | Hardcoded `!important` overrides as final fallback. CSS vars for dynamic node styling. |
| `tailwind.config.js` | **Ignored by Tailwind v4.** Kept for reference only. |
| `components/FullscreenOverlay.tsx` | Fullscreen preview. Uses explicit inline `style=` for markdown, not `prose`. |
