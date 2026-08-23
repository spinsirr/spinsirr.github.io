import { writeFile } from 'node:fs/promises';

const username = 'spinsirr';
const snapshotUrl = new URL('../src/data/github-stats.json', import.meta.url);
const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

if (!token) {
	console.log('GitHub token unavailable; using the checked-in stats snapshot.');
	process.exit(0);
}

const to = new Date();
const from = new Date(to.getTime() - 365 * 24 * 60 * 60 * 1000);

const query = `
	query ProfileStats($login: String!, $from: DateTime!, $to: DateTime!) {
		user(login: $login) {
			createdAt
			repositories(first: 1, privacy: PUBLIC, ownerAffiliations: OWNER) {
				totalCount
			}
			contributionsCollection(from: $from, to: $to) {
				totalCommitContributions
				totalPullRequestContributions
			}
		}
	}
`;

try {
	const response = await fetch('https://api.github.com/graphql', {
		method: 'POST',
		headers: {
			Accept: 'application/vnd.github+json',
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json',
			'User-Agent': 'spinsirr.github.io',
			'X-GitHub-Api-Version': '2022-11-28',
		},
		body: JSON.stringify({
			query,
			variables: { login: username, from: from.toISOString(), to: to.toISOString() },
		}),
	});

	if (!response.ok) {
		throw new Error(`GitHub returned HTTP ${response.status}`);
	}

	const payload = await response.json();
	if (payload.errors?.length) {
		throw new Error(payload.errors.map((error) => error.message).join('; '));
	}

	const user = payload.data?.user;
	const contributions = user?.contributionsCollection;
	const snapshot = {
		commitsLast12Months: contributions?.totalCommitContributions,
		pullRequestsLast12Months: contributions?.totalPullRequestContributions,
		publicRepositories: user?.repositories?.totalCount,
		joinedYear: new Date(user?.createdAt).getUTCFullYear(),
		generatedAt: to.toISOString(),
		windowFrom: from.toISOString(),
		source: 'github-graphql',
	};

	for (const [key, value] of Object.entries(snapshot)) {
		if (key === 'source' || key === 'generatedAt' || key === 'windowFrom') continue;
		if (!Number.isInteger(value) || value < 0) {
			throw new Error(`GitHub returned an invalid ${key} value`);
		}
	}

	await writeFile(snapshotUrl, `${JSON.stringify(snapshot, null, 2)}\n`);
	console.log(`Refreshed GitHub stats for ${username} at ${snapshot.generatedAt}.`);
} catch (error) {
	console.warn(`Could not refresh GitHub stats; using the checked-in snapshot. ${error.message}`);
}
