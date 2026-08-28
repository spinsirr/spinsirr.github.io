---
title: 'How we took LongMemEval from 80.0 to 94.2 without touching retrieval'
description: 'LongMemEval-S climbed from 80.0 to 94.2 while retrieval recall@10 stayed at 0.99. The gains came from evidence budget, reader generation, and instructions.'
pubDate: 'Aug 27 2026'
kind: research
tags: ['Memory systems', 'Evaluation', 'LongMemEval']
featured: true
series:
  slug: 'memory-systems'
  title: 'Memory systems'
  order: 2
ogImage: '/blog/how-we-took-longmemeval-from-80-to-94-without-touching-retrieval/cover-5x2.png'
---

*By [Spencer Zhao](https://spinsirr.github.io/about/)*

Our first end-to-end pass over [LongMemEval-S](https://github.com/xiaowu0162/LongMemEval) with [Lore](https://github.com/corespeed-io/lore) scored 80.0. The benchmark asks 500 questions about facts scattered across roughly fifty chat sessions each. Two evenings later the same system, same retriever, same judge, scored 94.2: within 0.2 of the best self-reported number in the industry, produced with a reader one price tier below theirs, and with every category disclosed. This is the story of where those fourteen points came from.

The short version: none of them came from retrieval. Retrieval recall was 0.99 on day one. When we autopsied the 41 misses at the start, 35 of them had every answer-bearing session already sitting in the reader's prompt. The memory system had done its job; the points were being lost in the last thirty centimeters between a correct evidence packet and a correct sentence. We had measured the boundary where the product consumes data. The boundary had moved again, from evidence assembly to the answer itself.

![The tuning ladder: 80.0 baseline, 85.2 after evidence budget, 91.8 after reader generation, 94.2 after reader instructions, with a 93.8 label-free floor](/blog/how-we-took-longmemeval-from-80-to-94-without-touching-retrieval/fig-ladder.png)

*Figure 1. The full ladder. Retrieval recall@10 stayed 0.99 at every step.*

## The setup, so the numbers mean something

Every number below is the same protocol: the official cleaned LongMemEval-S split, all 500 questions, each question in its own isolated workspace with a private tripwire memory owned by a different user. One leak fails the entire run, and we finished at 0/500. Retrieval is our production hybrid path (full-text, dense vectors at 1536 dimensions, reciprocal-rank fusion) under row-level security. Grading uses the official upstream judge prompts reproduced verbatim, pinned to the exact repository commit, temperature 0, the same `'yes' in response` labeling as the reference script. We tuned the answering pipeline. We never touched the exam.

The reader for the headline number is a flash-class model, deliberately. If your score depends on a frontier reader, you are benchmarking the reader, not the memory system.

## Lever one: give the reader enough evidence (+5.2)

The baseline fed the top 5 retrieved sessions to the reader. LongMemEval's hardest category is multi-session reasoning, where the answer is assembled from facts spread across several conversations, and it needs more than five sessions by construction. Raising the evidence budget from top-5 to top-10 moved the overall score from 80.0 to 85.2 with the identical retriever and identical reader. Multi-session alone went from 72.2 to 84.2.

This is the cheapest point on the whole ladder and the easiest to miss, because nothing looks wrong at K=5. Recall@5 was already 0.96. The failure only shows up at the answer boundary: the reader cannot reconcile facts it never saw.

We also tried the opposite direction, compressing each session down to its best retrieval chunks to save tokens. That variant scored 84.6 while spending as many tokens as full sessions at K=5, which scores 90.2. Strictly dominated. For conversational memory, cutting how many records you include beats cutting what's inside each record, every time we measured it.

## Lever two: the reader model (+6.6)

Swapping the flash-class reader for its next generation moved 85.2 to 91.8. Real, but this is the one lever that isn't system design; it's a price tier. We note it mainly to size it against the levers that are design: the evidence budget and the reader instructions together are worth about as much as a model generation.

## Lever three: one sentence worth 23 points

At 91.8 we re-ran the miss autopsy, and the largest bucket was almost funny. Preference questions (“can you suggest a hotel for my trip to Miami?”) were scoring 66.7 while their evidence recall was a perfect 1.0. The reader had the user's recorded preferences in its prompt: loves rooftop pools, wants ocean views, avoids budget chains. It answered: *“the evidence contains no information about hotels in Miami.”*

Our reader instruction said, reasonably: if the evidence is insufficient, say so rather than guessing. For factual questions that rule is exactly what keeps the abstention category honest, and we score 93.3 on deliberately unanswerable questions. For recommendation questions, the same rule converts a personalization task into a refusal. One added sentence, telling the reader to ground recommendations in the user's recorded preferences instead of refusing because the specific subject is absent, took the category from 66.7 to 93.3.

The second bucket was cross-session counting. “How many weddings did I attend this year?” The reader found all five mentions and counted five weddings; two of the mentions described the same wedding. A three-step protocol in the instruction (list every candidate with its session date, merge mentions of the same real-world entity, apply the question's qualifiers, then count) moved multi-session from 88.0 to 91.7.

Instructions in, the ladder read **94.2**: single-session-assistant 100, single-session-user 97.1, knowledge-update 94.9, preference 93.3, temporal reasoning 92.5, multi-session 91.7, abstention 93.3.

![Per-category accuracy of lore next to a leading competitor's self-reported numbers across six LongMemEval question types](/blog/how-we-took-longmemeval-from-80-to-94-without-touching-retrieval/fig-categories-vs-competitor.png)

*Figure 2. Where the final configuration lands per category, next to a leading competitor's self-reported numbers.*

## The robustness check

One design choice deserved a stress test. Our per-category guidance selects which instruction to apply using the question's type, and while question type is obvious from the question text, we wanted to know how much of the gain depended on knowing it at all. So we merged everything (date arithmetic, entity merging, preference grounding, abstention honesty) into one generic system prompt with no type information anywhere, the kind any production deployment could ship as a static string.

Score: 93.8. The entire instruction stack survives with 0.4 points to spare. Knowledge-update and temporal actually improved, and preference held at 90 without ever being told a question was a preference question. The gains are in the guidance, not in the labels. We publish 94.2 with the type-aware configuration disclosed in every report, and 93.8 as the label-free floor.

## What didn't work

For completeness, the levers that flatlined: ordering evidence chronologically instead of by retrieval rank (±0.2, noise), and LLM query expansion (−0.4: retrieval was already saturated, and the extra queries occasionally pulled in distractors). The query-planning experiment still paid for itself. It exposed that our Google planner adapter's hardcoded 256-token output budget gets silently consumed by modern thinking models, so planning was failing open on every call in production. The benchmark found a real engine bug no unit test had.

We also built the write-time extraction profile several competing systems use as their core architecture: distill every session into a compact fact sheet at ingestion, retrieve fact sheets instead of transcripts. It's genuinely good at what it's for. It scores 87.8 at 2.8k reader tokens per question, eleven times cheaper than full sessions, with retrieval recall essentially unchanged (0.987 vs 0.990). But the lost points concentrate exactly where a lossy summary predicts: verbatim assistant-side details (100 down to 73.2) and cross-session enumeration. Extraction is a price tier, not a free lunch, which is why our default stores the full-fidelity record and treats compaction as an opt-in.

![Accuracy versus reader tokens per question: fact extraction at 2.8k tokens scores 87.8, top-5 full sessions at 14k scores 90.2, top-10 at 28k scores 94.2, chunk compression at 13k scores 84.6 and is dominated](/blog/how-we-took-longmemeval-from-80-to-94-without-touching-retrieval/fig-frontier.png)

*Figure 3. The efficiency frontier. The gray point is chunk compression: same token cost as top-5 full sessions, 5.6 points worse.*

## Scope

One benchmark, one language, one reader family for the headline number. The industry figure referenced above is that system's own published number under its own reader and judge; we have not re-run other systems under this harness. Our judge uses the official prompts but not the official judge model; the retrieval corpus is frozen and every per-question grade is logged, so all of this can be re-run and checked.

## What we'd tell you to measure

Measure at the boundary where your product consumes data, not where your subsystem reports success. Once evidence assembly is correct, the next boundary is the answer, and the points there are won by things that look nothing like retrieval engineering: an evidence budget one notch larger, a safety rule scoped so it stops eating a task category, a counting protocol somebody finally wrote down. None of our retrieval metrics moved between 80.0 and 94.2. Every point came from the last thirty centimeters.

If your memory system reports recall and stops there, it is reporting the part of the pipeline that was never going to win you the benchmark.

## Links

- [Lore source](https://github.com/corespeed-io/lore)
- [LongMemEval benchmark and code](https://github.com/xiaowu0162/LongMemEval)
- [LongMemEval paper](https://arxiv.org/abs/2410.10813)
- [CoreSpeed Memory](https://corespeed.io/docs/capabilities/memory)
