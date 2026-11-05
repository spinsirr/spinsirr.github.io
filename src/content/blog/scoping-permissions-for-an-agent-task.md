---
title: 'Scoping permissions for an agent task'
description: 'How connection grants, task environments, and API key constraints limit access during execution, rotation, and deletion.'
pubDate: 'Nov 5 2026'
kind: field-note
tags: ['AI agents', 'MCP', 'Authorization', 'PostgreSQL']
featured: false
draft: false
---

Suppose an agent needs to summarize a Slack discussion. The person requesting the summary may also have permission to send messages and manage integrations. The summary task needs a smaller set of permissions.

In an application with a fixed workflow, developers define the available operations in code. An agent chooses its next tool call at runtime. Its choices depend on the task, previous results, and content it reads.

Traditional authorization already supports delegation. OAuth token exchange can distinguish the user from the actor representing that user. Agent systems can use those mechanisms. [RFC 8693](https://www.rfc-editor.org/rfc/rfc8693.html#section-1.1) describes the distinction.

The design problem is deciding how much authority each task receives, then enforcing that restriction throughout execution.

In CoreSpeed's connection authorization design, grants and environments serve different purposes. A grant gives a principal access to a connection. An environment selects connections and tools that the principal can use for a particular task.

Selecting a connection in an environment cannot create access to it. The caller must already have access. For each selected connection, the allowed tools come from the intersection of the grant's tool list and the environment's tool list.

![Existing connection grants and task scope overlap at reading a Slack discussion. Sending messages is outside the task scope, and a connection without a grant is outside existing access.](/blog/scoping-permissions-for-an-agent-task/permissions.svg)

This distinction also keeps an environment from becoming another identity. Creating a separate agent identity changes attribution and other identity settings. Selecting an environment narrows access while preserving the agent's identity.

The restriction must reach the credential resolver. Filtering `tools/list` helps the model choose among available tools, but a caller can submit a tool name directly. At execution time, the resolver must check the requested tool against the selected connection.

The connection matters because two accounts for the same service can carry different permissions. A tool name alone does not identify which account the request may use.

Administrative permissions need a separate check. Permission to use a connection does not automatically grant permission to share that connection or change authorization policies. API keys carry a permission ceiling, and newly created keys must stay within the caller's authority.

Lifecycle operations can weaken these restrictions if the data model permits it.

Consider an API key bound to an environment. An unbound key has no environment restriction. If deleting the environment simply clears that binding, deletion expands the key's access.

CoreSpeed's schema prevents that transition. A composite foreign key binds the key to an environment owned by the same subject in the same organization. The application refuses deletion while an unrevoked key remains bound. The database constraint also blocks the deletion.

Key rotation must preserve the environment binding too. Otherwise, rotating a restricted key creates a way to escape its task scope.
