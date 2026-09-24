# Publishing on spinsirr.github.io

This is the source of truth for article selection, writing, checks, and release. The scheduled Memory review reads this file rather than keeping a separate editorial policy.

## Choose a topic

- Read the existing posts in `src/content/blog/` before choosing a topic. Publish at most one substantial new article per review; skip the review if nothing qualifies.
- Ground each post in a concrete project, incident, code change, or measured result. Short concept-only explainers and posts written to fill a schedule do not belong here.
- CoreSpeed Memory is **read-only** in the Personal Website/CV project. It can suggest a topic, but it is not a publishable source. Do not create, change, or delete memories through any tool or account as part of this workflow.
- Verify factual claims, dates, and Spencer's contribution against public code, merged PRs, documentation, or other public evidence. Check newer evidence when Memory entries conflict or describe an earlier state.
- Check current product names and GitHub's canonical repository URLs before linking them. The curated project list in `src/consts.ts` is the site's source of truth; link a private project to its public product page rather than a repository visitors cannot access.
- Keep private Memory text, credentials, internal plans and decisions, customer information, and personal data out of the site. Do not present team work as solely Spencer's work or invent first-person experience.

## Write

Add a `.md` file to `src/content/blog/`. Use `.mdx` only when an article needs an interactive or reusable component; static figures belong in Markdown. Link directly to the public evidence for specific technical claims. Give the article a clear, searchable title and a stable filename.

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
3. Run `bun run build`. Inspect the rendered page, including code blocks in both site themes. The site's `html[data-theme]` state controls the code theme as well as the rest of the page.
4. Commit and push the finished post to `main`. Wait for the GitHub Pages workflow and verify the public URL shows the intended title and content.
5. Notify only when a post is live, publication fails, or a decision is needed. An uneventful review stays quiet.
