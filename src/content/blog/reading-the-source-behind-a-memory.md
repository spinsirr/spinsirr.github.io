---
title: 'Reading the source behind a memory'
description: 'On 500 LongMemEval questions, reading the sessions behind retrieved memories raised accuracy from 84.4% to 89.6%, without a raw-text search index.'
pubDate: 'Oct 13 2026'
kind: research
tags: ['Memory systems', 'Evaluation', 'LongMemEval', 'PostgreSQL']
featured: false
ogImage: '/blog/reading-the-source-behind-a-memory/results.png'
---

In an [earlier Lore experiment](/blog/why-we-do-not-extract-facts-by-default/), compact fact sheets saved reader tokens but dropped details needed to answer later questions. Keeping the original conversation solved the retention problem. It left a practical question: when should the reader see it?

We tested eleven ways to combine retrieved Memory with raw conversation text on all 500 LongMemEval-S questions. One of the simpler approaches answered **448 questions correctly, up from 422**: take a retrieved Memory, find the session it came from, and give the reader that session too. No second search over the raw corpus was needed.

The [public experiment report](https://github.com/corespeed-io/lore/blob/d6c18572b2204d06850060810100d33895dd719a/docs/research/memory-source-expansion.md) includes the full comparisons, regressions, and reproduction instructions. This is a benchmark result, not a deployed agent workflow.

## The search had already found the conversation

In the earlier baseline's 79 failed questions, 70 had every answer-bearing session represented in the top ten Memory hits. Search had found the right place. The extracted facts, or the excerpt sent to the reader, did not contain enough of what was said there.

That suggested a specific experiment. Freeze the ten Memory excerpts for each question and replay them unchanged. Add source text within the remaining reader budget. If an answer improves, it cannot be because we quietly improved Memory retrieval.

Every arm kept those ten excerpts intact inside the same **24,000 UTF-16-unit cap**. That is a text-length limit, not a 24,000-token allowance. The reader was Gemini 3.5 Flash; GPT-5.5 judged the answers using LongMemEval's official V1 rubric. These numbers belong to that reader-and-judge profile. They should not be subtracted from scores in our earlier articles, which used different profiles.

## A whole session beat a narrower window

We started with several ways to select text inside the sessions Memory had already found. Searching those sessions with the original question barely helped: accuracy moved from 84.4% to 85.2%. The lexical query demanded all its content words in one chunk. Only 85 of the 500 questions received any raw text.

Relaxing the query to match any distinctive keyword helped. Adding neighboring chunks helped again. Reading whole source sessions did better still.

| Evidence added to the same Memory hits | Correct / 500 | Mean reader input tokens |
| --- | ---: | ---: |
| None | 422 | 2,469 |
| Keyword excerpts from their sources | 435 | 4,701 |
| Keyword excerpts plus neighboring chunks | 440 | 5,986 |
| Whole source sessions, within the cap | **448** | **6,041** |

Almost the same input budget bought different results: windows across several hits answered 440 questions; whole sessions from the highest-ranked hits answered 448. On average, 1.75 whole sessions fit. In this run, the extra context within those sessions was more useful than covering more hits with short windows.

Questions about things the assistant had said showed the largest change: **42 to 54 correct out of 56**. The report describes lost details such as a chord progression, a shop name, and a shift-rota entry. A fact sheet could preserve the subject of a conversation without preserving the particular answer a later question needed.

## Keeping text and indexing text have different costs

The next question was whether storing both Memory and its source would be too expensive. The database measurements separated two costs that are easy to lump together: retaining raw text and making all of it searchable.

![Three measured configurations: Memory alone scores 84.4% at 32 MB per 1,000 sessions; adding source sessions scores 89.6% at 38 MB; adding lexical and dense raw search scores 91.8% at 243 MB.](/blog/reading-the-source-behind-a-memory/results.png)

*Storage estimates per 1,000 benchmark sessions. The source-link table was not implemented; its small expected overhead is not a measured table size. These are within-run comparisons, not production forecasts.*

Memory facts, chunks, and vectors accounted for about **32 MB per 1,000 sessions**. Retaining the raw Observations added about **6 MB**. Reading those Observations by source key needed no raw search index.

Lexical chunks and indexes added another **51 MB**. Adding dense vectors and their HNSW index added **154 MB** beyond that. The vectors in this experiment had 1,536 dimensions; Lore deployments use 1,024, which was not measured here. The Memory allocation was also estimated by its share of chunk counts in a database that held both fact and whole-session Memories.

The keyword combination scored the same 448 as reading source sessions alone, at roughly 89 MB rather than 38 MB. They did not answer exactly the same questions correctly. But the extra index did not improve the aggregate score in this comparison.

Dense raw search combined with source sessions reached **459 correct, or 91.8%**. It was the highest score, at about 243 MB. Its advantage over the keyword combination was less settled than the headline suggests: a second independent judgment preserved the direction but moved the paired comparison from p = 0.027 to p = 0.15. That is a reason to run another dataset or judging profile before committing to the extra indexing machinery.

## Read more only when the first answer declines?

Always attaching source sessions raised reader input from 2,469 to 6,041 tokens. We also replayed a two-step rule: answer from Memory first; if that answer says the evidence is insufficient, use the source-enriched answer.

That rule scored **439 out of 500, or 87.8%**, at **3,385 mean input tokens**. The token count includes both reader calls for questions that escalated. It excludes output and thinking tokens. This was a replay of saved answers, not a live measurement of a production router.

It kept 17 of the 26 additional correct answers for about a quarter of the additional input. But it has a hard limit: **37 of Memory's 78 failures were confident wrong answers**. A rule that waits for the model to decline will never revisit those.

More text also introduced errors. Reading source sessions lost six questions that Memory alone answered correctly, including two false-premise questions. Details in an old assistant response sometimes persuaded the reader to accept something the user had never actually stated. The combined dense arm lost three of the 30 abstention questions. Source text needs speaker and evidence boundaries, not just room in the prompt.

## The missing piece is a real source link

The benchmark made one thing easy that the product does not yet guarantee. Each extracted Memory carried a session key. We used that key to find its raw Observation.

At the [PR #150 merge](https://github.com/corespeed-io/lore/pull/150), production Memories did not have that source relationship. Proposals retained evidence Observation IDs, but accepting a Proposal did not copy them into a durable Memory-to-Observation link. An agent could also write a Memory directly without citing a source. Memory-to-Memory graph links are a different relationship and cannot fill that gap.

The experiment therefore supports a next step: preserve the source relationship, then measure a reader that follows it when needed. Raw indexes can remain an explicit cost for workloads that need independent raw search. The merged PR exposed Episode evidence search and the evaluation; it did not turn the benchmark's source-expansion strategy into the default read path.

What convinced me was the small comparison in the middle of the run: **6,041 tokens of whole source sessions beat 5,986 tokens of selected windows**. We already had the right conversations. Giving the reader more of those conversations recovered details that another short excerpt still missed.
