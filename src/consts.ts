import githubStats from './data/github-stats.json';

// Single source of truth for site content.
// Edit values here and they update across every page.

export const SITE_TITLE = 'Spencer Zhao — Cofounder';
export const SITE_DESCRIPTION =
	'Spencer (Yunpeng) Zhao — Cofounder at CoreSpeed, the access and control layer for AI agents. Builds and ships products end to end.';

export const CONTACT_EMAIL = 'yunpeng@corespeed.io';
export const CONTACT_PATH = `mailto:${CONTACT_EMAIL}`;

export const PROFILE = {
	name: 'Spencer Zhao',
	fullName: 'Yunpeng "Spencer" Zhao',
	handle: 'spinsirr',
	role: 'Cofounder',
	company: 'CoreSpeed',
	companyUrl: 'https://corespeed.io',
	location: 'San Jose, CA',
	email: CONTACT_EMAIL,
	subhead:
		'Cofounder at CoreSpeed — the access and control layer for AI agents. We connect them to the apps you already use and keep them in bounds. I also build and ship products end to end. Based in San Jose, California.',
};

export const STATS = [
	{ value: githubStats.commitsLast12Months.toLocaleString('en-US'), label: 'commits · last 12 mo' },
	{ value: githubStats.pullRequestsLast12Months.toLocaleString('en-US'), label: 'PRs · last 12 mo' },
	{ value: githubStats.publicRepositories.toLocaleString('en-US'), label: 'public repos' },
	{ value: githubStats.joinedYear.toString(), label: 'on GitHub since' },
];

export const WHATIDO = [
	{
		n: '01',
		title: 'CoreSpeed',
		body: 'The access and control layer for AI agents: plug your agent into the apps you already use — 50+ via one OAuth — with built-in tools, memory, and plain-English policy + agent pay to keep it in bounds.',
	},
	{
		n: '02',
		title: 'Full products',
		body: 'Ideas taken end to end and shipped: BuildLog, Fixo, Amazon Order Wizard.',
	},
	{
		n: '03',
		title: 'Open source & hardware',
		body: 'Public tools like Claude Max Gateway, plus electronics — an FPGA clock and a tiny lithium UPS.',
	},
];

export type SocialIcon = 'github' | 'x' | 'linkedin' | 'email';
export interface Social {
	name: string;
	href: string;
	icon: SocialIcon;
	handle: string;
}

export const SOCIALS: Social[] = [
	{ name: 'GitHub', href: 'https://github.com/spinsirr', icon: 'github', handle: '@spinsirr' },
	{ name: 'X', href: 'https://x.com/zhao_spenc', icon: 'x', handle: '@zhao_spenc' },
	{
		name: 'LinkedIn',
		href: 'https://www.linkedin.com/in/spencerzhyp',
		icon: 'linkedin',
		handle: 'spencerzhyp',
	},
	{
		name: 'Email',
		href: CONTACT_PATH,
		icon: 'email',
		handle: 'yunpeng@corespeed.io',
	},
];

export const NAV = [
	{ href: '/', label: 'Home' },
	{ href: '/projects', label: 'Projects' },
	{ href: '/blog', label: 'Writing' },
	{ href: '/about', label: 'About' },
];

export interface StackGroup {
	label: string;
	items: string[];
}

export const STACK: StackGroup[] = [
	{ label: 'Languages', items: ['TypeScript', 'Python', 'Rust', 'Kotlin', 'C / Verilog'] },
	{ label: 'Runtimes', items: ['Deno', 'Bun', 'Node.js'] },
	{ label: 'Web', items: ['Next.js', 'React', 'Astro', 'Tailwind', 'Hono'] },
	{ label: 'AI', items: ['Vercel AI SDK', 'MCP', 'AG-UI', 'Claude', 'Gemini'] },
	{ label: 'Data & infra', items: ['Postgres', 'Supabase', 'Drizzle', 'MongoDB', 'Stripe', 'Vercel'] },
];

export type ProjectGroup = 'CoreSpeed' | 'Products' | 'Open source' | 'Hardware';

export interface Project {
	name: string;
	blurb: string;
	/** Public timeline date: project start or product-phase transition. */
	started: string;
	tags: string[];
	group: ProjectGroup;
	/** Primary link — live product or repo. */
	href?: string;
	/** Source link, when different from href. */
	repo?: string;
	stars?: number;
	featured?: boolean;
	/** Small status label, e.g. "Live", "Current", "Sunset", or "OSS". */
	badge?: string;
}

export const PROJECTS: Project[] = [
	{
		name: 'CoreSpeed',
		blurb:
			'The access and control layer for AI agents. One OAuth connects agents to 50+ apps, built-in tools, and memory. Plain-English policy and agent pay keep actions in bounds.',
		started: '2026-06-10',
		tags: ['Platform', 'Agents', 'Connectors'],
		group: 'CoreSpeed',
		href: 'https://corespeed.io',
		featured: true,
		badge: 'Current',
	},
	{
		name: 'CoreSpeed PaaS',
		blurb:
			'CoreSpeed\'s infrastructure-platform phase: a Git-driven PaaS for deploying agent applications, built around Kubernetes and a Rust control plane.',
		started: '2025-08-22',
		tags: ['Rust', 'Kubernetes', 'PaaS'],
		group: 'CoreSpeed',
		badge: 'Sunset',
	},
	{
		name: 'Payment Gateway',
		blurb:
			'A shared Stripe billing and usage-metering service for CoreSpeed products. Rebuilt on Cloudflare in 2026, then folded into the current platform.',
		started: '2025-01-20',
		tags: ['Stripe', 'Usage metering', 'Cloudflare'],
		group: 'CoreSpeed',
		badge: 'Absorbed',
	},
	{
		name: 'MCP Gateway',
		blurb:
			'A transparent proxy that brought MCP servers behind shared authentication, observability, and billing.',
		started: '2025-07-24',
		tags: ['MCP', 'OAuth', 'Observability'],
		group: 'CoreSpeed',
		badge: 'Sunset',
	},
	{
		name: 'AI Gateway',
		blurb:
			'A multi-provider proxy that normalized model APIs, routed requests, and attached usage billing. Its codebase later became today\'s CoreSpeed platform.',
		started: '2026-01-27',
		tags: ['Model routing', 'Vercel AI Gateway', 'Billing'],
		group: 'CoreSpeed',
		badge: 'Absorbed',
	},
	{
		name: 'DeckSpeed',
		blurb:
			'An AI presentation builder that turned prompts into editable slide decks and reached #1 on Product Hunt.',
		started: '2025-02-16',
		tags: ['AI', 'Presentations', 'Product Hunt'],
		group: 'CoreSpeed',
		repo: 'https://github.com/corespeed-io/deckspeed-template',
		badge: 'Sunset',
	},
	{
		name: 'AG0',
		blurb:
			'A hosted agent builder where users described an idea, then edited the generated agent\'s files, skills, and runtime in a browser workspace.',
		started: '2026-02-10',
		tags: ['Zypher', 'Sandboxes', 'Templates'],
		group: 'CoreSpeed',
		repo: 'https://github.com/corespeed-io/agent0-template',
		badge: 'Sunset',
	},
	{
		name: 'xclaw',
		blurb:
			'One-click OpenClaw deployment on Railway, bundled with a model gateway, reusable skills, and multi-platform messaging.',
		started: '2026-03-05',
		tags: ['OpenClaw', 'Railway', 'Skills'],
		group: 'CoreSpeed',
		repo: 'https://github.com/corespeed-io/skills-xclaw',
		badge: 'Sunset',
	},
	{
		name: 'Sarea',
		blurb:
			'An ambient-computing app for Mac power users that ran agent tasks quietly in the background. Its billing and gateway work carried into CoreSpeed.',
		started: '2026-05-22',
		tags: ['macOS', 'Agents', 'AI Gateway'],
		group: 'CoreSpeed',
		badge: 'Sunset',
	},
	{
		name: 'BuildLog',
		blurb: "Turns a team's commits, PRs, and releases into draft posts for X, LinkedIn, and Bluesky.",
		started: '2026-03-17',
		tags: ['Next.js 16', 'Supabase', 'AI SDK'],
		group: 'Products',
		href: 'https://buildlog.ink',
		repo: 'https://github.com/spinsirr/buildlog',
		featured: true,
		badge: 'Live',
	},
	{
		name: 'Fixo',
		blurb:
			'A mobile-mechanic platform where an AI agent diagnoses faults, writes estimates, then handles scheduling and Stripe payments.',
		started: '2025-11-21',
		tags: ['Next.js', 'Deno + Hono', 'Stripe', 'AG-UI'],
		group: 'Products',
		href: 'https://github.com/hmls-autos/hmls',
		repo: 'https://github.com/hmls-autos/hmls',
		featured: true,
	},
	{
		name: 'Amazon Order Wizard',
		blurb:
			'An offline-first browser extension for tracking Amazon orders, with optional sync through a Rust and MongoDB API.',
		started: '2026-01-02',
		tags: ['Browser extension', 'React', 'Rust'],
		group: 'Products',
		href: 'https://github.com/spinsirr/order-wizard',
		repo: 'https://github.com/spinsirr/order-wizard',
		featured: true,
	},
	{
		name: 'Claude Max Gateway',
		blurb:
			'A dual-format API gateway that exposes OpenAI and Anthropic Messages APIs through the Claude Code CLI.',
		started: '2026-03-15',
		tags: ['TypeScript', 'LLM', 'Gateway'],
		group: 'Open source',
		href: 'https://github.com/spinsirr/claude-max-gateway',
		repo: 'https://github.com/spinsirr/claude-max-gateway',
		stars: 1,
		badge: 'OSS',
		featured: true,
	},
	{
		name: 'Zypher Agent',
		blurb:
			'A minimal, open-source framework for building AI agents with full control over tools, providers, and execution flow.',
		started: '2025-03-03',
		tags: ['TypeScript', 'Agents', 'Open source'],
		group: 'Open source',
		href: 'https://github.com/corespeed-io/zypher-agent',
		repo: 'https://github.com/corespeed-io/zypher-agent',
		stars: 329,
		badge: 'OSS',
		featured: true,
	},
	{
		name: 'Lore',
		blurb:
			'Open-source memory infrastructure for users and their agents, backed by Postgres, pgvector, and row-level security.',
		started: '2026-06-26',
		tags: ['Postgres', 'pgvector', 'RLS'],
		group: 'Open source',
		href: 'https://github.com/corespeed-io/lore',
		repo: 'https://github.com/corespeed-io/lore',
		stars: 5,
		badge: 'OSS',
	},
	{
		name: 'FPGA Clock',
		blurb: 'A multi-function digital clock built in Verilog, running on an FPGA.',
		started: '2021-12-22',
		tags: ['Verilog', 'FPGA', 'Hardware'],
		group: 'Hardware',
		href: 'https://github.com/spinsirr/FPGA_Clock',
		repo: 'https://github.com/spinsirr/FPGA_Clock',
		stars: 6,
		featured: true,
	},
	{
		name: 'Mini-UPS',
		blurb:
			'A USB-powered lithium-battery uninterruptible power supply for Raspberry Pi and low-power MCUs.',
		started: '2021-12-22',
		tags: ['Hardware', 'Power', 'Embedded'],
		group: 'Hardware',
		href: 'https://github.com/spinsirr/Mini-UPS',
		repo: 'https://github.com/spinsirr/Mini-UPS',
		stars: 5,
	},
];
