// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import expressiveCode from 'astro-expressive-code';
import { defineConfig, fontProviders } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	// Deployed to GitHub Pages (user site, served at the root).
	site: 'https://spinsirr.github.io',
	integrations: [expressiveCode(), mdx(), sitemap()],
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
			name: 'Newsreader',
			cssVariable: '--font-serif',
			provider: fontProviders.google(),
			weights: [400, 500, 700],
			subsets: ['latin'],
			fallbacks: ['Iowan Old Style', 'Baskerville', 'Times New Roman', 'serif'],
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
