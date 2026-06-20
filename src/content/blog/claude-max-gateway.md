---
title: 'A dual-format gateway for Claude Max'
description: 'Point your existing OpenAI- or Anthropic-SDK code at a Claude Max subscription, no rewrites.'
pubDate: 'Jun 05 2026'
---

If you pay for Claude Max, you already have a lot of model access — but most tools and SDKs
expect a raw API key, not a subscription. **Claude Max Gateway** bridges that gap.

It's a small gateway that speaks **both** the OpenAI Chat Completions format and the Anthropic
Messages format, and routes requests through the Claude Code CLI. So whatever you've already
built — an OpenAI-SDK app, an Anthropic-SDK app, some agent framework — can point at the gateway
and just work, backed by your Max plan.

The point is leverage: stop maintaining two integrations and stop paying twice for access you
already have. Code's on [GitHub](https://github.com/spinsirr/claude-max-gateway).
