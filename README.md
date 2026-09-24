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

## Publish

[PUBLISHING.md](PUBLISHING.md) is the source of truth for selecting, writing, checking, and releasing articles, including the recurring Memory review.

Site data lives in `src/consts.ts`; publication utilities live in `src/utils/posts.ts`; the visual system starts in `src/styles/global.css`.
