# CV Website — Jakob Agelin

Personal CV/portfolio site for Jakob Agelin, Data Engineer based in Mölnlycke, Sweden.

## Project

Static single-page website. No build tool, no framework, no package manager. Everything is plain HTML, CSS, and vanilla JS served directly from the filesystem or a static host.

## File Structure

```
index.html          # Single page, all sections inline
assets/
  css/style.css     # All styles
  js/main.js        # Interactions: typed text, scroll effects, contact form, back-to-top
  js/theme.js       # Dark/light mode toggle and persistence
  js/hero3d.js      # Three.js particle network for hero section background
  media/            # Images (cv-image.jpeg)
```

## Sections (in order)

1. Hero — name, typed role subtitle, CTA buttons
2. About — bio, skill pills, radar pills
3. Experience — project cards grouped by employer/period
4. Certifications — two categories: Data & Engineering, Process & Methodology
5. Education — Göteborgs Universitet BSc
6. Interests — Ice Cream Science, Sourdough Baking
7. Contact — contact info + form

## Conventions

- Indentation: 4 spaces
- CSS classes use kebab-case
- Dark mode is the default (`class="dark-mode"` on `<body>`)
- Font Awesome 6.4.0 loaded from CDN for icons
- No JavaScript frameworks (no jQuery, no React, etc.)
- No external CSS frameworks (no Bootstrap, no Tailwind)
- Three.js (r134, CDN) is approved for the hero section particle network
- Rough.js v4.6.6 (unpkg CDN) is approved for architecture diagrams — lazy-loaded via arch-renderer.js
- Virgil font (excalidraw.com CDN) loaded via @font-face for the hand-drawn diagram aesthetic

## Tone & Content

- First person, direct, honest — not corporate
- Technical depth is valued over buzzwords
- Content reflects genuine interests and experience, not a polished marketing pitch

## Deployment

Hosted as a static site (GitHub Pages or similar). Push to `main` branch to deploy.

## Do Not

- Add build steps, package.json, or bundlers
- Add JS libraries or frameworks without a clear visual/functional purpose
- Introduce external dependencies beyond Font Awesome and Three.js
- Create new files unless clearly necessary
