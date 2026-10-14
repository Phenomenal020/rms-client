# Static assets layout

Files in `public/` are served from the site root (`/aid-logo-light.svg`).  
Browser / phone icons live in **`client/app/`**, not under `public/`.

---

## Target layout

```text
client/
├── app/
│   ├── icon.svg          ← tab icon (Next.js metadata)
│   ├── favicon.ico       ← Safari / legacy browsers (add when ready)
│   └── apple-icon.png    ← iOS home screen (add when ready)
│
└── public/
    ├── ASSETS.md
    ├── aid-logo-light.svg
    ├── aid-logo-dark.svg
    ├── aid-logo-compact-light.svg
    ├── aid-logo-compact-dark.svg
    ├── aid-mark-light.svg
    ├── aid-mark-dark.svg
    └── images/                    ← optional: non-brand static files
        └── pipeline/
            ├── pipeline-setup-enhanced.png
            ├── pipeline-setup-enhanced-mobile.png
            └── …
```

Do **not** create `public/app/` — Next.js will not treat that as app metadata.

---

## Logos (`public/` root)

| File | Use |
|------|-----|
| `aid-logo-light.svg` / `aid-logo-dark.svg` | Full logo + “Result management” — hero, footer, documents |
| `aid-logo-compact-light.svg` / `aid-logo-compact-dark.svg` | Mark + “AiD” — nav |
| `aid-mark-light.svg` / `aid-mark-dark.svg` | A+ ring only |

**URLs in code:** `/aid-logo-compact-light.svg` (or `-dark` when theme is dark).

Optional grouping (only if you want tidier folders — update paths in code):

```text
public/brand/aid-logo-light.svg  →  URL: /brand/aid-logo-light.svg
```

Keeping the six SVGs at **`public/` root** is simplest and matches current filenames.

---

## Marketing / pipeline images (optional subfolder)

If you add many PNGs, move them under `public/images/pipeline/` and update references in `stage-mocks.tsx`:

```text
/images/pipeline/pipeline-setup-enhanced.png
```

---

## App icons (`client/app/`)

| File | Use |
|------|-----|
| `icon.svg` | Tab icon; can use `prefers-color-scheme` in SVG |
| `favicon.ico` | Export from mark; required for some browsers |
| `apple-icon.png` | Typically 180×180; iOS “Add to Home Screen” |

Generate `favicon.ico` and `apple-icon.png` from `aid-mark-light.svg` / `aid-mark-dark.svg`.

---

## Checklist

- [x] Six logo SVGs in `public/` root  
- [x] `icon.svg` in `client/app/` (not `public/app/`)  
- [ ] `favicon.ico` and `apple-icon.png` in `client/app/`  
- [ ] Wire `BrandLink` / footer / hero to compact & full SVGs  
- [ ] Pipeline PNGs in `public/images/pipeline/` (optional) + update paths  
