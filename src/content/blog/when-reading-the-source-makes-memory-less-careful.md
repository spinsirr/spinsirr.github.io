---
title: 'When reading the source makes a memory answer less careful'
description: 'A 500-question Lore test found more correct answers with raw sources, but more false-premise answers too.'
pubDate: 'Nov 2 2026'
kind: research
tags: ['Memory systems', 'Evaluation', 'LongMemEval']
featured: false
---

I expected the original conversation to help when a compact Memory omitted a detail. Our [earlier source experiment](/blog/reading-the-source-behind-a-memory/) showed that it often did. But it left a product question open: should Lore read the source for every answer?

We tested that question through the [Lore evaluation harness](https://github.com/corespeed-io/lore/pull/155). Each of the 500 LongMemEval-S questions used the same fact Memories. One run gave the reader those Memories. The other also gave it the raw conversations cited by them. The [published report](https://github.com/corespeed-io/lore/blob/d262faafd63a2c67f13def3758dbcb2fde07be7e/docs/research/memory-source-expansion.md#do-sources-help-at-all-all-500-questions-2026-10-15) records the full comparison and its limits.

<figure class="source-test" aria-labelledby="source-test-caption">
  <div class="source-test-grid">
    <div class="source-test-panel">
      <h3>Correct answers <small>500 questions</small></h3>
      <div class="source-test-row"><span>Memories</span><div class="source-test-track"><div class="source-test-fill" style="width:84.2%"></div></div><strong>84.2%</strong></div>
      <div class="source-test-row"><span>With sources</span><div class="source-test-track"><div class="source-test-fill source-test-fill-accent" style="width:89.4%"></div></div><strong>89.4%</strong></div>
    </div>
    <div class="source-test-panel">
      <h3>Correct abstentions <small>30 false-premise questions</small></h3>
      <div class="source-test-row"><span>Memories</span><div class="source-test-track"><div class="source-test-fill" style="width:96.7%"></div></div><strong>96.7%</strong></div>
      <div class="source-test-row"><span>With sources</span><div class="source-test-track"><div class="source-test-fill source-test-fill-accent" style="width:83.3%"></div></div><strong>83.3%</strong></div>
    </div>
  </div>
  <figcaption id="source-test-caption">The same source read improves answer accuracy but lowers correct abstention. Each bar starts at zero. The panels use different question counts.</figcaption>
</figure>

<style>
.source-test { margin: 2rem 0; padding: 1.25rem; background: var(--bg-2); border: 1px solid var(--line); }
.source-test-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.5rem; }
.source-test-panel h3 { margin: 0 0 1.25rem; font-size: 1.05rem; line-height: 1.25; }
.source-test-panel small { display: block; margin-top: 0.2rem; color: var(--fg-2); font: 400 0.8rem var(--font-sans); }
.source-test-row { display: grid; grid-template-columns: 6.5rem minmax(0, 1fr) 3.5rem; gap: 0.5rem; align-items: center; margin: 0.6rem 0; font-size: 0.8rem; }
.source-test-row strong { text-align: right; font-variant-numeric: tabular-nums; }
.source-test-track { height: 0.9rem; background: var(--line-soft); }
.source-test-fill { height: 100%; background: var(--fg); }
.source-test-fill-accent { background: var(--accent); }
.source-test figcaption { margin-top: 1rem; color: var(--fg-2); font-size: 0.85rem; line-height: 1.45; }
@media (max-width: 650px) { .source-test-grid { grid-template-columns: 1fr; } }
</style>

## The extra text helped, then misled

The source run answered **89.4%** correctly, up from **84.2%** with Memories alone. It fixed 38 answers and broke 12. The paired gain was 5.2 percentage points, with a 95% interval of 2.6 to 7.8 points. Questions about what the assistant said earlier gained the most.

The reader also consumed more text: 7,664 input tokens per question, compared with 2,229. This test measured a 3.4-fold increase in reader input. It did not measure a production cost or latency change.

The problem appeared in questions with a false premise. A correct reader must decline when the record does not support the question. With Memories alone, it did that on 29 of 30 questions. With sources, it did so on 25 of 30. The raw conversation sometimes contained a nearby detail that made a wrong answer seem plausible.

The [report's case review](https://github.com/corespeed-io/lore/blob/d262faafd63a2c67f13def3758dbcb2fde07be7e/docs/research/memory-source-expansion.md#do-sources-help-at-all-all-500-questions-2026-10-15) identifies three real abstention losses and one judge error. That distinction matters. The decline remains even when the judge error is excluded.

## Why the default stayed off

We had set the evaluation rule before the run. A category regression of three or more net cases blocks a default change. The result met that condition, so the verdict was `no-evidence` despite the overall gain. [PR #160](https://github.com/corespeed-io/lore/pull/160) records the decision: an agent can call `lore_read_evidence` when it needs a source, but Lore does not add sources to every search result by default.

The two-step idea from my earlier article also needs a limit. Reading the source only when the reader declines is useful for some missing details. It is not an abstention guard. A correct answer to a false-premise question is itself a decline, so that rule can reopen the same risky questions.

We separately tested whether placing each source beside its Memory helps the reader. On 140 questions, that layout scored 89.3% against 87.9% for putting every Memory first. It fixed six answers and broke four. The [paired test](https://github.com/corespeed-io/lore/pull/155) did not establish a reliable gain, so `withSources` did not ship.

These results come from LongMemEval-S fact Memories, one reader model, and one judge model. They do not prove that source reading is unsafe in every setting. They show why I kept it as a choice: the same evidence that repairs an omitted detail can also make a false premise harder to reject.
