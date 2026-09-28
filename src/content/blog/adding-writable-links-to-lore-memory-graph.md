---
title: 'Adding writable links to Lore’s memory graph'
description: 'How Lore made memory links editable without letting graph writes bypass visibility, grow without bounds, or make partial reads look complete.'
pubDate: 'Sep 28 2026'
kind: field-note
tags: ['Memory systems', 'Postgres', 'API design']
featured: false
draft: false
ogImage: '/blog/adding-writable-links-to-lore-memory-graph/cover.png'
---

![A writable memory link requires a writable source and a visible target; a capped graph read reports lower-bound counts](/blog/adding-writable-links-to-lore-memory-graph/figure.svg)

*A link write checks both endpoints. A capped graph read reports that its counts are incomplete.*

A graph in a memory product is easy to draw when its edges only arrive through import. It gets harder when a user or agent can add a link after both memories already exist. A link is then a write to shared state: it needs an identity, authorization, retry behavior, and a budget. Its read path also needs to admit when the graph is incomplete.

We added those operations to [Lore](https://github.com/corespeed-io/lore) in [PR #129](https://github.com/corespeed-io/lore/pull/129). The change exposes link creation, listing, and deletion through the HTTP API, TypeScript SDK, CLI, and MCP. The most interesting part was deciding what each operation means when memories can be private and agents have different grants.

## Give the edge a stable identity

A link is identified by **source memory, target memory, and kind**. For example, a decision can `support` an evidence memory. The reverse direction is a different link, and another kind between the same pair is another link too.

The [HTTP write](https://github.com/corespeed-io/lore/blob/f1e60b5135b99de2fab85ccae3e9002f2d4b161f/src/modules/graph/routes.ts) is a `PUT` to `/api/v1/memories/{source}/links/{target}?kind=supports`. The first call creates the link and returns 201; another call to the same key replaces its weight and metadata and returns 200. An unchanged repeat does no write and emits no link event. Omitting weight or metadata resets them to their defaults, because this is a replacement of the link's fields, not a patch.

That gives callers a simple retry rule: repeat the `PUT` for the desired state. Deletion addresses the same key. A second `DELETE` returns 404 because the link is already absent. The [SDK example](https://github.com/corespeed-io/lore/blob/f1e60b5135b99de2fab85ccae3e9002f2d4b161f/docs/developer-integration.md#working-with-memory-links) shows both operations and the distinction between a missing endpoint and a capacity refusal.

The route refuses unknown or repeated query parameters. That sounds small until a client misspells `kind` on a deletion: silently falling back to the default kind would delete a different edge. [The PR tests that boundary](https://github.com/corespeed-io/lore/pull/129).

## Let the database enforce who may connect what

The writer must be allowed to edit the source memory and see the target memory. A caller who cannot edit the source, cannot see the target, or names a missing endpoint gets the same 404 response. That prevents the API from becoming a way to probe for private memories.

The [graph engine](https://github.com/corespeed-io/lore/blob/f1e60b5135b99de2fab85ccae3e9002f2d4b161f/packages/lore-core/src/graph.ts) locks the source row with `FOR NO KEY UPDATE` and reads the target under the host's row-level security policy. The source lock also serializes competing writes from that source. An insert uses the natural key's unique constraint; if another transaction inserted the link first, the code re-reads and replaces it rather than surfacing a conflict as a server error. The [Postgres smoke test](https://github.com/corespeed-io/lore/blob/f1e60b5135b99de2fab85ccae3e9002f2d4b161f/scripts/checks/smoke-memory-core.ts) forces two writes to meet and checks that exactly one creates the link.

An inbound list raises a related privacy question: a visible target might have an edge from a source the caller cannot see. Lore lists a link only when **both** endpoints are visible. The [authorization tests](https://github.com/corespeed-io/lore/blob/f1e60b5135b99de2fab85ccae3e9002f2d4b161f/tests/server/memory-link-authorization.test.ts) cover cross-workspace links, private targets, revoked grants, and links hidden after an endpoint changes visibility.

## Bound the writes and tell the truth about reads

An editable graph can grow faster than an import-only graph. Lore now limits new links to 16 kinds per directed pair, 1,000 links from one source, 1,000 links into one target from one owner's memories, and 50,000 links from one owner in a workspace. Replacing an existing link does not consume another slot. The owner-scoped counts keep one member from spending another member's quota; the limits and the 409 capacity response are in the [public implementation](https://github.com/corespeed-io/lore/blob/f1e60b5135b99de2fab85ccae3e9002f2d4b161f/packages/lore-core/src/graph.ts).

The graph read has a separate 40,000-link budget. If it cuts durable links, the response sets `linksTruncated`. The UI then shows link-derived counts as lower bounds and stops calling a memory isolated merely because no edge appeared in the partial result. The cut rotates across source owners, keeping a prolific owner from crowding everyone else out of the returned graph. [The PR describes the read behavior and its tests](https://github.com/corespeed-io/lore/pull/129).

These budgets still have trade-offs. Several owners can collectively produce more links than one export archive accepts. Concurrent writes from different sources owned by the same person can overshoot the target or owner count; the source and pair counts remain exact. Those limits are [documented in the merged PR](https://github.com/corespeed-io/lore/pull/129), rather than treated as properties the implementation cannot guarantee.

The lesson from this change is that an editable edge is a domain object. Its key makes retries predictable; database visibility decides who may create or discover it; and a truncated graph must say that its counts are incomplete. The drawing is the last part.
