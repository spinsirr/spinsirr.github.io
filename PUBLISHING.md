# Publishing on spinsirr.github.io

This is the source of truth for article selection, writing, checks, and release. The scheduled Memory review reads this file rather than keeping a separate editorial policy.

## Choose a topic

- Read the existing posts in `src/content/blog/` before choosing a topic. Publish at most one substantial new article per review; skip the review if nothing qualifies.
- This is a personal site. Software is one subject, not a required frame. Cars and repair work, hardware projects, product decisions, places, and personal observations also belong when Spencer has real material he wants to share. Do not force these subjects into an engineering lesson.
- Ground each post in a concrete project, incident, code change, measured result, or firsthand experience. Short concept-only explainers and posts written to fill a schedule do not belong here.
- Lore and CoreSpeed Memory are **read-only** in the Personal Website/CV project. They can suggest a topic, but they are not publishable sources or permission to disclose personal details. Do not create, change, or delete memories through any tool or account as part of this workflow.
- Verify factual claims and dates against public code, merged PRs, documentation, public artifacts, or material Spencer has explicitly approved for publication. A memory-only personal story is not enough. Check newer evidence when memories conflict or describe an earlier state.
- Check current product names and GitHub's canonical repository URLs before linking them. The curated project list in `src/consts.ts` is the site's source of truth; link a private project to its public product page rather than a repository visitors cannot access.
- Keep private Memory text, credentials, internal plans and decisions, customer information, and personal data out of the site. Do not present team work as solely Spencer's work or invent first-person experience.

## Write

Add a `.md` file to `src/content/blog/`. Use `.mdx` only when an article needs an interactive or reusable component; static figures belong in Markdown. Link directly to the public evidence for specific technical claims. Give the article a clear, searchable title and a stable filename.

Every new article needs at least one relevant visual in its body and a post-specific social image (`ogImage`). Prefer real project images, direct code or data figures, and evidence-backed charts. For diagrams made of text and relationships, prefer inline HTML in Markdown with scoped CSS using the site's theme tokens; the diagram should follow the selected theme and reflow on narrow screens. A diagram must explain a specific mechanism that the prose cannot show as clearly. Keep editable source files for original figures. Avoid slogan-led covers, decorative cards, fake interfaces, and invented product imagery. Give body images descriptive alt text and HTML figures a semantic caption; check legibility in both site themes and at article width.

```yaml
---
title: 'A concrete title'
description: 'One sentence that says what the reader will learn.'
pubDate: 'Sep 24 2026'
kind: field-note # research | essay | field-note | project-note
tags: ['TypeScript', 'Browser']
featured: false
draft: false
---
```

The schema in `src/content.config.ts` defines the supported fields and kinds. The posts themselves are the record of what has already been published.

## Release

1. Update the local checkout from `main` and check the current posts for duplication.
2. Draft the article, verify every public link and attribution, and remove details that are not ready to be public.
3. Run `bun run build`. Inspect the rendered page, including images and code blocks in both site themes. The site's `html[data-theme]` state controls the code theme as well as the rest of the page.
4. Commit and push the finished post to `main`. Wait for the GitHub Pages workflow and verify the public URL shows the intended title and content.
5. Notify only when a post is live, publication fails, or a decision is needed. An uneventful review stays quiet.
