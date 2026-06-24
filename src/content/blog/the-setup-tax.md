---
title: 'The setup tax: why connecting AI agents to apps is hard'
description: 'Connecting AI agents to apps means OAuth, token refresh, scopes, rate limits, pagination, and webhooks per service. Here''s why that work stalls agent projects.'
pubDate: 'Jun 21 2026'
---

Open any agent demo cold and the model looks brilliant. It reads the situation, picks the right action, writes a clean plan. Then it tries to actually do the thing, and the illusion drops. The first call to a real app needs an OAuth flow, a stored token, a refresh path when that token expires, and a server somewhere to run all of it. The model gives you none of that. It decided to act; it can't.

This is the setup tax, and it's where most agent projects quietly die before they ship. The reasoning was never the hard part. Connecting AI agents to apps is the actual job: the long, unglamorous distance between "the agent decided" and "the app responded." I've walked every layer of that distance by hand, more than once, and this post is that walk.

The anchor I'll keep coming back to is Fixo, the mobile-mechanic platform I built. Its agent diagnoses a car fault, writes the estimate, then drives a Stripe payment. The diagnosis and the estimate are the easy part — that's the model doing what models do. Making the Stripe call actually fire, under real auth, against real failures, for a real customer's card, is where the work lives.

## OAuth, per service, forever

Every app has its own OAuth dialect. Different authorize and token endpoints. Different consent screens. Different rules about redirect URIs: exact-match versus wildcard, http versus https. Different client registration, where some give you a dashboard and some make you email a form. You do not write "OAuth" once and reuse it. You write Gmail's, then Slack's, then GitHub's, then Stripe's, and each one has a quirk that costs you an afternoon.

Then the tokens expire, and a new layer appears. You need somewhere to store refresh tokens, a path that refreshes before expiry rather than after a failed call, and handling for when the refresh itself fails: a revoked grant, a password change, an uninstalled app. Miss that last case and your agent works beautifully for an hour, then silently starts returning 401s while the user watches it do nothing.

And all of this has to live somewhere. The moment you have one real integration you are running a secrets store and a callback server. With ten you are operating infrastructure whose entire purpose is to hold credentials and catch redirects — infrastructure that has nothing to do with your product. This is the exact wall I described in [MCP vs. connectors](/blog/mcp-vs-connectors/): the protocol defines the shape of the call, not the auth or the accounts behind it. A standard interface doesn't issue you a token.

## Scopes and permissions you only discover at runtime

OAuth scopes are coarse and per-app, and they punish you on both ends. Request too little and the call 403s in production, after the consent screen already said yes. Request too much and the consent screen itself scares the user off, or your app gets flagged when the provider reviews it. There's no comfortable middle you can reason your way to from the docs.

Scopes also drift as the product grows. A workflow that started by reading email now needs to send it. New scope, new consent prompt, re-auth flow for every user who already connected. You don't just ship the feature; you migrate everyone through a permission upgrade.

Below the scope line, permission models diverge in ways no single mental model covers. Org-admin restrictions, workspace settings, repo-level versus org-level access. The token can be entirely valid and the action still denied — not because of auth, but because some admin three levels up turned a setting off. Your error handling has to tell "your token is bad" apart from "your token is fine but you're not allowed," because the fix is completely different. You cannot enumerate the permissions you need by reading documentation. You find the gaps by hitting them in production.

## Rate limits, backoff, and pagination

Each app meters you differently. Per-minute, per-hour, per-user, per-app, sliding windows that reset on a schedule you have to reverse-engineer. Some return a `Retry-After` header and tell you exactly how long to wait. Some don't. Some just start dropping you with no signal at all. So you write a backoff strategy per service, because the one you wrote for the last service guesses wrong here.

Backoff has to be real, not decorative. Exponential delay with jitter so a fleet of retries doesn't synchronize into a thundering herd. A retry budget so you give up instead of hammering forever. And a hard distinction between retryable failures (429, 503) and terminal ones (400, 403), because retrying a terminal error is just a slower way to fail. Naive retries don't soften a rate-limit problem; they convert it into an outage.

Reading data adds pagination, and everyone does it differently: cursors, offsets, page tokens, `Link` headers. An agent asking a simple-sounding question like "what are my open PRs" is really a paginated loop you have to write, bound, and stop. None of this is an edge case you defer. The instant an agent does real volume — BuildLog reading a team's commits, PRs, and releases to draft posts — you hit limits and pages immediately. Volume is the normal case for anything useful.

## Webhooks vs. polling, and the cost of staying current

Agents often need to react to change, not just pull on demand. That forces a choice, and neither side is free. Polling is simple to write but wasteful and laggy, and it burns the rate-limit budget from the last section. Webhooks are timely but they're real infrastructure: a public endpoint that's always up, signature verification done the way each specific provider wants it, retry and duplicate handling for deliveries that arrive twice or out of order, and an event store so nothing is lost between receipt and processing. That's a small distributed system per app you subscribe to. Polling looks cheaper right up until you're polling fifty apps on intervals and eating the same budget twice. Both options are pure overhead relative to the task you actually wanted done.

## Error handling: the half nobody budgets for

Real integrations fail in ways the happy-path demo never shows. Expired tokens. Revoked scopes. Partial failures in the middle of a batch, where half the work landed and half didn't. Malformed responses. An app changing its API shape with no warning and no version bump.

An agent makes all of this worse than a normal client would, because it chains calls. One silent failure three steps back doesn't surface as an error — it surfaces as a confident, wrong final answer built on a gap nobody noticed. So your errors can't just be logged for a human to read later; they have to be legible to the model, so the agent itself can tell "try again," "ask a person," and "stop" apart.

That decision — retry, escalate, or halt — is policy, not a try/catch. It's exactly where guardrails belong: approvals and human-in-the-loop on the actions that matter, which I covered in [AI agent guardrails](/blog/ai-agent-guardrails/). And to be honest about the proportions: across Fixo and BuildLog, the auth-and-failure handling wrapped around a single call routinely dwarfs the call itself. The line that hits the API is the small part.

## The multiplication problem: N apps times ongoing maintenance

Everything above is per app. One integration is a project. Ten is a team's full-time job. And the real cost isn't N integrations sitting finished on a shelf — it's N times a surface that keeps changing underneath you. APIs deprecate endpoints. Providers rotate auth methods. Rate limits tighten. Pagination schemes change. You don't finish an integration and move on; you adopt it, and it asks for attention forever.

This is the mechanism behind stalled agent projects. A team budgets for the model and the prompt, ships the demo, then spends the rest of the quarter on token refresh and webhook retries. The interesting work starves while the plumbing eats the calendar.

The same multiplication hits the agent's own capabilities, not just your app integrations. Web search, scraping, code sandboxes, image generation, email — if the platform doesn't ship them, each one becomes its own keys, its own quirks, its own small toolchain to maintain. I wrote about that side in [the tools every platform should ship built in](/blog/agent-built-in-tools/). Same tax, different counter.

## What removes it: one OAuth, hosted

The fix isn't a better OAuth library. You can't out-engineer this with cleaner retry logic. The fix is not doing it yourself — a managed connector layer that absorbs the auth, refresh, scopes, rate limits, pagination, webhooks, and hosting so they stop being code you own.

That's what I'm building with CoreSpeed. One OAuth connects an agent to 50+ apps you already use — Gmail, Slack, Notion, GitHub, Stripe, HubSpot — instead of a key and a refresh path per service. The connector layer keeps it working as those apps change underneath it, which is the part that otherwise never ends.

To restate the framing from MCP vs. connectors without rehashing it: MCP is the wire format, the connector is the access-and-control plane behind it. You want both — the standard for how a tool is exposed, and the layer that decides which apps, under which auth, with which guardrails. Not a hand-wired stack balanced on top of a protocol.

A smart agent isn't useful until it can act, and it can't act until someone has paid the setup tax. The only question is whether you pay it once or pay it per app, forever. CoreSpeed pays it once. [corespeed.io](https://corespeed.io)
