import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { PROFILE, PROJECTS, SOCIALS } from '../consts';

// /llms.txt — an index of the site for LLMs/agents (llmstxt.org convention).
export const GET: APIRoute = async ({ site }) => {
	const base = (site?.toString() || 'https://spinsirr.github.io').replace(/\/$/, '');
	const posts = (await getCollection('blog')).sort(
		(a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
	);
	const featured = PROJECTS.filter((p) => p.featured);

	const out: string[] = [];
	out.push(`# ${PROFILE.fullName}`);
	out.push('');
	out.push(
		`> ${PROFILE.role} at ${PROFILE.company} — the access and control layer for AI agents. Personal site: projects, writing on AI agents and infrastructure, and contact. Based in ${PROFILE.location}.`,
	);
	out.push('');
	out.push(
		`Spencer builds CoreSpeed (${PROFILE.companyUrl}): connect an AI agent to 50+ apps through one OAuth, with built-in tools, memory, plain-English policy, and agent pay. He also ships products end to end (BuildLog, Fixo) and open source (Zypher Agent, Claude Max Gateway). Every blog post is available as raw Markdown by appending \`.md\` to its URL.`,
	);
	out.push('');
	out.push('## Pages');
	out.push('');
	out.push(`- [Home](${base}/): overview, selected work, and stack`);
	out.push(`- [Projects](${base}/projects/): CoreSpeed, products, open source, hardware`);
	out.push(`- [About](${base}/about/): bio, experience, education, and contact`);
	out.push('');
	out.push('## Writing');
	out.push('');
	for (const p of posts) {
		out.push(`- [${p.data.title}](${base}/blog/${p.id}.md): ${p.data.description}`);
	}
	out.push('');
	out.push('## Projects');
	out.push('');
	for (const p of featured) {
		if (p.href) out.push(`- [${p.name}](${p.href}): ${p.blurb}`);
	}
	out.push('');
	out.push('## Links');
	out.push('');
	for (const s of SOCIALS) {
		out.push(`- ${s.name}: ${s.href}`);
	}
	out.push('');

	return new Response(out.join('\n'), {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' },
	});
};
