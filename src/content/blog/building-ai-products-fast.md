---
title: 'Building AI products fast: my stack and patterns'
description: 'The stack and patterns I use for building AI products fast — Vercel AI SDK, Deno + Hono, Supabase, Drizzle, Stripe, AG-UI — drawn from BuildLog and Fixo.'
pubDate: 'Jun 20 2026'
---

Building AI products fast is mostly about not re-deciding. The speed doesn't come from a clever framework or a fast model. It comes from a default stack I've stopped re-litigating per project, plus a handful of patterns that keep holding up after a demo turns into a product. The stack is the boring part. The patterns are the part worth writing down.

I'll keep this concrete by anchoring it to two real products. **BuildLog** ([buildlog.ink](https://buildlog.ink)) turns a team's commits, PRs, and releases into draft social posts you review and publish — Next.js 16, Supabase, and the Vercel AI SDK with Gemini, a straight web app. **Fixo** is a mobile-mechanic platform where an agent diagnoses the car fault, writes the estimate, and drives the Stripe payment: a Next.js web front, a Deno + Hono API for the agent on the back, AG-UI carrying the agent's work into the UI, Supabase + Drizzle underneath. Same defaults, two different shapes.

This isn't a survey of options. It's the opinionated set I reach for, and the reason a fixed set is worth having: once the plumbing is decided, the interesting decisions move up to the product.

## The stack, and why I stopped choosing

Here's the default, with the one-line reason each piece earns its slot:

- **TypeScript everywhere** — one language across web, API, and agent, so context-switching costs nothing.
- **Next.js + React** — the product surface, the part users actually touch.
- **Deno + Hono** — the agent backend when the agent needs its own service.
- **Vercel AI SDK** — one typed interface for all the model work.
- **Supabase + Postgres + Drizzle** — real data and auth on day one, typed end to end.
- **Stripe** — payments, with the least glue between an estimate and money moving.
- **AG-UI** — the protocol that gets the agent's work onto the screen.
- **MCP** — when tools need to be portable across agents and runtimes.

The trade-off is explicit, and I think it's right: a fixed stack means I sometimes use a slightly-less-ideal tool for a given job. The hours I'd burn evaluating the marginally better alternative are worth more spent shipping. Every evaluation is scope I didn't cut.

Where the stack flexes is the shape, not the pieces. BuildLog is plain Next.js + Supabase because generation there is request-shaped: commits in, draft out. Fixo splits the agent backend onto Deno/Hono because an agent that diagnoses a fault and then transacts on it needs its own service boundary — its own request lifecycle, its own control flow.

And TypeScript is a default for products, not a religion. **Amazon Order Wizard** is React 19 + Rust (Axum) + MongoDB because it's offline-first browser-extension work, and that problem wants a different toolset. The point of a default is that you only break it on purpose, when the problem clearly demands it.

## Vercel AI SDK patterns for building AI products

The SDK earns its slot for one reason: a single typed interface for streaming, tool calling, and structured output across providers. When the goal is shipping, that consistency beats squeezing the last 5% out of any one model. You write against one shape and the provider becomes a config detail.

Four patterns survive contact with production:

1. **Stream everything.** A blank spinner feels broken at three seconds; a response writing itself in real time buys you patience.
2. **Tools over prompts.** A function the model can invoke is testable in a way a paragraph of instructions never is.
3. **Schema-validated structured output.** When you need data back, validate it against a schema instead of parsing free text and hoping.
4. **Route through the gateway.** When a model gets slow or a provider has a bad day, you don't want a code change to be the fix.

These aren't abstract. BuildLog runs all of its generation on the SDK with Gemini and leans on structured output — the model hands back shaped data, not a blob you regex. Fixo's agent uses tools — create the estimate, take the payment — so the model *acts* rather than narrates. That's the line between a chatbot and a product: the model does the thing instead of describing how you might do the thing.

Here's the shape, with a tool the model can call to write an estimate:

```ts
import { streamText, tool } from 'ai';
import { z } from 'zod';

const result = streamText({
  model: 'google/gemini-2.5-flash',
  prompt: diagnosis,
  tools: {
    createEstimate: tool({
      description: 'Write a repair estimate for the diagnosed fault',
      inputSchema: z.object({
        part: z.string(),
        laborHours: z.number(),
        totalCents: z.number().int(),
      }),
      execute: async (input) => saveEstimate(input),
    }),
  },
});
```

I won't re-derive the SDK here — the deeper how-to is in [/blog/vercel-ai-sdk-agents/](/blog/vercel-ai-sdk-agents/). This section is the *why it's the default*; that post is the *how*.

## Deno + Hono for agent backends

The split is the idea worth keeping: the product UI lives in Next.js, and the agent gets its own service. In Fixo that service is Deno + Hono — the API the agent runs behind while it diagnoses, estimates, and pushes the order forward.

Why Deno + Hono for this layer:

- **TypeScript-native runtime** — no build step between you and running code, same language as everything else.
- **A small, fast HTTP layer** — Hono gets out of the way, which is what you want under an agent loop.
- **A clean boundary** — tool execution, retries, and control flow live here, separate from the web app's request lifecycle.

An agent loop and a web request want different things. A web request is short and stateless; an agent loop is multi-step, retries, recovers from a failed tool call, and has to stay on task across all of it. That loop is real infrastructure — worth building once and treating seriously, not bolting onto a page handler. What the loop actually contains is its own post: [/blog/agent-harness/](/blog/agent-harness/).

The honest trade-off: splitting the backend out costs you a service to run. Only pay that when the agent does real multi-step work, like Fixo. When generation is request-shaped, keep it in the app — which is exactly why BuildLog has no separate agent service.

## Data and auth: Supabase + Drizzle

Supabase for Postgres, auth, and the managed bits I don't want to operate; Drizzle as the typed query layer on top so the schema and the TypeScript stay in lockstep.

Why it's fast: you get auth and a real Postgres on day one, and typed queries that catch schema drift at compile time. That second part kills a whole category of dumb runtime bugs — the kind where a column rename ships and something downstream breaks in production three days later. Catching it in the type-checker is hours you don't lose. Both BuildLog and Fixo sit on Supabase.

The win is sharpest when an agent is involved. Drizzle gives the agent's tools, the API, and the UI one source of truth for the schema. In Fixo the agent writes rows — estimates, orders — and a human reads them back in the product. When the tool and the UI derive their types from the same schema, the data the agent writes is the data the human sees, guaranteed by the compiler instead of by hope.

The trade-off: Supabase is an opinionated managed platform. You give up some control in exchange for not running Postgres yourself. The day you genuinely need to operate your own database, you'll know — and it won't be day one.

## Payments and money guardrails: Stripe

Payments show up earlier in agent products than people expect. Fixo's agent doesn't just chat — it writes an estimate and drives the Stripe payment. A mechanic agent that diagnoses and estimates but can't take payment is a demo. The product isn't real until money moves.

Stripe is the default for the same reason as everything else here: the least glue. The agent's job — produce an estimate, request payment — maps cleanly onto a Checkout flow, with little impedance between what the agent decides and what Stripe needs.

But once an agent can spend or charge, the controls stop being optional. You want spending limits and human-in-the-loop approvals around it, because an agent moving money is exactly where you don't want surprises. This is the productized version of that problem: CoreSpeed's Agent Pay gives you budgets and spending limits, and plain-English policy gives you approval rules you can actually read. The full picture — policy, approvals, and pay — is in [/blog/ai-agent-guardrails/](/blog/ai-agent-guardrails/). Stripe drives the order and payment; the guardrails decide what the agent is allowed to do with it.

## AG-UI: giving the agent a real product surface

A chat box is the lowest-effort agent UI, and it shows. Text scrolling in a window is fine for a prototype, but a real product needs the agent's work to land *in the interface* — an estimate appears as a card, a status flips, a button does the thing the agent decided to do.

AG-UI is the fix: a protocol for streaming agent state and actions into the frontend, so the UI reflects what the agent is doing rather than printing what it said. In Fixo, the chat is the entry point — but AG-UI is what makes the rest feel like software instead of a transcript.

This is also why AG-UI pairs with the Deno/Hono backend. The agent service emits state and actions; AG-UI carries them to the Next.js surface; the UI renders them as real interface. Those are the halves of making an agent a participant in the product instead of a text generator bolted to the side of it. The deeper treatment is in [/blog/ag-ui-agent-surfaces/](/blog/ag-ui-agent-surfaces/) — this is the where-it-fits-in-the-stack view.

## Shipping discipline: cut scope, ship, iterate

The stack buys you speed only if you also cut scope hard. That's the lever none of the tools can pull for you. Pick the smallest version that delivers the core action and ship that. For BuildLog the core is commits-in, draft-out. For Fixo it's diagnose, estimate, pay. If a feature isn't on the path between those, it waits.

The discipline is short:

- **Default the stack** so your decisions go to the product, not the plumbing.
- **Ship the thin slice** that does the one thing the product is for.
- **Let real usage tell you what to build next** instead of guessing in the planning doc. The doc is always wrong in ways only usage reveals.

There's a meta-version of this, and it's most of what I think about at CoreSpeed. The slowest part of building AI products isn't the model or the UI — it's wiring every integration and guardrail by hand. Every app the agent touches is another OAuth flow, another set of keys, another spending limit you implement from scratch. That's the setup tax, and it's exactly the access-and-control layer CoreSpeed removes: one connection to the apps you already use, built-in tools, and policy you can read. I've written about that bet in [/blog/building-agent-infrastructure/](/blog/building-agent-infrastructure/), and the whole pitch is at [corespeed.io](https://corespeed.io).

Builder to builder: the stack isn't sacred, the patterns are. Stream everything, tools over prompts, validate your output, keep a human on the money. Get those right and let real usage steer. The rest is just shipping.
