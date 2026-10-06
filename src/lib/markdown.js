import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

const ORG = 'stellarbrief';

function isAbsoluteOrAnchor(url) {
  return /^(?:[a-z][a-z0-9+.-]*:|#|\/\/)/i.test(url);
}

/** Resolves a path relative to the markdown file's own directory (posix, no escaping the root). */
export function resolveRepoPath(fromFile, relative) {
  const parts = fromFile.split('/').slice(0, -1);
  for (const segment of relative.split('/')) {
    if (segment === '' || segment === '.') continue;
    if (segment === '..') parts.pop();
    else parts.push(segment);
  }
  return parts.join('/');
}

/**
 * Renders a repository markdown file to sanitized HTML. Relative links become links to the file
 * at the pinned commit on GitHub (the repository stays the source of truth), relative images
 * point at the raw file at that commit, and anything outside a small allowlist is removed.
 */
export async function renderMarkdown(markdown, { repo, sha, file, dropFirstHeading = false }) {
  const source = dropFirstHeading ? markdown.replace(/^#\s+.*\n+/, '') : markdown;
  const html = await marked.parse(source, { gfm: true });

  return sanitizeHtml(html, {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img', 'h1', 'h2'],
    allowedAttributes: {
      a: ['href', 'title', 'rel'],
      img: ['src', 'alt', 'title'],
      code: ['class'],
      th: ['align'],
      td: ['align'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowProtocolRelative: false,
    transformTags: {
      a: (tagName, attribs) => {
        const href = attribs.href ?? '';
        const resolved = isAbsoluteOrAnchor(href)
          ? href
          : `https://github.com/${ORG}/${repo}/blob/${sha}/${resolveRepoPath(file, href)}`;
        return { tagName, attribs: { ...attribs, href: resolved, rel: 'noopener noreferrer' } };
      },
      img: (tagName, attribs) => {
        const src = attribs.src ?? '';
        const resolved = isAbsoluteOrAnchor(src)
          ? src
          : `https://raw.githubusercontent.com/${ORG}/${repo}/${sha}/${resolveRepoPath(file, src)}`;
        return { tagName, attribs: { ...attribs, src: resolved } };
      },
    },
  });
}

/** Pulls one section out of a markdown file, from its heading to the next heading of the same
 * or a higher level, or null if the heading is absent. `level` is the number of `#` characters. */
export function extractSection(markdown, heading, level = 2) {
  const marker = '#'.repeat(level);
  const lines = markdown.split('\n');
  const start = lines.findIndex((l) => l.trim() === `${marker} ${heading}`);
  if (start < 0) return null;
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    const m = /^(#{1,6})\s/.exec(lines[i]);
    if (m && m[1].length <= level) {
      end = i;
      break;
    }
  }
  return lines.slice(start, end).join('\n').trim();
}
