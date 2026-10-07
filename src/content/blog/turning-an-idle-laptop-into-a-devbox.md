---
title: 'Turning an idle laptop into a devbox'
description: 'How an idle laptop with 32GB of RAM and a 1TB SSD became my remote development machine, and the laptop defaults that needed attention.'
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

Those numbers describe this machine, rather than a minimum specification for a devbox. I have no hardware comparison benchmark to attach to them.

For this job, I care about room for the development workload: repositories, dependencies, worktrees, builds, and running tools. Memory and disk capacity are useful things to check before buying anything. They are also things I can watch as the workload grows, instead of guessing a future requirement from a processor ranking.

Already owning the laptop settled the first decision. It did not settle whether the setup would behave like a machine I could leave running.

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

## The selection was pleasantly short

I had an idle machine with useful capacity, so I put it to work. The more interesting decisions came afterward: where projects should live, who owns a session, and what happens when a lid closes or a client disconnects.

That is the version of a devbox I wanted to try first. A laptop that had been sitting around now has a job, and my everyday laptop can close without taking the remote workspace with it.
