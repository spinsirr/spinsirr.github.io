// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	// Change this to your deployed URL (e.g. a Vercel domain or custom domain).
	site: 'https://spinsirr-web.vercel.app',
	integrations: [mdx(), sitemap()],
	fonts: [
		{
			name: 'Bricolage Grotesque',
			cssVariable: '--font-display',
			provider: fontProviders.google(),
			weights: [400, 600, 700, 800],
			subsets: ['latin'],
			fallbacks: ['ui-sans-serif', 'system-ui', 'sans-serif'],
		},
		{
			name: 'Inter',
			cssVariable: '--font-sans',
			provider: fontProviders.google(),
			weights: [400, 500, 600],
			subsets: ['latin'],
			fallbacks: ['ui-sans-serif', 'system-ui', 'sans-serif'],
		},
		{
			name: 'JetBrains Mono',
			cssVariable: '--font-mono',
			provider: fontProviders.google(),
			weights: [400, 500],
			subsets: ['latin'],
			fallbacks: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
		},
	],
});
