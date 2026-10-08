---
title: 'How to turn an idle laptop into a Linux devbox'
description: 'Set up SSH, keep a laptop awake with the lid closed, reconnect to a running task, and preview a remote app through a local tunnel.'
pubDate: 'Oct 07 2026'
kind: field-note
tags: ['Linux', 'Developer tools', 'Infrastructure']
featured: false
draft: false
ogImage: '/blog/idle-laptop-devbox/cover.png'
---

My devbox started as a laptop I already owned: an Intel Core i5-13500H, 32GB of RAM, and a 1TB NVMe SSD. It was sitting idle. Now it gives my development work a place to run while my everyday laptop acts as the screen and keyboard.

Here is a practical way to build that arrangement. By the end, you should be able to connect from another computer, leave a small task running, disconnect, reconnect to it, and open a remote development server in your local browser.

This walkthrough starts with **Ubuntu already installed**, a regular user with sudo access, and physical access to the machine. Installing Linux and repartitioning disks are outside its scope. Back up anything you want to keep before changing an existing operating system.

The examples use ordinary OpenSSH and tmux so you can verify the foundation before adding an IDE or agent runtime. My daily interface is Orca; that comes later.

<figure class="post-sketch">
  <img src="/blog/idle-laptop-devbox/hand-drawn.webp" width="1536" height="1024" loading="lazy" alt="A relaxed pencil-and-watercolor sketch of a closed everyday laptop connected to a powered development laptop at night." />
  <figcaption>The arrangement in a sketch: close the client laptop while the remote machine continues working. The remote machine still needs power and must remain awake.</figcaption>
</figure>

## 1. Check what you already have

**Run on the devbox**, in a terminal:

```sh
lscpu
free -h
lsblk -o NAME,SIZE,TYPE,MOUNTPOINTS
df -h "$HOME"
```

Look for CPU topology, available memory, disk capacity, and free space on the filesystem containing your home directory. These answer different questions: a large disk does not help if the partition holding your workspace is almost full. Memory reported by Linux may also be lower than the advertised capacity because of units and reserved memory.

My 32GB / 1TB configuration is a starting point, not a minimum requirement. Count the whole workspace when thinking about capacity: the agent, development server, compiler, browser tests, and any local services. Multiple worktrees may mean multiple copies of those processes.

For the initial setup, use one project and one task. Add concurrency after the basic workflow works.

| Starting point | What makes it useful | What you take on |
| --- | --- | --- |
| Everyday laptop | One environment, available without a remote connection | Work depends on that laptop staying available |
| Idle laptop | Try a separate runtime with hardware already owned | Power, network, cooling, and maintenance |
| New dedicated machine | Address an identified capacity or placement limit | A hardware purchase and the same host administration |
| Cloud machine | Put the runtime outside the home | Provider setup, persistent storage, and ongoing cost |

I started with the idle laptop because it was available. There was no new computer to buy before finding out whether the workflow suited me.

**Checkpoint:** you know where the workspace will live and how much room it has. Keep the devbox on power and somewhere ventilated while setting it up.

## 2. Get one SSH connection working

**On the devbox**, install the baseline tools:

```sh
sudo apt update
sudo apt install openssh-server git tmux python3
sudo systemctl enable --now ssh
systemctl status ssh --no-pager
hostname -I
whoami
```

Record the username and an address reachable from your client. Use a trusted private network for this first connection. If a firewall is enabled, allow SSH only from the intended client or private network; you do not need to forward port 22 on your router for this tutorial.

**On your everyday laptop**, replace the sample username and address:

```sh
ssh YOUR_USER@DEVBOX_ADDRESS
```

Before accepting the first host-key prompt, compare its fingerprint with the corresponding key shown **at the devbox’s own terminal**:

```sh
sudo ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub
```

Once connected, run `hostname` to confirm which machine owns this shell. Follow [Ubuntu’s OpenSSH guide](https://ubuntu.com/server/docs/how-to/security/openssh-server/) to configure key-based login. Copy only your public key to the server; keep the private key on your client. Test a new connection before changing authentication settings.

For access away from home, one option is to install Tailscale on both devices, sign them into your private network, and use the devbox’s Tailscale address. The [Linux installation guide](https://tailscale.com/docs/install/linux) covers its current packages and enrollment steps. This tutorial continues to use ordinary OpenSSH over that connection; it does not require enabling Tailscale SSH.

**Checkpoint:** you can open a second SSH connection and `hostname` reports the devbox. Leave local console access available until the rest of the setup is verified.

## 3. Give the connection a short name

**On the client**, add a unique entry to `~/.ssh/config`. If you already have a `devbox` entry, edit it rather than adding a duplicate:

```sshconfig
Host devbox
    HostName DEVBOX_ADDRESS
    User YOUR_USER
    ServerAliveInterval 30
    ServerAliveCountMax 3
```

Use your reachable private address or configured DNS name. A home-network DHCP address can change; use a reservation or a stable private-network name if you want the alias to keep working.

Now try:

```sh
ssh devbox
```

Keepalives help detect a lost connection. They do not keep a remote program alive. We will give the task its own session in step 5.

## 4. Keep the devbox awake when its lid closes

Do this while you still have physical access. **On the devbox**, create a dedicated logind drop-in:

```sh
sudo mkdir -p /etc/systemd/logind.conf.d
sudoedit /etc/systemd/logind.conf.d/90-devbox-lid.conf
```

If that file already exists, inspect it first and preserve any settings you still need. Add:

```ini
[Login]
HandleLidSwitch=ignore
HandleLidSwitchExternalPower=ignore
HandleLidSwitchDocked=ignore
IdleAction=ignore
```

These settings tell logind to ignore lid and idle actions. A desktop environment can take over those events through inhibitors, so its own automatic-suspend settings may need adjustment too. The [logind reference](https://github.com/systemd/systemd/blob/main/man/logind.conf.xml) explains that interaction.

Inspect the merged configuration:

```sh
systemd-analyze cat-config systemd/logind.conf
```

Check for later conflicting settings. Then save your work and reboot the devbox to apply the configuration cleanly:

```sh
sudo reboot
```

Your SSH connection will close. After the machine comes back, reconnect, close **the devbox’s lid**, wait a minute, and run `date` through SSH. If it stops responding, open the lid and investigate suspend settings before proceeding. A dark screen alone does not mean the system suspended.

My own machine also has sleep targets masked. Start with the specific behavior you need and test it; do not copy a broader sleep policy just because another machine uses it.

**Undo:** remove only the settings you added to this drop-in, then reboot after saving your work. Restore the desktop power policy too if you changed it.

## 5. Prove that a task survives disconnecting

**Inside the SSH connection**, start a named tmux session:

```sh
tmux new -s devbox-check
```

Run this small foreground task inside it:

```sh
while true; do
  date -Is
  sleep 10
done
```

Press **Ctrl-b**, release both keys, then press **d** to detach. Run `exit` to leave SSH. Reconnect from the client:

```sh
ssh devbox
tmux attach -t devbox-check
```

You should see timestamps from while you were disconnected. Press **Ctrl-c** to stop the loop, then `exit` to close that test session. These detach and attach operations are covered by the [tmux getting-started guide](https://github.com/tmux/tmux/wiki/Getting-Started).

If the session disappears after logout, inspect the host’s logout policy, including logind’s `KillUserProcesses` setting. Resolve that policy or use a user-service-managed runtime before relying on unattended tasks. Neither tmux nor an SSH keepalive makes a process survive a reboot.

<figure class="post-flow">
  <ol aria-label="Verify a remote task survives a client disconnection">
    <li><strong>Start the timestamp loop</strong><span>The process runs inside a named session on the devbox.</span></li>
    <li><strong>Detach and disconnect</strong><span>Close the client connection while the devbox stays awake.</span></li>
    <li><strong>Attach again</strong><span>Check for timestamps produced during the disconnection.</span></li>
  </ol>
  <figcaption>Test persistence with a disposable task before trusting it with a long build or agent session.</figcaption>
</figure>

## 6. Open a remote preview locally

A terminal connection is only half of a useful development setup. Test a browser preview without exposing a development server to the internet.

**On the devbox**, create an isolated demo directory and start a new session:

```sh
mkdir -p ~/devbox-tutorial-preview
cd ~/devbox-tutorial-preview
tmux new -s devbox-preview
```

Inside that session, run:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

It serves only that demo directory. Detach with **Ctrl-b**, then **d**. **In a separate client terminal**, open a tunnel:

```sh
ssh -N -o ExitOnForwardFailure=yes \
  -L 127.0.0.1:18000:127.0.0.1:8000 devbox
```

Leave the tunnel terminal open. Visit `http://127.0.0.1:18000` in your client browser. You should see the demo directory listing. Port 18000 belongs to the client; the tunnel forwards to port 8000 on the devbox’s loopback interface.

If the client port is occupied, choose another local port and use that in the browser URL. A successfully opened tunnel does not by itself prove the remote server is running; check the page too.

**Cleanup:** press Ctrl-c in the client tunnel terminal. Reattach to `devbox-preview` on the server, press Ctrl-c to stop Python, and type `exit`. No service from this demo should remain running.

For a real application, use its development command in place of Python and forward the port it actually listens on. Keep its bind address private. The [OpenSSH client manual](https://man.openbsd.org/ssh#L) documents local forwarding.

## 7. Move one real project onto it

Now install the runtime versions your repository requires, clone it on the devbox, and follow its own setup instructions. Check the runtime version, install dependencies, run the project’s normal checks, and open its preview through the tunnel pattern above.

Configure repository access independently on the devbox. A tool installed or authenticated on the client is not automatically available remotely. Avoid copying your entire client configuration and secret collection just to make the first project work.

I keep one active home for a project. If it belongs on the devbox, its working copies and worktrees live there. Git handles committed history; the remote connection gives me access to the actual running workspace. Uncommitted files and local service data still need a recovery plan of their own.

At this point you can add a remote editor or agent interface. I use [Orca’s remote-server model](https://github.com/stablyai/orca/blob/main/docs/site/content/docs/remote-servers.mdx), where the server owns the repositories, terminals, and agent sessions. Follow its installation instructions for the current release, then repeat the disconnect test through that interface.

If a CLI login opens a browser on the wrong machine, see the companion article, [A headless devbox still needs a browser](/blog/a-headless-devbox-still-needs-a-browser/). That is a separate issue from whether SSH works.

## What “done” looks like

Before adding several projects or parallel agents, check these outcomes:

- A fresh `ssh devbox` connection reaches the intended machine.
- Closing the devbox lid leaves it reachable on power.
- A disposable task continues while the client is disconnected.
- Reconnecting returns you to that task’s session.
- A browser on the client reaches a loopback-only preview through SSH.
- One real project installs, runs its checks, and starts successfully remotely.

Then watch memory, disk space, and build times under your actual workload. Increase concurrency gradually. If performance drops, identify the competing processes before upgrading hardware.

The useful result is a working loop: start work, disconnect, return, inspect the result. The idle laptop has earned its new job once that loop is dependable.
