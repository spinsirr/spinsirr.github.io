---
title: 'AI agent access and control: a field guide'
description: 'One map of the agent stack: access through one OAuth, built-in tools, memory, plain-English control, and portability across hosts — and where CoreSpeed fits.'
pubDate: 'Jun 22 2026'
---

A capable model can reason its way through almost anything you put in front of it. It can also do nothing. It can't read your Gmail, move a dollar, or pull a live page until someone wires that up by hand. The gap between "smart" and "useful" isn't intelligence. It's plumbing. And the plumbing is where most agent projects die.

I've paid this bill. Across Fixo and BuildLog I hand-wired the integrations an agent needs to act in the real world, and the pattern is always the same: OAuth per service, token refresh, rate-limit handling, a server to host it, then the same work again for the next app and the next project. I call it the setup tax. It's the cost you pay before your agent does a single useful thing, and you pay it every time.

This post is the map. Access and control are two halves of one problem, and each half has its own deep dive elsewhere on this blog. Here I'm putting the whole stack in one place so the shape is clear, then pointing at the territory. For the longer story of what I'm building, start with [building agent infrastructure](/blog/building-agent-infrastructure/) and come back.

## AI agent access and control: two halves of one problem

Access is the agent reaching out: into the apps you already use, into the open web, into a sandbox where it can run code. Control is everything that makes that reach safe to leave unattended. People obsess over the first and bolt the second on later, usually after something goes wrong. They're the same project. An agent that can act but can't be governed is a demo. An agent that can be governed but can't act is a chatbot. You need both, traveling together.

## Access, part one: one OAuth instead of a key per service

Access starts with your accounts — the apps where your work actually lives: Gmail, Slack, Notion, GitHub, Stripe, HubSpot. An agent that can't touch those is reasoning into a void.

The naive path is a key per service. N integrations means N auth flows, N sets of credentials to store, N things to rotate when they expire or leak. Each one is its own small project with its own failure modes. The alternative is one OAuth that fans out to 50+ apps, so connecting an agent to a new tool is a permission grant, not a build.

What one OAuth absorbs is the unglamorous engineering you'd otherwise own per service:

- **Consent** — the user grants access once, and the connection is established.
- **Token storage and refresh** — access tokens expire; something has to hold the refresh token and quietly renew before the next call fails.
- **Scope handling** — read-only versus write, which mailbox, which workspace, narrowed to what the agent actually needs.
- **Rate-limit backoff** — every API throttles differently, and an agent that hammers through limits gets the whole integration suspended.

None of that is specific to your product. It's the same code, written badly five times, in five repos.

Here's where the tax gets concrete. Say an agent drafts an estimate, sends it by email, and charges a card. That's three separate auth surfaces: your docs or CRM, your mail provider, your payment processor. Three consent flows, three token lifecycles, three rate limits to respect. Collapse that to one connection and the agent project becomes the work — the estimate logic, the workflow — instead of the wiring around it.

I keep this section high-level on purpose, because there's a distinction underneath it that deserves its own argument: the protocol that carries a tool call versus the infrastructure behind the call. That's [MCP vs. connectors](/blog/mcp-vs-connectors/).

## Access, part two: the protocol and the agent's own hands

People conflate two things here, so let me separate them.

MCP is the wire format. It's a standard way to hand an agent a tool — the shape of the call, the schema, how a result comes back. Connectors are the infrastructure: the auth, the hosting, the breadth of apps behind that call. It isn't MCP versus connectors, the way it's usually framed. You want the standard *and* the access plane. The protocol without the infrastructure is a well-specified call to nowhere. I make the full case in [MCP vs. connectors](/blog/mcp-vs-connectors/).

The other thing to separate is app access from built-in tools. App access is the agent reaching *your* accounts. Built-in tools are the agent's own hands — capabilities it needs no matter who the customer is or what the workflow looks like:

- **Web search** — finding current information instead of guessing from training data.
- **Web scraping** — reading a live page and pulling structure out of it.
- **Image generation** — producing a visual when the task calls for one.
- **Code sandboxes** — running code in isolation, not on your machine.
- **Email** — sending, not just drafting.

These aren't integrations into your stack. They're generic. Every agent needs roughly this set regardless of the product wrapped around it, which is exactly why they belong in the platform and not in each project. Rebuild scraping here, stand up a sandbox there, wire an image pipeline into the next repo, and you're maintaining five small toolchains that have nothing to do with what you're building. That's the setup tax again. I go deeper on the specific tools in [the built-in tools every platform should ship](/blog/agent-built-in-tools/).

A tool list, though, is inert. Handing an agent a catalog of tools doesn't make it do anything — something has to expose those tools to the model, call them, catch a failed call, and keep the agent on task across multiple steps. That something is the harness. It's the reason an agent finishes a job instead of stalling on step two and asking you what to do next. For what that loop actually does, see [the agent harness](/blog/agent-harness/).

## Memory: the difference between a tool and an assistant

Access makes an agent capable. Memory makes it worth keeping.

A stateless agent is competent and amnesiac. Every session it re-asks who a contact is, and every draft comes out in a generic voice because it has no idea how you write. You spend the first five minutes of every interaction re-explaining context it should already have. It's a tool you operate.

An agent with memory is different in kind. It remembers contacts, so it knows who you mean. It remembers your writing style, so a draft sounds like you and not like a model. It remembers past decisions, so last week's choices don't get re-litigated this week.

Memory isn't a side feature sitting next to access and control — it sharpens both. It makes access *useful*: knowing which Slack channel, which repo, which person, instead of asking. And it makes control *tighter*: a decision you already approved doesn't need approving again, so the agent stops interrupting you over settled questions.

There's a catch, and it sets up the last section. Memory that lives inside one client dies the moment you switch hosts. Everything the agent learned about you, gone, because it was never really yours — it belonged to the tool.

## Control: plain-English policy, approvals, and Agent Pay

Now the inversion. Access is the loud half, the part that demos well. But the moment an agent can send email, move money, or push to a repo, "it can act" stops being a feature and turns into a liability. Control is the quiet half, the part that makes it safe to walk away. The full treatment is in [AI agent guardrails](/blog/ai-agent-guardrails/); here's the shape.

Three concrete pieces:

- **Plain-English policy** — rules a teammate can read, not a config DSL only the author understands. "Don't email anyone outside the company without approval" should be a sentence, not a YAML block nobody audits.
- **Human-in-the-loop approvals** — the agent proposes, you confirm. Routine flows run on their own; risky ones wait for a human. The agent doesn't have to choose between "do nothing" and "do everything."
- **Agent Pay** — spending limits and budgets, so the worst case is a capped loss and not an empty account. An agent with a card needs a ceiling.

A demo runs once, watched, on a happy path you chose. Production runs unattended, on inputs you didn't plan for, with consequences that don't undo. Access without control is fine in a demo and reckless in production, and the difference is precisely whether anyone is watching when the agent does something you didn't expect.

Fixo makes this concrete. The agent diagnoses a car fault, writes the estimate, and drives Stripe payments. That last step is money moving in the real world, on inputs that vary customer to customer. It's exactly the kind of action where approvals and spending limits stop being optional. You don't ship an agent that charges cards and hope. You give it a budget and a confirmation step, and then you can leave it running.

## Portability: the agent is the investment, the host is rented

I run agents in Claude Code, Codex, and Cursor, picking the host by the task. The host changes constantly. The agent shouldn't. But most setups bolt the agent to the client, so switching hosts means redoing the work — which means people don't switch, even when another host clearly fits the job better. The full argument is in [agent portability](/blog/agent-portability/).

What should travel with the agent, not the client, is exactly where the prior four sections converge:

- **Apps** — one connection that moves with you, not fresh OAuth wiring per host.
- **Memory** — contacts, decisions, and style, intact across clients.
- **Voice** — it sounds like you everywhere, because the style memory came along.
- **Policy** — rules, approvals, and limits stay enforced no matter where it runs.

When all of that lives inside one client, a new host means new OAuth, new keys, new policy config, and reteaching your style from scratch. That's the setup tax billed again, in full, just for moving. Portability flips it: pick the host for the task, keep the agent. Access, memory, and control are only durable if they're portable.

## Putting it together — and where CoreSpeed fits

The field guide is one stack, not a feature list. Read top to bottom:

- **Access** — one OAuth across 50+ apps, plus MCP as the standard interface, plus the built-in tools every agent needs.
- **Memory** — contacts, style, past decisions, so you stop re-explaining yourself.
- **Control** — plain-English policy, human-in-the-loop approvals, and Agent Pay budgets.
- **Portability** — all of the above traveling with the agent across hosts.

Each piece removes one slice of the setup tax. None of them is the whole answer alone.

CoreSpeed is the access and control layer for AI agents. The framing is plain: your agent is smart, now give it access. I'm building this layer because I got tired of paying the tax by hand — wiring OAuth per service, rebuilding the same tools per repo, bolting on approvals after the fact, and losing all of it the moment I switched clients. This is builder-to-builder, not a pitch.

The bet underneath the whole thing: give an agent real access, real memory, and real control, and it stops being a demo and starts being infrastructure you can leave running. That's the difference between something you show and something you depend on. The longer version is in [building agent infrastructure](/blog/building-agent-infrastructure/).

[corespeed.io](https://corespeed.io)
