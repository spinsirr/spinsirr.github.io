---
title: 'Adding writable links to Lore’s memory graph'
description: 'How Lore made memory links editable without letting graph writes bypass visibility, grow without bounds, or make partial reads look complete.'
pubDate: 'Sep 28 2026'
kind: field-note
tags: ['Memory systems', 'Postgres', 'API design']
featured: false
draft: false
ogImage: '/blog/adding-writable-links-to-lore-memory-graph/put-outcomes-cover.png'
---

Before [Lore PR #129](https://github.com/corespeed-io/lore/pull/129), Workspace import could write Memory Links, but users and agents could not add one between existing memories. Exposing that write required a stable key, permission checks on both endpoints, and limits on link creation and graph reads.

The merged change exposes link creation, listing, and deletion through the HTTP API, TypeScript SDK, CLI, and MCP. The permission checks matter because a source memory may be read-only to the caller, and a target may be private.


<figure class="post-sketch">
  <img src="/blog/adding-writable-links-to-lore-memory-graph/hand-drawn.webp" width="1400" height="933" loading="lazy" alt="Two memory cards tied together beside a lock and a bounded stack of related cards." />
  <figcaption>A conceptual sketch of a writable Memory Link and its permission boundary.</figcaption>
</figure>
<figure class="post-flow">
  <ol aria-label="Memory Link write and read path">
    <li><strong>Name the edge</strong><span>Source, target, and kind form one stable key.</span></li>
    <li><strong>Check both ends</strong><span>The caller needs the required access to each memory.</span></li>
    <li><strong>Write or read within limits</strong><span>Replacement writes and bounded graph reads preserve the contract.</span></li>
  </ol>
  <figcaption>Flowchart: Memory Link write and read path. The article text and linked evidence explain the boundaries in detail.</figcaption>
</figure>

## Give the edge a stable identity

A link is identified by **source memory, target memory, and kind**. For example, a decision can have a `supports` link to an evidence memory. The reverse direction is a different link, and another kind between the same pair is another link too.

The [HTTP write](https://github.com/corespeed-io/lore/blob/f1e60b5135b99de2fab85ccae3e9002f2d4b161f/src/modules/graph/routes.ts) is a `PUT` to `/api/v1/memories/{source}/links/{target}?kind=supports`. The first call creates the link and returns 201; another call to the same key replaces its weight and metadata and returns 200. An unchanged repeat does no write and emits no link event. Omitting weight or metadata resets them to their defaults, because this is a replacement of the link's fields, not a patch.

<figure class="memory-link-figure" aria-label="Three PUT calls to the same Memory Link">
  <div class="link-endpoints">
    <div class="link-memory"><span class="link-role">Source memory</span><strong>Decision</strong><span>Caller can edit</span></div>
    <div class="link-direction"><code>supports</code><span aria-hidden="true"></span></div>
    <div class="link-memory"><span class="link-role">Target memory</span><strong>Evidence</strong><span>Caller can see</span></div>
  </div>
  <div class="link-key"><span>Same link key</span><code>(source, target, supports)</code></div>
  <div class="link-sequence-title">Three PUTs to this link</div>
  <ol class="link-writes" aria-label="Sequential PUT requests">
    <li><span class="link-request">1. Create the link</span><code>weight = 0.8</code><span class="link-result"><strong>201</strong> Created</span></li>
    <li><span class="link-request">2. Change its weight</span><code>weight = 0.9</code><span class="link-result"><strong>200</strong> Replaced</span></li>
    <li><span class="link-request">3. Repeat that PUT</span><code>weight = 0.9</code><span class="link-result"><strong>200</strong> No write</span></li>
  </ol>
  <figcaption>Example values; other fields stay the same. Repeating the stored state performs no write. <a href="https://github.com/corespeed-io/lore/blob/f1e60b5135b99de2fab85ccae3e9002f2d4b161f/packages/lore-core/src/graph.ts">Source: Lore’s graph engine</a>.</figcaption>
</figure>

That gives callers a simple retry rule: repeat the `PUT` for the desired state. Deletion addresses the same key. A second `DELETE` returns 404 because the link is already absent. The [SDK example](https://github.com/corespeed-io/lore/blob/f1e60b5135b99de2fab85ccae3e9002f2d4b161f/docs/developer-integration.md#working-with-memory-links) shows both operations and the distinction between a missing endpoint and a capacity refusal.

The route refuses unknown or repeated query parameters. If a client misspells `kind` on a deletion, falling back to the default kind would delete a different edge. [The PR tests that case](https://github.com/corespeed-io/lore/pull/129).

## Let the database enforce who may connect what

The writer must be allowed to edit the source memory and see the target memory. A caller who cannot edit the source, cannot see the target, or names a missing endpoint gets the same 404 response. That prevents the API from becoming a way to probe for private memories.

The [graph engine](https://github.com/corespeed-io/lore/blob/f1e60b5135b99de2fab85ccae3e9002f2d4b161f/packages/lore-core/src/graph.ts) locks the source row with `FOR NO KEY UPDATE` and reads the target under the host's row-level security policy. The source lock also serializes competing writes from that source. An insert uses the natural key's unique constraint; if another transaction inserted the link first, the code re-reads and replaces it rather than surfacing a conflict as a server error. The [Postgres smoke test](https://github.com/corespeed-io/lore/blob/f1e60b5135b99de2fab85ccae3e9002f2d4b161f/scripts/checks/smoke-memory-core.ts) forces two writes to meet and checks that exactly one creates the link.

An inbound list raises a related privacy question: a visible target might have an edge from a source the caller cannot see. Lore lists a link only when **both** endpoints are visible. The [authorization tests](https://github.com/corespeed-io/lore/blob/f1e60b5135b99de2fab85ccae3e9002f2d4b161f/tests/server/memory-link-authorization.test.ts) cover cross-workspace links, private targets, revoked grants, and links hidden after an endpoint changes visibility.

## Bound new links and mark partial graph reads

Lore limits new links to 16 kinds per directed pair, 1,000 links from one source, 1,000 links into one target from one owner's memories, and 50,000 links from one owner in a workspace. Replacing an existing link does not consume another slot. The owner-scoped counts keep one member from spending another member's quota; the limits and the 409 capacity response are in the [public implementation](https://github.com/corespeed-io/lore/blob/f1e60b5135b99de2fab85ccae3e9002f2d4b161f/packages/lore-core/src/graph.ts).

The graph read has a separate 40,000-link budget. If it cuts durable links, the response sets `linksTruncated`. The UI then shows link-derived counts as lower bounds and stops calling a memory isolated merely because no edge appeared in the partial result. The cut rotates across source owners, keeping a prolific owner from crowding everyone else out of the returned graph. [The PR describes the read behavior and its tests](https://github.com/corespeed-io/lore/pull/129).

Several owners can collectively produce more links than one export archive accepts. Concurrent writes from different sources owned by the same person can overshoot the target or owner count; the source and pair counts remain exact. The [merged PR documents both limitations](https://github.com/corespeed-io/lore/pull/129).

The natural key lets clients retry a `PUT`. The database decides which links a caller may write or see. A graph response marks when its link-derived counts are only lower bounds.
