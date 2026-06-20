---
title: 'AG-UI: giving your AI agent a real interface'
description: 'AG-UI is a protocol for streaming agent state and actions into a product UI. How I use it in Fixo to turn a chat into real actions.'
pubDate: 'Jun 16 2026'
---

A chat box is the lowest-effort agent UI, and it shows. Real products need the agent's work to
land in the interface — an estimate appears, a status changes, a button does the thing. That's the
gap **AG-UI** fills.

## Past the chat box

AG-UI is a protocol for streaming agent state and actions to a frontend, so the UI reflects what
the agent is actually doing instead of just printing text back at the user. The agent becomes a
participant in the product, not a sidebar bolted onto it.

## In Fixo

In [Fixo](https://github.com/hmls-autos/hmls) — a mobile-mechanic platform — the agent chats with
a customer, diagnoses the fault, creates a repair estimate, and drives the order flow. The UI
updates as the agent works, backed by a Deno + Hono service and Stripe for payments. The chat is
just the entry point; AG-UI is what makes it feel like software.
