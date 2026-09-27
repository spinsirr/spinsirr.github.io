---
title: 'Why we do not extract facts by default'
description: 'A 500-question memory experiment cut reader input tenfold but lost 6.4 points of answer accuracy. The missing details were gone before retrieval.'
pubDate: 'Sep 27 2026'
kind: research
tags: ['Memory systems', 'Evaluation', 'LongMemEval']
featured: false
series:
  slug: 'memory-systems'
  title: 'Memory systems'
  order: 3
ogImage: '/blog/why-we-do-not-extract-facts-by-default/cover.png'
---

An agent cannot remember a detail that its memory system discarded on the way in. That sounds obvious, but a successful retrieval score can hide the loss: search finds the right record, and the record no longer contains the answer.

We tested that boundary in [Lore](https://github.com/corespeed-io/lore). We made a compact fact sheet from each conversation session in a [500-question LongMemEval-S run](https://github.com/xiaowu0162/LongMemEval), then compared answers from those fact sheets with answers from the original sessions. The smaller representation saved roughly 90% of the reader's input tokens. It also lowered answer accuracy by **6.4 percentage points**. Our [earlier article](/blog/how-we-took-longmemeval-from-80-to-94-without-touching-retrieval/) covered improvements to the reader; this article looks at what happens when the source is compressed before search.

![Two representations of the same conversation workload: original sessions scored 94.2% at about 28,000 reader tokens per question; extracted fact sheets scored 87.8% at about 2,800](/blog/why-we-do-not-extract-facts-by-default/cover.png)

*Figure 1. The measured tradeoff. These are end-to-end answer scores, not retrieval scores.*

## What we actually changed

The [experiment](https://github.com/corespeed-io/lore/commit/4976fa162a29e9a082a1f53f3276f86c622b164b) used the official cleaned LongMemEval-S split. Each of the 500 questions had its own isolated workspace. The original corpus held the conversation sessions. For the alternative corpus, an extractor distilled each session into **one compact fact-sheet Memory** and indexed that derived record in a separate benchmark partition. This tested a particular compression method, not every possible fact-extraction design.

We kept the retrieval algorithm, reader, and judging protocol fixed across the comparison. The reader used instructions selected from the benchmark's question type. The judge used the official upstream prompts. The corpus representation changed, so the indexed text and embeddings necessarily changed with it. The extractor also passed through original content when a provider block prevented extraction; it did not silently drop those sessions.

| Evidence given to the reader | Answer accuracy | Reader input per question | Retrieval recall@10 |
| --- | ---: | ---: | ---: |
| Original sessions, top 10 | **94.2%** | ~28k tokens | 98.98% |
| Extracted fact sheets, top 10 | **87.8%** | ~2.8k tokens | 98.69% |

The reader consumed about one tenth as much text. It answered 32 fewer of the 500 questions correctly. Yet recall@10 moved by only 0.29 points.

## Why the retrieval score barely moved

The evaluation's retrieval target was the answer-bearing **session**. A fact sheet retained its source session's identity, so search could return the correct derived record even when extraction had removed a detail inside it. Session-level recall answers “did we find the right conversation?” It cannot answer “does the text handed to the reader still contain the needed fact?”

![Session-level retrieval stayed near 99%, while answer accuracy fell after the source was compressed into a fact sheet](/blog/why-we-do-not-extract-facts-by-default/retrieval-vs-answer.png)

*Figure 2. Session-level retrieval barely changed, while answer accuracy fell. The bottom row isolates questions about earlier assistant replies.*

The clearest category was questions about what the **assistant** had said in an earlier session. The original-session run scored **100%**; the fact-sheet run scored **73.2%**. The [earlier analysis of the same run](/blog/how-we-took-longmemeval-from-80-to-94-without-touching-retrieval/) also found losses in questions that required combining details across sessions. A compact sheet may preserve a topic or decision while omitting a name, qualifier, count, or the speaker responsible for a statement. Once that happens, a better search query cannot recover the omitted text from the fact sheet.

We saw a related boundary in a [separate conflict-retrieval study](/blog/we-retrieved-the-memory-then-dropped-the-answer/): finding the right parent Memory did not guarantee that its answer-bearing passage reached the reader. Here the loss happened earlier, during creation of the indexed representation. Both results are reasons to score the **evidence the answer model actually receives**, alongside record-level recall.

## The tenfold saving is real

The fact-sheet profile is useful if a smaller prompt matters more than the questions it misses. It scored 87.8% at about 2.8k reader tokens per question. Feeding five original sessions instead of ten scored 90.2% at roughly 14k tokens. Ten sessions reached 94.2% at roughly 28k. Those are distinct cost and quality points, and an application with a tight context budget might reasonably choose the first one.

Our choice for Lore is about the **default and the source of truth**. An automatically produced summary is a derived view. If it replaces the only durable copy of a conversation, every future question is limited by what the extractor predicted would matter. The extractor has to make that prediction before it knows the question.

Lore therefore treats a canonical [Memory](https://github.com/corespeed-io/lore/blob/main/docs/CONTEXT.md) as an intentional knowledge record. Interaction messages and document fragments can be retained as immutable Observations. An authorized actor can write a Memory directly, or submit a proposed Memory for its owner to review. A proposal is not searchable canonical Memory until accepted. This gives the system a place for compact, reusable knowledge without asking an automatic extractor to decide, for every conversation, what may safely be forgotten.

## What this experiment does and does not establish

The 6.4-point gap belongs to this dataset, this fact-sheet extractor, and this reader configuration. The headline 94.2% source-session run used question-type instructions; a separate source-session run with one static prompt scored **93.8%**. We did not run a matched static-prompt fact-sheet comparison, a stronger extractor sweep, or a product-usage study. The result does not show that all extraction is harmful. It shows that a large token saving came with a measurable answer loss in a controlled version of our workload.

That is enough to make automatic fact extraction a deliberate option rather than Lore's default write path. We can measure compact representations against their sources for a specific budget. We should keep the source evidence available for the questions no extractor anticipated.

## Sources

- [The benchmark corpus builder, answer evaluator, and measured comparison](https://github.com/corespeed-io/lore/commit/4976fa162a29e9a082a1f53f3276f86c622b164b)
- [LongMemEval benchmark and reference code](https://github.com/xiaowu0162/LongMemEval)
- [Lore's Memory, Observation, and Proposal definitions](https://github.com/corespeed-io/lore/blob/main/docs/CONTEXT.md)
- [The earlier LongMemEval analysis and reader robustness check](/blog/how-we-took-longmemeval-from-80-to-94-without-touching-retrieval/)
