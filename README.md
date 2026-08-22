# spinsirr.github.io

Spencer (Yunpeng) Zhao’s personal site and field journal. Live at [spinsirr.github.io](https://spinsirr.github.io).

## Publishing system

- Astro static site, deployed to GitHub Pages
- Markdown and MDX with a typed content schema
- Research, essay, field-note, and project-note formats
- Tags, numbered series, archive, table of contents, related reading, and reading time
- Pagefind full-text search and command palette
- Expressive Code, RSS, sitemap, canonical URLs, JSON-LD, and generated social cards
- Raw Markdown per article, plus `llms.txt` and `llms-full.txt`

## Develop

```bash
bun install
bun run dev
bun run build
bun run preview
```

`bun run build` type-checks the site, builds the static output, and creates the Pagefind index.

## Write

Add a `.md` or `.mdx` file to `src/content/blog/`:

```yaml
---
title: 'A concrete title'
description: 'One sentence that says what the reader will learn.'
pubDate: 'Aug 22 2026'
kind: research # research | essay | field-note | project-note
tags: ['Memory systems', 'Evaluation']
featured: false
draft: false
series: # optional
  slug: 'memory-systems'
  title: 'Memory systems'
  order: 1
---
```

Use Markdown for normal prose and static figures. Reach for MDX only when an article needs an interactive or reusable component.

Site data lives in `src/consts.ts`; publication utilities live in `src/utils/posts.ts`; the visual system starts in `src/styles/global.css`.
