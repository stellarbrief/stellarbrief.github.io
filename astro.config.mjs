import { defineConfig } from 'astro/config';

// Served by GitHub Pages at the root of stellarbrief.github.io, so there is no base path.
export default defineConfig({
  site: 'https://stellarbrief.github.io',
  output: 'static',
  trailingSlash: 'always',
  vite: {
    build: {
      // Emit every script as a file instead of inlining small ones into the HTML, so a strict
      // Content-Security-Policy (script-src 'self') can be applied without breaking the playgrounds.
      assetsInlineLimit: 0,
    },
  },
});
