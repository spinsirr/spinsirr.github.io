---
title: 'What I am building: agent infrastructure at CoreSpeed'
description: 'A quick tour of Zypher Agent, Sarea, and HaaS — and the idea tying them together.'
pubDate: 'Jun 12 2026'
---

Most "AI agents" today are a chat box wired to a model. That's a demo, not a system. The
interesting problems start once you want a _team_ of agents to take on a whole job
reliably — and that's the layer I work on at CoreSpeed.

## Zypher Agent

An open-source framework for building agents with full control over tools, providers, and
execution flow. Minimal core, no magic. ([336★ on GitHub](https://github.com/corespeed-io/zypher-agent).)

## Sarea

The platform. Run a team of agents that takes on the whole task, not just a single turn of
chat.

## HaaS — Harness as a Service

The runtime underneath. A _harness_ is the loop around a model: how it sees tools, recovers
from errors, and stays on task. HaaS turns that loop into a service you can point an agent
at.

The throughline is simple: **empower the agents, then get out of the way.** Give them a
solid harness and good tools, and they stop being a parlor trick and start being
infrastructure.
