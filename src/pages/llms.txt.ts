import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { PROFILE, PROJECTS, SOCIALS } from '../consts';
import { published } from '../utils/posts';

// /llms.txt — an index of the site for LLMs/agents (llmstxt.org convention).
export const GET: APIRoute = async ({ site }) => {
	const base = (site?.toString() || 'https://spinsirr.github.io').replace(/\/$/, '');
	const posts = published(await getCollection('blog'));
	const featured = PROJECTS.filter((p) => p.featured);

	const out: string[] = [];
	out.push(`# ${PROFILE.fullName}`);
	out.push('');
	out.push(
		`> ${PROFILE.role} at ${PROFILE.company}. Personal site with projects, writing on agent infrastructure and memory, and contact information. Based in ${PROFILE.location}.`,
	);
	out.push('');
	out.push(
		`Spencer builds infrastructure for cloud agents at CoreSpeed (${PROFILE.companyUrl}), with work across connectors, memory, gateways, billing, and the public product surface. He also builds complete products such as BuildLog and Fixo, and open-source systems including Lore, Zypher Agent, and Claude Max Gateway. Every blog post is available as raw Markdown by appending \`.md\` to its URL.`,
	);
	out.push('');
	out.push('## Pages');
	out.push('');
	out.push(`- [Home](${base}/): overview, selected work, and stack`);
	out.push(`- [Projects](${base}/projects/): CoreSpeed, products, open source, hardware`);
	out.push(`- [About](${base}/about/): bio, experience, education, and contact`);
	out.push(`- [Search](${base}/search/): full-text index of published writing`);
	out.push(`- [Archive](${base}/blog/archive/): chronological index of every post`);
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
