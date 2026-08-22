import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import sharp from 'sharp';
import type { Post } from '../../utils/posts';
import { KIND_LABELS, published } from '../../utils/posts';

const escapeXml = (value: string) => value.replace(/[<>&'\"]/g, (character) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[character] ?? character);

function wrapTitle(title: string, limit = 25) {
	const words = title.split(/\s+/);
	const lines: string[] = [];
	for (const word of words) {
		const current = lines.at(-1);
		if (!current || current.length + word.length + 1 > limit) lines.push(word);
		else lines[lines.length - 1] = `${current} ${word}`;
	}
	return lines.slice(0, 4);
}

export const getStaticPaths = (async () => {
	const posts = published(await getCollection('blog'));
	return posts.map((post) => ({ params: { slug: post.id }, props: { post } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
	const post = props.post as Post;
	const lines = wrapTitle(post.data.title);
	const lineHeight = lines.length > 3 ? 82 : 94;
	const title = lines.map((line: string, index: number) => `<text x="82" y="${232 + index * lineHeight}" class="title">${escapeXml(line)}</text>`).join('');
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
		<rect width="1200" height="630" fill="#f4f3ee"/><defs><pattern id="g" width="12" height="12" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".6" fill="#100f0d" opacity=".08"/></pattern></defs><rect width="1200" height="630" fill="url(#g)"/>
		<path d="M82 62H1118M82 112H1118M82 568H1118" stroke="#100f0d" stroke-width="2"/><path d="M842 112V568" stroke="#100f0d" opacity=".18"/>
		<rect x="844" y="114" width="12" height="452" fill="#2438ff"/><rect x="844" y="420" width="12" height="80" fill="#100f0d"/>
		<style>.meta{font:500 18px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:3px;fill:#55534c}.title{font:800 72px Arial,sans-serif;letter-spacing:-3px;fill:#100f0d}.small{font:500 17px ui-monospace,SFMono-Regular,Menlo,monospace;fill:#55534c}</style>
		<text x="82" y="95" class="meta">SPENCER ZHAO / WRITING</text><text x="1118" y="95" text-anchor="end" class="meta">${escapeXml(KIND_LABELS[post.data.kind].toUpperCase())}</text>
		${title}<text x="895" y="180" class="small">ISSUE</text><text x="895" y="224" style="font:800 48px Arial,sans-serif;fill:#100f0d">${post.data.pubDate.getFullYear()}</text>
		<text x="895" y="505" class="small">SPINSIRR.GITHUB.IO</text><text x="82" y="603" class="small">NOTES ON AGENT INFRASTRUCTURE, MEMORY, AND SHIPPING SOFTWARE</text>
	</svg>`;
	const png = await sharp(Buffer.from(svg)).png().toBuffer();
	return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=31536000, immutable' } });
};
