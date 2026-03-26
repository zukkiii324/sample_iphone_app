# CLAUDE.md

## Project Overview

Static website template for multi-category content, deployed on GitHub Pages. Despite the repo name, this is **not** an iOS app — it's a vanilla HTML/CSS static site written entirely in Japanese.

## Repository Structure

```
├── index.html                  … Homepage with hero + category navigation
├── assets/css/base.css         … Shared design system (variables, components, layout)
├── pages/
│   ├── business/               … Business solutions (accent: teal #0f766e)
│   ├── creative/               … Creative studio (accent: purple #7c3aed)
│   ├── support/                … Support & learning (accent: blue #2563eb)
│   └── lifestyle/              … Lifestyle content (accent: purple, extended styles)
│       Each contains: index.html + styles.css
├── docs/                       … Deployment guides (Japanese)
├── DEVELOPMENT_RULES.md        … Development guidelines (Japanese)
├── README.md                   … Project overview (Japanese)
└── 内容.md                     … Content notes
```

## Tech Stack

- **Languages:** HTML5, CSS3 (no JavaScript currently)
- **Framework:** None — pure static files, zero dependencies
- **Build system:** None — files served as-is
- **Package manager:** None
- **Deployment:** GitHub Pages from `main` branch root
- **Font:** Noto Sans JP + Inter

## Development Conventions

### Language
- **All content, comments, and documentation must be in Japanese**
- **Commit messages must be written in Japanese** (per DEVELOPMENT_RULES.md)

### CSS Architecture
- Shared styles in `assets/css/base.css` using CSS custom properties
- Each category page overrides `--color-accent` for theming
- Key variables: `--color-bg`, `--color-surface`, `--color-text`, `--color-muted`, `--color-accent`, `--color-border`
- Naming: kebab-case for classes (`site-header`, `nav-links`, `category-page`)
- Modern CSS features: `color-mix()`, CSS Grid, Flexbox, `backdrop-filter`

### HTML
- Semantic elements: `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`
- `lang="ja"` on all pages
- Accessibility: ARIA labels, proper heading hierarchy, focus states

### Adding a New Category Page
1. Create `pages/<category-name>/` directory
2. Add `index.html` following existing page patterns (link to `../../assets/css/base.css`)
3. Add `styles.css` overriding `--color-accent` with category-specific color
4. Add navigation link in `index.html` (homepage)

## Key Rules (from DEVELOPMENT_RULES.md)

- No backend — all data managed in frontend
- DRY principle: reuse shared styles from `base.css`
- Single responsibility: keep functions/components focused
- Update documentation when making changes
- Composition over inheritance
- Fetch latest branch before starting work

## Testing

No automated testing framework. Verify changes by:
- Visual inspection in browser
- Responsive testing (breakpoints: 920px, 720px)
- Cross-browser compatibility check

## CI/CD

No CI/CD pipeline configured. Deployment is automatic via GitHub Pages on push to `main`.

## Git Workflow

- Default branch: `main`
- Commit messages: Japanese, descriptive of changes and purpose
- Fetch latest work branch before starting to avoid conflicts
