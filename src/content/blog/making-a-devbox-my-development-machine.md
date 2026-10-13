---
title: 'Moving development onto my devbox'
description: 'The migration took two attempts. Keeping a working copy on each machine was where I went wrong.'
pubDate: 'Oct 12 2026'
kind: field-note
tags: ['Linux', 'Developer tools', 'Git', 'Infrastructure']
featured: false
draft: false
ogImage: '/blog/devbox-development/checkout-topology.png'
---

I had an unused laptop and wanted somewhere for coding agents to keep running after I closed my MacBook. I installed Linux on it, called it `devbox`, and connected over SSH. Getting a shell was straightforward. Deciding where to keep the code took longer.

At first, I kept developing on the Mac and treated the devbox as a second place to run the project. I added an rsync wrapper to copy files over. Then I had a checkout on each machine, on different branches, with uncommitted changes in both.

I was also forwarding services onto different local ports so the two development stacks could coexist. That made the remote app accessible, but every change still came with a question: which copy was I editing?

## Moving it twice

I moved the project to the devbox, changed my mind and went back to using the Mac copy, then moved it again. The final decision was to do the development directly on the devbox through Orca. I removed the Mac checkout and the sync wrapper.

The project now has its main checkout and task worktrees on the same machine. Other projects still live on my Mac. I choose where each project lives rather than maintaining a matching copy on both.

<figure class="devbox-paths">
  <div class="devbox-paths-client"><strong>MacBook</strong><span>Orca client</span></div>
  <div class="devbox-paths-host"><strong>devbox</strong><pre>~/Workspace/&lt;project&gt;/
    main checkout

~/orca/workspaces/&lt;project&gt;/
    task-a/
    task-b/</pre></div>
  <figcaption>The directory layout on the remote machine. Project and task names are placeholders.</figcaption>
</figure>

<style>
.devbox-paths { margin: 2rem 0; color: var(--fg); }
.devbox-paths-client, .devbox-paths-host { border-top: 1px solid var(--line); padding: 1rem 0; }
.devbox-paths strong { display: block; margin-bottom: .5rem; }
.devbox-paths-client span, .devbox-paths figcaption { color: var(--fg-2); }
.devbox-paths pre { margin: 0; padding: .5rem 0; background: transparent; border: 0; font-size: .9rem; white-space: pre-wrap; overflow-wrap: anywhere; }
.devbox-paths figcaption { border-top: 1px solid var(--line); padding-top: 1rem; font-size: .85rem; }
</style>

## Getting the tools onto the right machine

[Orca's remote server](https://github.com/stablyai/orca/blob/main/docs/site/content/docs/remote-servers.mdx) runs the terminals and agents on the devbox. The Mac app connects to it. I can close the client and come back to the remote session later.

Moving the repository did not move the rest of the environment. The remote machine needed its own runtime, dependencies, Git access, and CLI logins. For the first project, cloning over HTTPS failed because the remote shell had no credential helper configured. Cloning over SSH worked with the key already on that machine.

Browser logins were another job. A CLI running remotely could ask to open a URL, but the machine had no desktop browser handler. Fixing that led to the `xdg-open` problem described in [A headless devbox still needs a browser](/blog/a-headless-devbox-still-needs-a-browser/).

The setup I use now has fewer moving parts than the one I started with: Orca connects to the devbox, the project runs there, and I open its remote worktree to continue. There is no copy step before running a command and no sync step when I finish.

For the Linux, SSH, and power configuration, I kept the commands in [How to turn an idle laptop into a Linux devbox](/blog/turning-an-idle-laptop-into-a-devbox/).
