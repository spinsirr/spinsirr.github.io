---
title: "Fixing a browser fetch bug in Lore's TypeScript SDK"
description: 'A TypeScript SDK passed its tests and worked in Bun, but one method receiver made every browser request fail before it reached the network.'
pubDate: 'Sep 24 2026'
kind: field-note
tags: ['TypeScript', 'Browser', 'SDK']
---

The Lore dashboard said it could not complete a request. On a fresh self-hosted installation, it even offered to create a workspace although workspaces already existed. The surprising clue: **no network request had left the page**.

This was not an API outage or a bad response. The TypeScript SDK threw before the browser could start a request. The [public fix is in Lore PR #122](https://github.com/corespeed-io/lore/pull/122).

## The receiver changed at the call site

The SDK's transport accepted an optional custom `fetch` implementation. Otherwise it used `globalThis.fetch`. In simplified form, it stored that function on the transport and later called it as a method:

```ts
this.fetch = options.fetch ?? globalThis.fetch;

// Later:
await this.fetch(input, init);
```

The assignment looked harmless. The call was the problem. In JavaScript, `object.method()` supplies `object` as the function's `this` value. Here, the receiver was the Lore transport, even though the stored function came from `window.fetch`.

In the browser used for the self-hosted check, `window.fetch` rejected that receiver with `TypeError: Failed to execute 'fetch' on 'Window': Illegal invocation`. The SDK caught it and surfaced a generic transport error. That explains both symptoms: every UI call failed, and no request was sent.

## Why the existing checks stayed green

The same SDK worked through Bun in the CLI and MCP adapter. Bun's `fetch` accepted the method call. The test suite's `vi.fn()` fetch stubs also accepted any receiver. Those checks exercised request handling, but they did not reproduce this browser constraint.

The [fix](https://github.com/corespeed-io/lore/blob/41fec2bdabf868abf8c22e5108f2469e315253a6/packages/typescript-sdk/src/index.ts#L446-L451) resolves the implementation once, then stores a wrapper that calls it as a plain function:

```ts
const fetchImpl = options.fetch ?? globalThis.fetch;
if (typeof fetchImpl !== "function") {
  throw new TypeError("A Fetch implementation is required");
}
this.fetch = (input, init) => fetchImpl(input, init);
```

This keeps custom fetch injection while avoiding `this.fetch(...)` as the call to the host function. The change is small because the bug was at the JavaScript call boundary, not in request construction or the API.

## A test that would have caught it

We added a [receiver-checking SDK test](https://github.com/corespeed-io/lore/blob/41fec2bdabf868abf8c22e5108f2469e315253a6/tests/ui/sdk.test.ts#L73-L86). Its fake `fetch` throws when called with an unexpected `this` value, as the browser did in this incident. The test fails against the old transport and passes with the wrapper.

That is the useful distinction: a mock that returns the right response is not always a faithful mock of the platform API. At a browser boundary, the way a function is *called* can be part of the behavior under test.

After the change, the SDK checks passed and a self-hosted browser deployment loaded its existing workspaces and memories. The result is deliberately narrow: this fixed the receiver error and restored those UI requests; it does not claim that every browser transport path is covered by one unit test.

When a UI reports a request failure and the Network panel shows nothing, check for a local exception before debugging the server. In this case, the request never got that far.
