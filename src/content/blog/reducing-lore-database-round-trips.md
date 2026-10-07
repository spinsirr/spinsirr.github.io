---
title: 'Reducing Lore’s database round trips'
description: 'How Lore moved admission into a request’s transaction and batched database work, plus the Worker path that still needs measurement.'
pubDate: 'Oct 05 2026'
kind: field-note
tags: ['Postgres', 'Memory systems', 'Performance']
featured: false
draft: false
ogImage: '/blog/lore-db-round-trips/cover.png'
---

Lore used to send many database statements one after another for a single request. A typical memory read took 11–12 network waits, while a keyed memory write took 15–20. With a database connection behind a network proxy, those waits can dominate the request even when each query is quick. These are [statement and wait counts from Lore’s database-wave specification](https://github.com/corespeed-io/lore/blob/55a1439dbf4c5abe5c6a6646327c72aa2e1bab51/docs/research/lore-core-db-wave-spec.md), not a production latency benchmark.

The [merged database wave](https://github.com/corespeed-io/lore/pull/135) tackled the transaction shape first. The request’s identity and workspace admission now run at the start of its business transaction. The database adapter can send independent statements as a batch, then wait once for the results. The application still performs the authorization checks and reads through row-level security; fewer waits do not mean skipping either one.


<figure class="post-sketch">
  <img src="/blog/reducing-lore-database-round-trips/hand-drawn.webp" width="1400" height="933" loading="lazy" alt="Individual database messages compared with two tidy bundled crossings." />
  <figcaption>A sketch of statement batching: fewer network waits, with statements still executed.</figcaption>
</figure>
<figure class="post-flow">
  <ol aria-label="Database request sequence">
    <li><strong>Admit in transaction</strong><span>Identity and workspace checks start the business transaction.</span></li>
    <li><strong>Batch independent SQL</strong><span>The adapter sends statements together where possible.</span></li>
    <li><strong>Wait for results</strong><span>Reads need one wait on a pipelined connection; dependent writes need two.</span></li>
  </ol>
  <figcaption>Flowchart: Database request sequence. The article text and linked evidence explain the boundaries in detail.</figcaption>
</figure>

## What one wait means

The round-trip tests count a wait whenever a statement goes out while nothing else is in flight. They run the real OSS database adapter over a test PostgreSQL session, with only the socket replaced to count statements and waits. On a pipelined Bun or self-hosted connection, a human memory read now sends six statements in **one network wait**. A keyed memory creation sends 13 statements in **two waits**. The write needs a second batch because its final response and replay record depend on the result of the first batch. [The test pins both budgets](https://github.com/corespeed-io/lore/blob/55a1439dbf4c5abe5c6a6646327c72aa2e1bab51/tests/server/round-trip-budget.test.ts).

<picture>
  <source media="(max-width: 600px)" srcset="/blog/lore-db-round-trips/read-waits-mobile.png">
  <img src="/blog/lore-db-round-trips/read-waits.png" alt="Bars comparing Lore memory-read network waits: 11–12 before the database wave, one with pipelining on Bun or self-host, and six in a Worker with pipelining disabled.">
</picture>

The figure shows the memory-read path. It uses the [previous count and the as-built counts](https://github.com/corespeed-io/lore/blob/55a1439dbf4c5abe5c6a6646327c72aa2e1bab51/docs/research/lore-core-db-wave-spec.md#5-statement-and-wait-budgets). The old range is shown at its lower bound; its upper bound is marked separately.

## Keep the result of a write tied to that write

Batching makes a subtle race visible. A caller can lose write authority between the first locking read and the later update. Re-reading the memory afterward cannot reliably tell whether that update happened: the same policy may now hide the row. Lore’s write statement therefore records its outcome in a transaction-local setting. The idempotency ledger builds the replay response from that outcome inside the transaction. A replay cannot report that a write happened when the write matched no row. The [as-built design](https://github.com/corespeed-io/lore/blob/55a1439dbf4c5abe5c6a6646327c72aa2e1bab51/docs/research/lore-core-db-wave-spec.md#43a-as-built-pr-1b) describes this case and the two-batch write path.

The same wave also stops rewriting unchanged memory content, chunks, and embeddings. A PATCH that changes nothing keeps its version, update time, and ETag, and produces no event or job. That matters for write load as much as the network schedule does. The [merged PR records the behavior and its exceptions](https://github.com/corespeed-io/lore/pull/135).

## The Worker result is different

Pipelining is enabled for Bun and self-hosted connections. It remains **off for Cloudflare Workers** until the team tests correctness and latency through a real Hyperdrive binding. A Worker memory read now takes six statements and six waits, down from the earlier 11–12 waits, rather than the single wait measured with pipelining on. The [spec marks Hyperdrive verification and the proposed SQL write functions as unfinished](https://github.com/corespeed-io/lore/blob/55a1439dbf4c5abe5c6a6646327c72aa2e1bab51/docs/research/lore-core-db-wave-spec.md#92-hyperdrive-verification-in-pr-1-before-pr-3-is-decided).

The useful result today is a smaller, tested network budget for the paths whose adapter can pipeline, plus fewer statements on Workers. The missing result is a real Hyperdrive latency measurement. It will decide whether the current two-batch writes are fast enough there or whether moving those writes into SQL functions is justified.
