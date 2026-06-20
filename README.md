# spinsirr-web

Personal site for **Spencer (Yunpeng) Zhao** — cofounder at [CoreSpeed](https://corespeed.io), based in San Jose.

Live at **[spinsirr-web.vercel.app](https://spinsirr-web.vercel.app)**.

## Stack

- [Astro](https://astro.build) (static output)
- Bricolage Grotesque + JetBrains Mono via the Astro Fonts API
- Markdown / MDX content collections for the blog, with RSS + sitemap
- JSON-LD structured data (Person, WebSite, BlogPosting) for SEO
- Hosted on Vercel — auto-deploys on push to `main`

## Develop

```bash
bun install
bun run dev        # dev server at http://localhost:4321
bun run build      # static build → dist/
bun run preview    # preview the build
```

## Structure

```text
src/
  consts.ts           # profile, projects, stack, stats — single source of truth
  components/          # Header, Footer, BaseHead, ProjectCard, SocialLinks, FormattedDate
  layouts/            # BlogPost
  pages/              # index, projects, about, blog/, rss.xml
  content/blog/       # posts (Markdown)
  styles/global.css   # design tokens + utilities
public/               # avatar, OG image, favicon
```

## Editing

- **Profile, projects, stack, stats** → `src/consts.ts`
- **Blog posts** → add a Markdown file to `src/content/blog/`
- **Design tokens** (colors, fonts, spacing) → `:root` in `src/styles/global.css`

Push to `main` and Vercel deploys automatically.
