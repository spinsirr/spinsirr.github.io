---
title: 'AI agent portability: run one agent across hosts'
description: 'AI agent portability — keep your apps, memory, voice, and policy with the agent, not the host. Switch Claude Code, Codex, and Cursor without re-setup.'
pubDate: 'Jun 10 2026'
---

I run agents in Claude Code, Codex, and Cursor depending on the task. The host changes. The agent shouldn't. But most setups bolt the agent to the tool — the integrations, the memory, the rules all live in whatever client you started in. Switch hosts and you start over.

That's backwards. The agent is what you invested in. The host is just where it runs today.

## Why AI agent portability matters

When the setup lives inside one client, you're locked in. New host means new OAuth flows, new API keys per service, new policy config, and reteaching your writing style. You pay the setup tax again every time you move — so you don't move, even when another host fits the job better.

Make the agent portable and that flips. The agent carries its own context. The host becomes swappable.

## What travels with the agent

Four things should belong to the agent, not the client:

- **Apps** — one connection to the 50+ services you already use, not fresh wiring per host.
- **Memory** — contacts, past decisions, and how you write, kept across hosts.
- **Voice** — it sounds like you whether it's drafting in Codex or Cursor.
- **Policy** — your plain-English rules, approvals, and spending limits stay enforced everywhere.

## How I do it

This is what CoreSpeed is for: the access and control layer that holds the apps, memory, voice, and policy so they move with the agent. I connect once, set the rules once, and run the same agent across Claude Code, Codex, and Cursor without redoing any of it. [corespeed.io](https://corespeed.io)

Pick the host for the task. Keep the agent.
