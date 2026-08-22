import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			kind: z.enum(['research', 'essay', 'field-note', 'project-note']).default('essay'),
			tags: z.array(z.string()).default([]),
			featured: z.boolean().default(false),
			draft: z.boolean().default(false),
			series: z
				.object({
					slug: z.string(),
					title: z.string(),
					order: z.number().int().positive(),
				})
				.optional(),
			heroImage: z.optional(image()),
			ogImage: z.string().optional(),
		}),
});

export const collections = { blog };
