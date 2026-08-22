import type { CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'blog'>;

export const KIND_LABELS: Record<Post['data']['kind'], string> = {
	research: 'Research',
	essay: 'Essay',
	'field-note': 'Field note',
	'project-note': 'Project note',
};

export function published(posts: Post[]) {
	return posts
		.filter((post) => !post.data.draft)
		.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export function readingTime(post: Post) {
	const text = (post.body ?? '')
		.replace(/```[\s\S]*?```/g, ' ')
		.replace(/<[^>]+>/g, ' ')
		.replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
		.replace(/[#[\]()*_>`~-]/g, ' ');
	const latinWords = text.match(/[A-Za-z0-9][A-Za-z0-9'’-]*/g)?.length ?? 0;
	const cjkCharacters = text.match(/[\u3400-\u9fff]/g)?.length ?? 0;
	return Math.max(1, Math.ceil(latinWords / 220 + cjkCharacters / 420));
}

export function tagSlug(tag: string) {
	return tag
		.toLowerCase()
		.trim()
		.replace(/&/g, 'and')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');
}

export function allTags(posts: Post[]) {
	const tags = new Map<string, { name: string; count: number }>();
	for (const post of posts) {
		for (const tag of post.data.tags) {
			const slug = tagSlug(tag);
			const current = tags.get(slug);
			tags.set(slug, { name: current?.name ?? tag, count: (current?.count ?? 0) + 1 });
		}
	}
	return [...tags.entries()]
		.map(([slug, value]) => ({ slug, ...value }))
		.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export function relatedPosts(post: Post, posts: Post[], limit = 3) {
	return posts
		.filter((candidate) => candidate.id !== post.id)
		.map((candidate) => {
			const sharedTags = candidate.data.tags.filter((tag) => post.data.tags.includes(tag)).length;
			const sameSeries =
				post.data.series?.slug && candidate.data.series?.slug === post.data.series.slug ? 4 : 0;
			const sameKind = candidate.data.kind === post.data.kind ? 1 : 0;
			return { candidate, score: sharedTags * 2 + sameSeries + sameKind };
		})
		.sort(
			(a, b) =>
				b.score - a.score || b.candidate.data.pubDate.valueOf() - a.candidate.data.pubDate.valueOf(),
		)
		.slice(0, limit)
		.map(({ candidate }) => candidate);
}
