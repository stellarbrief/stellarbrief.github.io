// Gives the headings of rendered Markdown an id, so a page can offer a list of what is on it and a link to any section.
// The Markdown renderer's output goes through a sanitizer that keeps no attributes on a heading, so a heading arrives bare
// (`<h2>Text</h2>`), and the ids are added here, after sanitizing, from the heading's own text.

const ENTITIES = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&#x27;': "'" };

function plainText(html) {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&(?:amp|lt|gt|quot|#39|#x27);/g, (entity) => ENTITIES[entity])
    .replace(/\s+/g, ' ')
    .trim();
}

/** Lower-case words joined by hyphens: "Known limitations (v0.1)" becomes "known-limitations-v0-1". */
export function slugify(text) {
  const slug = text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug === '' ? 'section' : slug;
}

/**
 * The same HTML with an id on every heading of the wanted levels, and the list of those headings in order. A second heading
 * with the same words gets `-2`, a third `-3`, so no id is used twice on a page.
 */
export function withHeadingIds(html, { levels = [2, 3], prefix = '' } = {}) {
  const wanted = new Set(levels.map(String));
  const used = new Map();
  const headings = [];
  const output = html.replace(/<h([1-6])>([\s\S]*?)<\/h\1>/g, (whole, level, inner) => {
    if (!wanted.has(level)) return whole;
    const text = plainText(inner);
    const base = prefix + slugify(text);
    const seen = used.get(base) ?? 0;
    used.set(base, seen + 1);
    const id = seen === 0 ? base : `${base}-${seen + 1}`;
    headings.push({ level: Number(level), id, text });
    return `<h${level} id="${id}">${inner}</h${level}>`;
  });
  return { html: output, headings };
}
