---
title: 'Why agents make stale comments expensive'
description: 'An agent refactor changed 83 files and 10 carried the logic. Most of the rest were file paths in comments, which no tool checks and the next agent reads as fact.'
pubDate: 'Sep 29 2026'
kind: essay
tags: ['Agents', 'Refactoring', 'TypeScript']
featured: false
draft: false
ogImage: '/blog/why-agents-make-stale-comments-expensive/cover-83-files.png'
---

An agent refactored the identity module in our API worker this week. The goal was narrow: move flows that coordinate several modules out of the route files.

The pull request merged with 83 changed files. Ten carry the logic. Most of the rest changed because a comment or a doc named a file path.

![83 changed files drawn as squares, split into 42 inside the identity module and 41 elsewhere. Ten carry logic, four hold barrel and docs-map edits from the same commits, seven have only import path edits, 23 have import and comment path edits, and 39 have only comment or doc path edits. 37 of those 39 sit outside the module.](/blog/why-agents-make-stale-comments-expensive/fig-83-files.png)


<figure class="post-sketch">
  <img src="/blog/why-agents-make-stale-comments-expensive/hand-drawn.webp" width="1400" height="933" loading="lazy" alt="An old path note pointing to an empty shelf after a folder moved." />
  <figcaption>A sketch of how a path comment can outlive the code it describes.</figcaption>
</figure>
<figure class="post-flow">
  <ol aria-label="Refactor and stale-comment sequence">
    <li><strong>Move the implementation</strong><span>Imports break and the compiler finds them.</span></li>
    <li><strong>Leave an old path comment</strong><span>Text references can remain stale without a failing check.</span></li>
    <li><strong>Next agent reads it</strong><span>An outdated comment becomes misleading context.</span></li>
  </ol>
  <figcaption>Flowchart: Refactor and stale-comment sequence. The article text and linked evidence explain the boundaries in detail.</figcaption>
</figure>

## Where the other 73 came from

The agent wrote five commits. Three move the agent, org and `/me` flows. The fourth splits the feature into domain folders, so `agents-pg.ts` becomes `agents/data.ts`.

That move was checked for free. Every import still pointing at an old path failed to compile, and TypeScript listed each one.

The fifth commit fixes paths in comments and docs: 181 lines across 51 files. Nothing listed those. One of them, from a dashboard component:

```diff
- charge (recordUsage in api-key-pg.ts) — a key used solely for
+ charge (recordUsage in identity/keys/data.ts) — a key used solely for
```

By file, 75 of the 83 got a path edit in a comment or doc. For 39 that was the whole change, and 37 of those sit outside the identity module: dashboard, billing, admin tests, `wrangler.toml`.

## The next agent reads the comment as fact

A person who follows a stale path finds the file missing and goes looking. For an agent, the comment is context. It sits beside the code, and nothing marks it as older than the code.

Often it is the only place the reason is written down, so it gets used. Had the dashboard edit been missed, the next agent would go looking for `api-key-pg.ts`, which no longer exists.

## Cheap to write, hard to check

A missed path in a comment breaks nothing, so the only check is a search for the old names. The search only finds the names someone thinks to try.

Short names make that worse. `routes.ts` and `middleware.ts` exist in many folders, so an old path like `identity/middleware.ts` is easy to miss in grep output.

Writing those edits cost the agent little. Checking them fell to review: one-line edits across dozens of files, with no build behind them. I could list the paths the fifth commit fixed. I could not show that none were left.

## Taking paths out of comments

The fix is to stop writing file locations in code comments. In the worker, 231 files open with a comment that repeats their own path. A follow-up, not merged yet, deletes those lines.

About 600 more lines point at another file by location. They will name the symbol instead: `recordUsage`, not `api-key-pg.ts`, or `{@link recordUsage}`, which the TypeScript language service resolves and renames.

A comment saying a test fake "mirrors ApiKeyPgRow" becomes a `satisfies` constraint, so the compiler checks the mirror.

Docs keep their paths, because a docs map exists to say where files are. They get a link check that fails on a missing path. A CI check that rejects paths in code comments keeps the rule in place.

Before a folder move, grep the comments for the paths you are about to change. If there are many, take the paths out first, in their own PR. The move that follows then changes only files and imports.
