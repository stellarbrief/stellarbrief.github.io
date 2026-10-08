import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { slugify, withHeadingIds } from './headings.js';

describe('slugify', () => {
  it('makes lower-case words joined by hyphens', () => {
    assert.equal(slugify('Known limitations (v0.1)'), 'known-limitations-v0-1');
    assert.equal(slugify('  How it works  '), 'how-it-works');
  });

  it('drops accents, and never returns an empty id', () => {
    assert.equal(slugify('Résumé'), 'resume');
    assert.equal(slugify('???'), 'section');
  });
});

describe('withHeadingIds', () => {
  it('adds an id to each wanted heading and lists them in order', () => {
    const { html, headings } = withHeadingIds('<h2>Install</h2><p>x</p><h3>From source</h3>');
    assert.equal(html, '<h2 id="install">Install</h2><p>x</p><h3 id="from-source">From source</h3>');
    assert.deepEqual(headings, [
      { level: 2, id: 'install', text: 'Install' },
      { level: 3, id: 'from-source', text: 'From source' },
    ]);
  });

  it('numbers a repeated heading so no id is used twice', () => {
    const { headings } = withHeadingIds('<h2>Usage</h2><h2>Usage</h2><h2>Usage</h2>');
    assert.deepEqual(headings.map((h) => h.id), ['usage', 'usage-2', 'usage-3']);
  });

  it('reads the words of a heading, not its markup or its entities', () => {
    const { headings } = withHeadingIds('<h2>Using <code>npm run &lt;x&gt;</code> &amp; more</h2>');
    assert.equal(headings[0].text, 'Using npm run <x> & more');
    assert.equal(headings[0].id, 'using-npm-run-x-more');
  });

  it('leaves the other heading levels alone, unless asked', () => {
    const page = '<h1>Title</h1><h2>Part</h2><h4>Detail</h4>';
    assert.equal(withHeadingIds(page).html, '<h1>Title</h1><h2 id="part">Part</h2><h4>Detail</h4>');
    assert.deepEqual(withHeadingIds(page, { levels: [4] }).headings.map((h) => h.id), ['detail']);
  });

  it('puts a prefix in front of every id, so two pieces of one page cannot clash', () => {
    const { headings } = withHeadingIds('<h2>Limits</h2>', { prefix: 'readme-' });
    assert.equal(headings[0].id, 'readme-limits');
  });

  it('changes nothing in text with no headings', () => {
    const { html, headings } = withHeadingIds('<p>No headings here.</p>');
    assert.equal(html, '<p>No headings here.</p>');
    assert.deepEqual(headings, []);
  });
});
