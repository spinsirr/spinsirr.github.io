---
title: 'Turning an idle laptop into a devbox'
description: 'How an idle laptop with 32GB of RAM and a 1TB SSD became my remote development machine, the tradeoffs behind using it, and the laptop defaults that needed attention.'
pubDate: 'Oct 07 2026'
kind: field-note
tags: ['Linux', 'Developer tools', 'Infrastructure']
featured: false
draft: false
ogImage: '/blog/idle-laptop-devbox/cover.png'
---

My devbox was a laptop I already owned. It was sitting idle, with 32GB of RAM and a 1TB SSD. Giving it a permanent job was an easier starting point than shopping for another machine.

The useful change was where the work lived. My everyday laptop could be the screen and keyboard; the other machine could hold the repositories and run the development sessions.

<figure class="post-sketch">
  <img src="/blog/idle-laptop-devbox/hand-drawn.webp" width="1536" height="1024" loading="lazy" alt="A relaxed pencil-and-watercolor sketch of a closed everyday laptop connected to a powered development laptop at night." />
  <figcaption>The arrangement in a sketch: close the client laptop while the remote machine continues working. The remote machine still needs power and must remain awake.</figcaption>
</figure>

## Start with the machine on hand

Here is the hardware I ended up using:

| Component | Configuration |
| --- | --- |
| CPU | Intel Core i5-13500H, 12 cores / 16 threads |
| Memory | 32GB |
| Storage | 1TB NVMe SSD |
| Operating system | Ubuntu |

The starting question was whether this machine could take over a useful part of my development workflow. The specification gave me a place to start; it was not a promise about how many agents or builds it could run simultaneously.

### Size the whole workspace

An agent session is only one part of the workload. The tools it starts need resources too. A workspace might have a development server, a compiler watching files, and a browser running tests. Open another worktree and some of those processes may be duplicated. The useful unit for capacity planning is the set of things running together.

That makes the 32GB of memory worth paying attention to. I would check available memory and swap activity during an ordinary busy session before deciding that the CPU needs an upgrade. If a machine becomes unresponsive only when several jobs overlap, increasing concurrency further is unlikely to make the overall workflow feel faster.

The SSD has a similar story. Source code is only part of what occupies it. Dependencies, build output, container images, and abandoned worktrees can accumulate. A 1TB disk gives this setup room to start, but I would still check what is growing before treating a full disk as a reason to buy another computer.

The processor matters for the work executed locally, including builds and tests. The useful question is which step keeps me waiting. I have not benchmarked this laptop against other machines, so I cannot turn its core count into a throughput claim.

## What would make another option worth it?

Because I already had the laptop, there was no new computer to purchase to try this arrangement. That makes the decision different from choosing equipment from scratch. Electricity, maintenance, and my time still count; I have not measured a monthly operating cost or calculated a break-even point against a cloud instance.

The comparison I find useful is what would justify changing the arrangement:

| Option | Reason to consider it | Question to resolve first |
| --- | --- | --- |
| Keep everything on the everyday laptop | Keep one environment and work without a remote connection | Is tying the work to that laptop’s availability actually a problem? |
| Reuse the idle laptop | Give remote sessions a home using hardware already available | Can it stay awake, connected, and responsive under the workload? |
| Buy a dedicated machine | Address a specific capacity, placement, or maintenance constraint | What observed limitation would the purchase remove? |
| Rent a cloud machine | Move the runtime out of the house and choose a provider-managed host | What persistent storage, access, and ongoing cost does the workflow require? |

This is a framework for the choice, not a record of four machines I tested. The idle laptop was the option available to me. A cloud machine becomes more interesting if keeping the runtime at home is itself the problem. A new physical machine becomes more interesting if the existing one hits a resource limit or is awkward to keep running.

There is also a cost to introducing a remote machine at all: development now depends on being able to reach it. If I need to work somewhere without that connection, the everyday laptop has an advantage. Separating the runtime is useful only when the independence it gives the work is worth that dependency.

For my setup, the next step was making the existing machine behave consistently in its new role.

## Give the work a home

I use [Orca’s remote-server setup](https://github.com/stablyai/orca/blob/main/docs/site/content/docs/remote-servers.mdx). The remote server owns the repositories, worktrees, terminals, and agent sessions. The client provides the interface. Disconnecting the client does not require those sessions to stop, provided the server stays up.

That also makes the server a separate development environment. Tools and account setup have to exist there; installing something on the client does not install it remotely.

<figure class="post-flow">
  <ol aria-label="A development session across client disconnection">
    <li><strong>Start from the client</strong><span>Open a remote workspace and launch the task.</span></li>
    <li><strong>Run on the devbox</strong><span>Files and processes stay on the remote machine when the client disconnects.</span></li>
    <li><strong>Reconnect</strong><span>Return to that workspace and inspect the result or continuing session.</span></li>
  </ol>
  <figcaption>Client disconnection and server shutdown are different events. This arrangement does not make processes survive a devbox reboot.</figcaption>
</figure>

I keep one active home for a project. If it belongs on the devbox, that is where I work on it. Keeping a second working copy synchronized on my everyday laptop would add another thing to manage, especially with uncommitted edits and multiple worktrees.

Git still handles version history. The remote connection handles access to the running workspace.

## A laptop wants to go to sleep

This was the configuration detail worth checking before trusting the arrangement: closing a laptop lid can suspend the machine that is supposed to keep working.

My current configuration includes these settings in a `logind.conf.d` drop-in:

```ini
[Login]
HandleLidSwitch=ignore
HandleLidSwitchExternalPower=ignore
HandleLidSwitchDocked=ignore
IdleAction=ignore
```

These are the lid and idle portions of the configuration, not a complete server setup script. The [systemd logind documentation](https://github.com/systemd/systemd/blob/main/man/logind.conf.xml) explains which settings apply to lid events and external power, and how inhibitors can affect event handling. Checking the file alone is not a substitute for checking the machine’s actual behavior.

On this devbox, the sleep, suspend, hibernate, and hybrid-sleep targets are also masked. That is a deliberate choice for its current role as a machine left running. It is a setting I would revisit if I started carrying the laptop around again.

The screen going dark is fine. The machine suspending underneath an active development session is the event I want to avoid. Power, ventilation, and the network still matter; an old laptop does not acquire server uptime guarantees because it has Ubuntu installed.

## Logout is another boundary

The machine also has lingering enabled for my user. As the [loginctl documentation](https://github.com/systemd/systemd/blob/main/man/loginctl.xml) describes, lingering allows the user’s service manager to start at boot and remain after logout.

That is useful for services managed there. It does not turn every command launched in an arbitrary shell into a persistent job. I still need to know which service or runtime owns a long-running process.

A headless machine has other small desktop assumptions to untangle, too. I wrote about one of those separately: [opening browser URLs from a remote development environment](/blog/a-headless-devbox-still-needs-a-browser/).

## What I would check before upgrading

I would want a specific symptom before replacing this machine. “The devbox feels slow” leaves too many possibilities open:

- **A build is slow even when it runs alone.** Time that build and inspect resource use while it runs. This gives a much clearer hardware question than timing a busy machine with unrelated jobs competing for resources.
- **Everything slows down when several workspaces are active.** Check memory pressure and the processes each workspace leaves running. The first useful experiment is to reduce overlap and see whether responsiveness returns.
- **The disk keeps filling up.** Separate active project data from disposable caches and old build output. More storage can be justified, but it should be clear what needs to be retained.
- **The client cannot reach the workspace.** Check the remote machine’s power and network state. A faster CPU will not fix a suspended server or a broken connection.
- **A session disappears after logout or a restart.** Inspect who owns the process and how it starts. That is a lifecycle question to resolve before spending on hardware.

These are checks I would use to guide the next decision, rather than results from a benchmark suite. I have not established a maximum number of simultaneous agents for this laptop.

Recovery deserves its own check as well. Reconnecting to a running session is convenient, but the machine can still fail. Pushed commits, uncommitted work, and local service data have different recovery paths. A second machine is not automatically a backup of the first, especially when a project has one active home.

## The selection was pleasantly short

I had an idle machine with useful capacity, so I put it to work. The more interesting decisions came afterward: where projects should live, who owns a session, and what happens when a lid closes or a client disconnects.

That is the version of a devbox I wanted to try first. A laptop that had been sitting around now has a job, and my everyday laptop can close without taking the remote workspace with it.
