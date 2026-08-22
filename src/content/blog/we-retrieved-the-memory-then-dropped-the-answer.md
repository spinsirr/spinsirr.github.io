---
title: 'We retrieved the memory, then dropped the answer'
description: 'A 200-question conflict run scored 0.800 at the parent-Memory boundary and 0.635 at the evidence boundary. The gap was in what reached the reader.'
pubDate: 'Aug 22 2026'
ogImage: '/blog/we-retrieved-the-memory-then-dropped-the-answer/cover.png'
---

![A retrieved memory losing its answer before the reader](/blog/we-retrieved-the-memory-then-dropped-the-answer/cover.png)

We scored one 200-question Conflict run at two different boundaries. The numbers disagreed by 16.5 points.

At the parent-Memory boundary, Recall@10 was **0.800**. At the exact answer-evidence boundary, it was **0.635**.

Same queries. Same retrieval profile. Same run.

The first score asked whether search found the right record. The second asked whether the answer-bearing passage from that record actually survived chunk selection and reached the reader. We had been treating those as the same event. They were not.

## The number was right at the wrong boundary

In [Lore](https://github.com/corespeed-io/lore), a Memory is the authorized record. Retrieval ranks candidate Memories and their chunks, then a later stage assembles a bounded evidence packet for the model.

That separation matters. A parent hit can be legitimate while the final evidence packet contains the wrong passage from the right Memory. If the evaluator stops at the parent ID, the run looks successful even though the reader never sees the fact it needs.

![Parent-Memory recall and exact-evidence recall diverge under the old evidence policy](/blog/we-retrieved-the-memory-then-dropped-the-answer/evidence-boundary.png)

*The old metric recorded the parent hit before the evidence packet was assembled.*

This is not an exotic retrieval failure. It is a measurement-boundary failure. The system found the right container, then lost the answer while deciding what to include from it.

## What we actually ran

The workload was the two-source, 200-question Conflict slice from [MemoryAgentBench](https://openreview.net/forum?id=DT7JyQC3MR). Each question required the current answer from Memories containing competing or outdated facts. We audited the literal answer fact inside the returned evidence, not just the ID of the Memory that contained it.

Candidate generation used lexical and dense retrieval combined with reciprocal rank fusion. On top of that profile we tested recency fusion, one feedback query, and a fixed evidence budget. The run also used an experimental structured-list chunking profile; that chunking scheme is not the current release benchmark.

The exact configuration is less important than the invariant: score the object that the next stage actually consumes.

![The four boundaries from candidate retrieval to the generated answer](/blog/we-retrieved-the-memory-then-dropped-the-answer/retrieval-boundaries.png)

*This ablation measured candidate retrieval and assembled evidence. It did not run the final answer-generation protocol.*

## The answer disappeared during evidence assembly

The failing case was straightforward. Retrieval found the correct parent Memory, but bounded chunk selection kept a nearby passage and omitted the answer-bearing one. Parent-Memory Recall@10 still counted the query as a hit. Exact-evidence Recall@10 did not.

The fix was equally specific. When a small Memory fits inside the explicit evidence budget, Lore now returns the whole Memory instead of pretending that one selected chunk is a complete representation of it. Authorization does not change, the budget stays bounded, and large Memories still use chunk selection.

With only that evidence-policy change, exact-evidence Recall@10 rose from **0.635 to 0.800**. Evidence MRR moved from **0.3697 to 0.4370**. Average search latency was effectively unchanged: **179 ms to 178 ms**.

The parent score did not improve. It did not need to. The missing 16.5 points were downstream of retrieval.

## A reranker helped one workload and hurt this one

We also tested [Qwen3-Reranker-0.6B](https://huggingface.co/Qwen/Qwen3-Reranker-0.6B). On a separate 100-question Accurate Retrieval workload, it did what a reranker is supposed to do: Recall@1 moved from **0.72 to 0.89**, and MRR from **0.8299 to 0.9375**.

On Conflict, the same model moved in the other direction. Exact-evidence Recall@10 fell from **0.800 to 0.755**, and MRR from **0.4370 to 0.3948**. The result was not a contradiction. The two workloads rewarded different things. Generic query-passage similarity helped precise lookup; it was less useful when the corpus required separating current facts from conflicting ones and preserving the right evidence around them.

![The same reranker improves Accurate Retrieval and degrades Conflict retrieval](/blog/we-retrieved-the-memory-then-dropped-the-answer/reranker-two-workloads.png)

*Each panel should be read against its own baseline; the two workloads use different retrieval profiles.*

Reranking is a stage to calibrate per workload, not a universal quality switch.

## Making reranking cheaper did not make it correct

The first Conflict reranker run sent expanded reader evidence into the cross-encoder. Across the benchmark, that was **2,507,822 input characters** and **1,529 ms** average search latency.

We then tightened the contract: score only the best authorized chunk plus configured neighbors, while keeping wider evidence available to the reader after ranking. Reranker input fell to **747,160 characters**, and latency fell to **930 ms**.

That was the right production boundary, but not a quality win on this workload. Conflict exact-evidence Recall@10 fell again, from **0.755 to 0.720**; MRR fell to **0.3686**.

![Compact reranker input reduces size and latency while Conflict recall remains lower](/blog/we-retrieved-the-memory-then-dropped-the-answer/compact-reranker-contract.png)

*Compact scoring fixed the input contract. It did not rescue a reranker that was mismatched to the Conflict profile.*

## What changed in how we evaluate retrieval

We now report parent-Memory recall and exact-evidence recall separately. The first tells us whether candidate retrieval reached the right authorized record. The second tells us whether the reader received the answer-bearing evidence after chunk selection and assembly.

Those metrics diagnose different stages. Collapsing them hides bugs precisely where retrieval systems become products: at the boundary between a ranked result and the context actually handed to a model.

It also changes how we read ablations. A reranker can improve an early ranking metric while harming the evidence packet. A cheaper input contract can be operationally correct while still lowering retrieval quality. A second feedback hop can add latency without adding useful recall. None of those results fit into a single "retrieval got better" number.

The practical rule is simple: pin the evidence policy, score the final evidence object, and treat every new retrieval stage as workload-specific until measured otherwise.

## Scope

These numbers are from a historical local ablation recorded before Lore's current generation-scoped validator. They compare retrieval and evidence policies inside Lore; they do not run MemoryAgentBench's complete answer-evaluation protocol.

So this is not a Lore release score, an end-answer score, a SOTA claim, or a recommended context budget. It is a narrow result about where a retrieval metric can stop too early.

The full experimental notes, including the exact profiles and caveats, are [pinned to the Lore commit used for this analysis](https://github.com/corespeed-io/lore/blob/f422692f5143f0295663d913eefece804a3ee551/docs/research/local-reranker-apple-silicon.md#the-conflict-workload).

Discussion: [the original X article](https://x.com/zhao_spenc/status/2088447987471339644).

## References

1. Cormack, Clarke, and Büttcher. [Reciprocal rank fusion outperforms Condorcet and individual rank learning methods](https://doi.org/10.1145/1571941.1572114). SIGIR 2009.
2. Hu et al. [MemoryAgentBench: Evaluating memory in LLM agents via incremental multi-turn interactions](https://openreview.net/forum?id=DT7JyQC3MR).
3. Zhang et al. [Qwen3 Embedding: Advancing text embedding and reranking through foundation models](https://arxiv.org/abs/2506.05176).
