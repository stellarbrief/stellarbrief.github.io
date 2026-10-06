import { projects } from '../data/projects.js';

const SITE = 'https://stellarbrief.github.io';

// Every page of the site, derived from the same project list the pages are built from.
const paths = [
  '/',
  '/playground/',
  ...projects.map((p) => p.playground),
  ...projects.map((p) => `/projects/${p.slug}/`),
  '/contribute/',
];

export function GET() {
  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    paths.map((p) => `  <url><loc>${SITE}${p}</loc></url>`).join('\n') +
    `\n</urlset>\n`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
}
