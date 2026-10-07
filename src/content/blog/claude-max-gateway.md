---
title: 'A dual-format gateway for Claude Max'
description: 'Point your existing OpenAI- or Anthropic-SDK code at a Claude Max subscription, no rewrites.'
pubDate: 'Jun 05 2026'
kind: project-note
tags: ['Open source', 'LLM infrastructure', 'Claude']
---

If you pay for Claude Max, you already have a lot of model access, but most tools and SDKs
expect a raw API key, not a subscription. **Claude Max Gateway** bridges that gap.

It's a small gateway that speaks **both** the OpenAI Chat Completions format and the Anthropic
Messages format, and routes requests through the Claude Code CLI. An OpenAI SDK app, an Anthropic
SDK app, or an agent framework can point at the gateway
and just work, backed by your Max plan.

The point is leverage: stop maintaining two integrations and stop paying twice for access you
already have. Code's on [GitHub](https://github.com/spinsirr/claude-max-gateway).

<figure class="post-sketch">
  <img src="/blog/claude-max-gateway/hand-drawn.webp" width="1400" height="933" loading="lazy" alt="Two different connectors joining an adapter that leads to one model endpoint." />
  <figcaption>A sketch of the gateway accepting two request formats.</figcaption>
</figure>
<figure class="post-flow">
  <ol aria-label="Gateway request path">
    <li><strong>OpenAI or Anthropic SDK</strong><span>Existing clients send their usual request format.</span></li>
    <li><strong>Gateway translates</strong><span>The local service accepts both formats.</span></li>
    <li><strong>Claude Code CLI</strong><span>Requests use the subscription-backed path described here.</span></li>
  </ol>
  <figcaption>Flowchart: Gateway request path. The article text and linked evidence explain the boundaries in detail.</figcaption>
</figure>
