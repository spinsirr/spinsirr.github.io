---
title: 'How Lore restored indexed search under PostgreSQL RLS'
description: 'A Lore search change split indexed candidate discovery from the caller’s authorized read, then checked that the results stayed identical.'
pubDate: 'Oct 07 2026'
kind: field-note
tags: ['Postgres', 'Architecture', 'Performance']
featured: false
draft: false
ogImage: '/blog/lore-rls-indexed-search/cover.png'
---

Lore’s earlier [database-wave work](https://github.com/corespeed-io/lore/pull/135) reduced the number of network waits in a memory request. A different bottleneck remained inside PostgreSQL: lexical search could scan visible chunks even though the search columns had GIN indexes. In a same-database benchmark with 76,000 chunks, the old lexical-only search had a **10.7-second median**. The [merged search change](https://github.com/corespeed-io/lore/pull/146) brought that median to **128 milliseconds**. Those are local PostgreSQL 18 measurements from the PR, not production request latency.

<figure class="lexical-sketch">
  <img src="/blog/lore-rls-indexed-search/hand-drawn-search.webp" width="1400" height="933" loading="lazy" alt="Hand-drawn card catalog, sieve, and locked gate illustrating indexed candidate selection followed by an authorization check." />
  <figcaption>A visual metaphor for the two boundaries in this search path. The exact query stages appear in the flowchart below.</figcaption>
</figure>

## Why an index was not enough

Lore uses PostgreSQL row-level security (RLS) to decide which memories a caller may read. Its lexical channels search text vectors, entity aliases, and CJK grams with operators including `@@`, `@>`, and `LIKE`. Under this RLS policy, PostgreSQL could not push the relevant non-leakproof predicates into the index scans. It instead applied the policy while scanning the workspace’s visible chunks. [The PR documents the plans and comparison](https://github.com/corespeed-io/lore/pull/146).

The architecture problem was therefore about where candidate discovery happens. Making the query shorter would not make an index condition usable under the same security context. Removing RLS from the whole search path would change the authorization boundary.

## Split candidate discovery from result visibility

The change added a narrowly scoped [`lore.lexical_candidates` function](https://github.com/corespeed-io/lore/blob/9c6f2abeaab1fd2dc876d6910a2a8aae809f4159/db/migrations/0012_lexical_candidates.sql). It runs as a security definer, applies the equivalent workspace and actor visibility predicate, and returns **chunk IDs and per-channel ranks**, not memory content. Four workspace-leading GIN indexes support the lexical channels, including an expression index for CJK grams. [Their definitions are in the next migration](https://github.com/corespeed-io/lore/blob/9c6f2abeaab1fd2dc876d6910a2a8aae809f4159/db/migrations/0013_index_lexical_channels_concurrently.sql).

<figure class="lexical-search-figure">
  <ol aria-label="Lore lexical search stages">
    <li><span class="step-number">01</span><div><strong>Indexed candidate search</strong><span>Definer function applies the visibility predicate across lexical channels.</span></div><code>GIN → IDs + ranks</code></li>
    <li><span class="step-number">02</span><div><strong>Authorized readback</strong><span>Engine joins chunks and memories under the caller’s RLS policy.</span></div><code>IDs → visible rows</code></li>
    <li><span class="step-number">03</span><div><strong>Rank fusion</strong><span>Only rows returned by the authorized read enter reciprocal-rank fusion.</span></div><code>visible rows → results</code></li>
  </ol>
  <figcaption>Flowchart: candidate discovery can use the indexes; the caller’s RLS read still decides which rows become search results. The stages follow the merged <a href="https://github.com/corespeed-io/lore/blob/9c6f2abeaab1fd2dc876d6910a2a8aae809f4159/packages/lore-core/src/memory.ts">engine query</a>.</figcaption>
</figure>

The readback is a real boundary, not just a comment on the function. Before rank fusion, the engine joins candidate IDs back to `memory_chunks` and `memories` under the caller’s RLS context. A [test substitutes an over-answering candidate function](https://github.com/corespeed-io/lore/blob/9c6f2abeaab1fd2dc876d6910a2a8aae809f4159/tests/server/lexical-candidates.test.ts) and checks that the extra row does not appear in the final result.

That readback does not make arbitrary definer code safe. The function also needs its own admission check because it executes with elevated privileges. The migration pins its `search_path`, qualifies its base tables, and grants execution only to the application role. The tests cover missing actor context, revoked access, function grants, and temporary-relation shadowing. These details keep the candidate stage within the intended authorization contract. [The migration and security tests show the checks](https://github.com/corespeed-io/lore/blob/9c6f2abeaab1fd2dc876d6910a2a8aae809f4159/tests/server/lexical-candidates.test.ts).

## Measure speed and equivalence together

The [PR’s same-database comparison](https://github.com/corespeed-io/lore/pull/146) ran lexical-only queries on PostgreSQL 18. At 76,000 chunks, median time fell from 10.7 seconds to 128 milliseconds; the slowest 5% went from 15.2 seconds to 336 milliseconds. A smaller 1,500-memory case went from 99 to 31 milliseconds median. Across 80 queries and 780 returned rows, the comparison reported identical memory IDs, scores to 12 decimal places, and evidence.

The result has limits. The worst measured large-dataset query still took 483 milliseconds, and this change did not address dense vector search or its separate RLS and HNSW questions. It shows that a faster candidate stage can preserve the existing result contract when the elevated function, caller-policy readback, and equivalence tests are designed together.
