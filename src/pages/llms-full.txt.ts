import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { PROFILE } from '../consts';

// /llms-full.txt — every blog post inline, in one fetch.
export const GET: APIRoute = async ({ site }) => {
	const base = (site?.toString() || 'https://spinsirr.github.io').replace(/\/$/, '');
	const posts = (await getCollection('blog')).sort(
		(a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
	);

	const out: string[] = [];
	out.push(`# ${PROFILE.fullName} — all writing`);
	out.push('');
	out.push(`> Every blog post in one file. Site: ${base}`);
	out.push('');
	for (const p of posts) {
		out.push('---');
		out.push('');
		out.push(`# ${p.data.title}`);
		out.push('');
		out.push(`Source: ${base}/blog/${p.id}/`);
		out.push('');
		out.push((p.body || '').trim());
		out.push('');
	}

	return new Response(out.join('\n'), {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' },
	});
};
