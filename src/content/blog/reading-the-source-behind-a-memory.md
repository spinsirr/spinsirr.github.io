---
title: 'Reading the source behind a memory'
description: 'We tried keyword search, wider excerpts, and whole conversations. Then we checked what the extra accuracy would cost to keep.'
pubDate: 'Oct 13 2026'
kind: research
tags: ['Memory systems', 'Evaluation', 'LongMemEval', 'PostgreSQL']
featured: false
ogImage: '/blog/reading-the-source-behind-a-memory/results.png'
---

The first attempt to add raw conversation search to Lore barely helped. On 500 LongMemEval-S questions, the reader got three more answers right. Most questions received no raw text at all.

We had [already measured what fact extraction loses](/blog/why-we-do-not-extract-facts-by-default/). A compact Memory could retain the topic of a conversation while dropping a shop name or something the assistant had said. This experiment was about getting those details back into the answer.

## The query was too strict

The raw search passed the question to PostgreSQL's `websearch_to_tsquery`. A chunk had to contain every content word. Only 85 questions found any raw evidence. Restricting search to the sessions behind the Memory hits did not change that.

We relaxed the query to accept any distinctive keyword, then tried adding one neighboring chunk on each side. We also tried reading the source sessions directly, without searching inside them.

To keep the comparison useful, every version received the same ten saved Memory excerpts. Raw text had to fit around them within a 24,000 UTF-16-unit limit. None of the original excerpts could be cut.

| Added evidence | Correct / 500 | Mean reader input tokens |
| --- | ---: | ---: |
| None | 422 | 2,469 |
| Independent raw search with the original question | 425 | 2,550 |
| Keywords within Memory-hit sources | 435 | 4,701 |
| Keywords plus neighboring chunks | 440 | 5,986 |
| Whole source sessions, within the limit | 448 | 6,041 |

The last two rows cost almost the same number of tokens. The windows covered five or six hits; the whole-session version fit roughly one or two. Reading further into fewer conversations worked better here.

The largest improvement was in questions about what the assistant had said. The extracted facts had omitted details such as a chord progression and a shift-rota entry. Those details were still in the original conversation.

The [full report](https://github.com/corespeed-io/lore/blob/d6c18572b2204d06850060810100d33895dd719a/docs/research/memory-source-expansion.md) covers eleven variants. We used Gemini 3.5 Flash to answer and GPT-5.5 with the official rubric to judge. Earlier posts used different profiles, so their scores are not directly comparable.

## The highest score needed another index

We then combined source sessions with independent raw search. Half the remaining text budget went to the sessions; the rest went to excerpts from other conversations. Adding vector search produced the highest score in the run.

![Accuracy and storage for Memory alone, Memory with source sessions, and Memory with source sessions plus lexical and dense raw search.](/blog/reading-the-source-behind-a-memory/results.png)

*Storage per 1,000 benchmark sessions, using 1,536-dimension vectors. Memory storage is apportioned by chunk count; source-link overhead is estimated. These are not production capacity estimates.*

That prompted my next question: would keeping Memory and the original conversation be too expensive?

The raw text was a small part of the bill. The lexical chunks and indexes alone took about eight times as much space as the stored text. Reading a session by its source key needed neither that index nor a second set of embeddings.

The keyword combination reached the same aggregate score as reading source sessions alone, despite using more storage. Vector search improved on it, but the margin was uncertain: a second judgment moved that comparison from p = 0.027 to p = 0.15.

I chose to keep the raw indexes optional. Independent search still has a use when Memory misses a conversation entirely. I wanted another dataset or judging profile before committing to a background pipeline that embeds every raw session.

## Paying for the second read

Storage was only one cost. Feeding source sessions to the reader on every question more than doubled its input. We replayed a cheaper rule against the saved answers: use Memory first, and consult the source only when the answer says it lacks evidence.

That scored 439 out of 500 at 3,385 mean input tokens, counting both calls when it escalated. It recovered fewer answers, but used about a quarter of the extra input of always reading the source. Output and thinking tokens were excluded.

It also left 37 confident wrong answers untouched. Those answers never asked for more evidence.

Reading the source could introduce mistakes too. In one case, an intention expressed as “by the end of this month” became an event date. In others, old assistant suggestions helped the reader accept a premise the user had never stated.

## What I agreed to build

The chosen direction was Memory, retained raw text, and a link between them, with a second read when Memory is insufficient. The benchmark had made the link easy: every extracted fact sheet already named its source session.

At the [PR #150 merge](https://github.com/corespeed-io/lore/pull/150), the product did not preserve that relationship on accepted Memories. Proposal evidence IDs existed, but acceptance did not copy them across. Direct Memory writes could have no source citation at all.

The follow-up therefore needs to carry those citations into a durable link and test the reader against actual linked records. PR #150 added raw evidence search and this evaluation. Automatic source expansion was still unbuilt.
