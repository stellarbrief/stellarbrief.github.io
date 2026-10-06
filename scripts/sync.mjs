// Pulls the files this site shows from the three StellarBrief repositories, at the exact commits
// pinned in sources.lock.json, into synced/ (gitignored). Documentation is never hand-copied:
// change the source repository and bump the lock instead.
//
// Also records a small amount of GitHub data (open issues, latest release) fetched now, at build
// time. That data is "Recorded as of <fetchedAt>", not live, and failing to fetch it is not fatal.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const OUT = 'synced';
const RAW = 'https://raw.githubusercontent.com';
const API = 'https://api.github.com';

const lock = JSON.parse(await readFile('sources.lock.json', 'utf8'));
const org = lock.org;

function githubHeaders() {
  const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'stellarbrief-site-sync' };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return headers;
}

async function fetchPinnedFile(repo, sha, path) {
  const res = await fetch(`${RAW}/${org}/${repo}/${sha}/${path}`);
  if (!res.ok) return { ok: false, status: res.status };
  const body = await res.text();
  if (body.length === 0) throw new Error(`${repo}@${sha.slice(0, 7)}:${path} is empty`);
  return { ok: true, body };
}

async function syncRepo(repo, spec) {
  if (!/^[0-9a-f]{40}$/.test(spec.sha)) {
    throw new Error(`${repo}: sha in sources.lock.json must be a full 40-character commit hash`);
  }
  const written = [];
  const skipped = [];
  const wanted = [
    ...spec.files.map((path) => ({ path, optional: false })),
    ...(spec.optional ?? []).map((path) => ({ path, optional: true })),
  ];
  for (const { path, optional } of wanted) {
    const result = await fetchPinnedFile(repo, spec.sha, path);
    if (!result.ok) {
      if (optional && result.status === 404) {
        skipped.push(path);
        console.warn(`skipped optional ${repo}:${path} (not present at ${spec.sha.slice(0, 7)})`);
        continue;
      }
      throw new Error(`${repo}@${spec.sha.slice(0, 7)}:${path} could not be fetched (HTTP ${result.status})`);
    }
    const target = join(OUT, repo, path);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, result.body, 'utf8');
    written.push(path);
  }
  return { sha: spec.sha, files: written, skipped };
}

async function fetchGithubData(repo) {
  const base = `${API}/repos/${org}/${repo}`;
  const data = { repoUrl: `https://github.com/${org}/${repo}`, openIssues: [], latestRelease: null };
  const issuesRes = await fetch(`${base}/issues?state=open&per_page=100`, { headers: githubHeaders() });
  if (!issuesRes.ok) throw new Error(`issues: HTTP ${issuesRes.status}`);
  const issues = await issuesRes.json();
  data.openIssues = issues
    .filter((issue) => !issue.pull_request)
    .map((issue) => ({
      number: issue.number,
      title: issue.title,
      url: issue.html_url,
      labels: issue.labels.map((l) => (typeof l === 'string' ? l : l.name)),
    }));
  const releaseRes = await fetch(`${base}/releases/latest`, { headers: githubHeaders() });
  if (releaseRes.ok) {
    const release = await releaseRes.json();
    data.latestRelease = { tag: release.tag_name, url: release.html_url, publishedAt: release.published_at };
  } else if (releaseRes.status !== 404) {
    throw new Error(`releases: HTTP ${releaseRes.status}`);
  }
  return data;
}

const manifest = { syncedAt: new Date().toISOString(), repos: {} };
for (const [repo, spec] of Object.entries(lock.repos)) {
  manifest.repos[repo] = await syncRepo(repo, spec);
  console.log(`synced ${repo} at ${spec.sha.slice(0, 7)}: ${manifest.repos[repo].files.length} files`);
}
await writeFile(join(OUT, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

const github = { fetchedAt: new Date().toISOString(), repos: {} };
for (const repo of Object.keys(lock.repos)) {
  try {
    github.repos[repo] = await fetchGithubData(repo);
  } catch (err) {
    console.warn(`GitHub data for ${repo} could not be fetched: ${err.message}`);
    github.repos[repo] = { repoUrl: `https://github.com/${org}/${repo}`, error: err.message, openIssues: [], latestRelease: null };
  }
}
await writeFile(join(OUT, 'github.json'), `${JSON.stringify(github, null, 2)}\n`, 'utf8');
console.log('wrote synced/manifest.json and synced/github.json');
