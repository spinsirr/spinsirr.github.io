// Single source of truth for site content.
// Edit values here and they update across every page.

export const SITE_TITLE = 'Spencer Zhao — Cofounder';
export const SITE_DESCRIPTION =
	'Spencer (Yunpeng) Zhao — Cofounder at CoreSpeed, connecting AI agents to the apps you already use. Builds and ships products end to end.';

export const PROFILE = {
	name: 'Spencer Zhao',
	fullName: 'Yunpeng "Spencer" Zhao',
	handle: 'spinsirr',
	role: 'Cofounder',
	company: 'CoreSpeed',
	companyUrl: 'https://corespeed.io',
	location: 'San Jose, CA',
	email: 'yunpeng@corespeed.io',
	subhead:
		'Cofounder at CoreSpeed, where we connect AI agents to the apps you already use — so they do real work, not just chat. I also build and ship products end to end. Based in San Jose, California.',
};

export const STATS = [
	{ value: '948', label: 'commits · last 12 mo' },
	{ value: '148', label: 'PRs · last 12 mo' },
	{ value: '37', label: 'public repos' },
	{ value: '2020', label: 'on GitHub since' },
];

export const WHATIDO = [
	{
		n: '01',
		title: 'CoreSpeed',
		body: 'The platform I am building: plug your AI agent into the apps you already use — 50+ via one OAuth — and it gets real work done. Connectors, built-in tools, memory, policy, and agent pay.',
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
		href: 'mailto:yunpeng@corespeed.io',
		icon: 'email',
		handle: 'yunpeng@corespeed.io',
	},
];

export const NAV = [
	{ href: '/', label: 'Home' },
	{ href: '/projects', label: 'Projects' },
	{ href: '/blog', label: 'Blog' },
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
	tags: string[];
	group: ProjectGroup;
	/** Primary link — live product or repo. */
	href?: string;
	/** Source link, when different from href. */
	repo?: string;
	stars?: number;
	featured?: boolean;
	/** Small label, e.g. "Live", "OSS". */
	badge?: string;
}

export const PROJECTS: Project[] = [
	{
		name: 'CoreSpeed',
		blurb:
			'Your AI agent is smart — now give it access. Plug your agent into 50+ apps through one OAuth and it gets real work done: connectors, built-in tools, memory, policy, and agent pay. Portable across Claude Code, Codex, and Cursor.',
		tags: ['Platform', 'Agents', 'Connectors'],
		group: 'CoreSpeed',
		href: 'https://corespeed.io',
		featured: true,
		badge: 'Live',
	},
	{
		name: 'BuildLog',
		blurb:
			"Turns your team's commits, PRs, and releases into marketing — AI drafts social posts you review and publish to X, LinkedIn, and Bluesky.",
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
			'Mobile-mechanic platform — an AI agent diagnoses car faults from a chat, writes the repair estimate, and drives scheduling and Stripe payments.',
		tags: ['Next.js', 'Deno + Hono', 'Stripe', 'AG-UI'],
		group: 'Products',
		href: 'https://github.com/hmls-autos/hmls',
		repo: 'https://github.com/hmls-autos/hmls',
		featured: true,
	},
	{
		name: 'Amazon Order Wizard',
		blurb:
			'Offline-first browser extension for tracking Amazon orders with optional cloud sync — a React 19 extension backed by a Rust (Axum) + MongoDB API.',
		tags: ['Browser extension', 'React', 'Rust'],
		group: 'Products',
		href: 'https://github.com/spinsirr/order-wizard',
		repo: 'https://github.com/spinsirr/order-wizard',
		featured: true,
	},
	{
		name: 'Claude Max Gateway',
		blurb:
			'Dual-format API gateway for a Claude Max subscription — exposes both OpenAI- and Anthropic-style Messages APIs through the Claude Code CLI.',
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
		tags: ['TypeScript', 'Agents', 'Open source'],
		group: 'Open source',
		href: 'https://github.com/corespeed-io/zypher-agent',
		repo: 'https://github.com/corespeed-io/zypher-agent',
		stars: 336,
		badge: 'OSS',
		featured: true,
	},
	{
		name: 'FPGA Clock',
		blurb: 'A multi-function digital clock built in Verilog, running on an FPGA.',
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
		tags: ['Hardware', 'Power', 'Embedded'],
		group: 'Hardware',
		href: 'https://github.com/spinsirr/Mini-UPS',
		repo: 'https://github.com/spinsirr/Mini-UPS',
		stars: 5,
	},
];

