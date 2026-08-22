import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { published } from '../../utils/posts';

// Raw markdown for each post at /blog/<slug>.md — easy to copy or hand to an agent.
export async function getStaticPaths() {
	const posts = published(await getCollection('blog'));
	return posts.map((post) => ({ params: { slug: post.id }, props: { post } }));
}

export const GET: APIRoute = ({ props }) => {
	const post = (props as { post: { data: { title: string }; body?: string } }).post;
	const md = `# ${post.data.title}\n\n${post.body ?? ''}`;
	return new Response(md, {
		headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
	});
};
