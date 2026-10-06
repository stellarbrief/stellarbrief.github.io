import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

// Build-time only. Everything here reads what `npm run sync` pulled from the repositories at the
// commits pinned in sources.lock.json.
const ROOT = join(process.cwd(), 'synced');

export async function readSynced(repo, path) {
  return readFile(join(ROOT, repo, path), 'utf8');
}

export async function readSyncedJson(repo, path) {
  return JSON.parse(await readSynced(repo, path));
}

export async function readSyncedIfPresent(repo, path) {
  try {
    return await readSynced(repo, path);
  } catch (err) {
    if (err && err.code === 'ENOENT') return null;
    throw err;
  }
}

export async function loadManifest() {
  return JSON.parse(await readFile(join(ROOT, 'manifest.json'), 'utf8'));
}

export async function loadGithub() {
  return JSON.parse(await readFile(join(ROOT, 'github.json'), 'utf8'));
}

export function shortSha(sha) {
  return sha.slice(0, 7);
}
