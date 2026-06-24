---
title: 'The AI agent tools every platform should ship built in'
description: 'App connectors aren''t enough. The AI agent tools every agent needs built in: web search, scraping, image generation, code sandboxes, and email.'
pubDate: 'Jun 09 2026'
---

Connecting an agent to your apps is the obvious half. The other half is the work an agent does on its own: search the web, read a page, generate an image, run code, send an email. Those aren't integrations into your stack. They're the agent's hands.

## The AI agent tools that belong built in

A few capabilities show up in almost every agent I build, whatever the project:

- **Web search** — find current information instead of guessing from training data.
- **Web scraping** — pull the actual contents of a page once you've found it.
- **Image generation** — produce assets inline, not as a separate step.
- **Code sandboxes** — run generated or untrusted code somewhere safe.
- **Email** — send the result to a real person when the work is done.

None of these are specific to one customer or one workflow. Every agent wants them.

## Why they belong in the platform

If the platform doesn't ship these, you rebuild them per project. A scraping setup here, a sandbox there, an image pipeline in the next repo. Each one has its own keys, its own quirks, its own bugs. You end up maintaining five small toolchains that have nothing to do with your product.

That's the setup tax. It's the same reason app access should go through one OAuth instead of per-service keys: wiring the same plumbing by hand, again, is wasted work.

At [CoreSpeed](https://corespeed.io) the built-in tools sit next to the app connectors and the memory. The agent gets search, scraping, image generation, sandboxes, and email out of the box, and that set travels with it across Claude Code, Codex, and Cursor.

Build the model into something useful, not something you reassemble every time.
