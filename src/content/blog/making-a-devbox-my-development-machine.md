---
title: 'Making a devbox my development machine'
description: 'What changed when I moved the repository, worktrees, terminals, and agent sessions onto one remote machine.'
pubDate: 'Oct 12 2026'
kind: field-note
tags: ['Linux', 'Developer tools', 'Git', 'Infrastructure']
featured: false
draft: false
ogImage: '/blog/devbox-development/checkout-topology.png'
---

I first treated my devbox as a place to run things. The code stayed on my everyday laptop, and I sent work to the remote machine when I needed more time or a process that would survive closing the lid. That arrangement worked for a small test. It became awkward when I started developing a real project on both machines.

The decisive change was simpler than another sync script: I chose one machine to own each project. For a project on the devbox, the main checkout, its worktrees, dependencies, terminals, and running agents all live there. My laptop is the interface.

<figure class="post-sketch">
  <img src="/blog/devbox-development/checkout-topology-article.svg" width="800" height="850" loading="lazy" alt="Two divergent checkouts on a laptop and devbox give way to one devbox checkout with task worktrees, reached from a laptop client." />
  <figcaption>One project has one active home. The laptop connects to the devbox; Git worktrees branch from the checkout on that same machine. This is a conceptual map of my development workflow.</figcaption>
</figure>

## The duplicate checkout was the problem

I briefly kept a copy of the same project on each machine. Both copies accumulated local changes. A sync command could move files, but it could not decide which uncommitted edits were authoritative, which branch a task belonged to, or which local service matched the code I was looking at. Port forwarding made the two environments feel closer while leaving those questions open.

I stopped treating the devbox as a mirror. The project moved there, and the laptop copy was removed after its changes were accounted for. This is a project-by-project decision: a different repository can still live on the laptop. What matters is that a single repository does not have two competing working homes.

Git remains the record for commits. It does not automatically preserve an uncommitted worktree, a running development server, or a local database. Those need their own handling when moving a project. I checked the repository state and runtime on the destination before retiring the other copy.

## Put the whole working session beside the code

I use [Orca's remote-server model](https://github.com/stablyai/orca/blob/main/docs/site/content/docs/remote-servers.mdx) to open the devbox from my laptop. The server owns the project, terminal, browser runtime, and agent processes. The client displays and controls them. A worktree created for a separate task is another directory on the devbox, not a new checkout on my laptop.

That changes what “disconnect” means. Closing the client no longer means closing the terminal that runs the task. The remote process can keep working, and I can return to its existing workspace. I still check the process and its output after reconnecting; a surviving session is not proof that the task succeeded.

The same distinction matters for previews and sign-in flows. A browser window shown on the laptop may be backed by a browser process on the devbox. `localhost` belongs to whichever machine runs that process. I wrote about the URL-handler failure this exposed in [A headless devbox still needs a browser](/blog/a-headless-devbox-still-needs-a-browser/).

## The daily loop

I start from the remote project's main checkout, create a worktree for focused work, run the project's checks there, and inspect its preview. When I return later, I reopen the same workspace and read the actual state of the branch, process, and tests before deciding what is finished.

<figure class="post-flow">
  <ol aria-label="A development loop with the repository on the devbox">
    <li><strong>Open the remote project</strong><span>The devbox owns the checkout and its dependencies.</span></li>
    <li><strong>Work in a task worktree</strong><span>Terminal, agent, and preview run beside that code.</span></li>
    <li><strong>Return and verify</strong><span>Read the branch, output, and checks after reconnecting.</span></li>
  </ol>
  <figcaption>The client can come and go; the project's working state stays on one machine.</figcaption>
</figure>

This setup also makes the boundary less forgiving. Installing a CLI on my laptop does not install it on the devbox. Logging into a service locally does not authenticate the remote process. A remote agent has the devbox's permissions, so I account for its credentials and network access as part of that machine's setup rather than imagining it is an isolated sandbox.

The earlier [idle-laptop walkthrough](/blog/turning-an-idle-laptop-into-a-devbox/) covers SSH, power settings, reconnecting, and a first preview. The useful next step for me was deciding where the work truly lives. Once that was explicit, the devbox stopped being an extra place to run code and became the development machine for the projects assigned to it.
