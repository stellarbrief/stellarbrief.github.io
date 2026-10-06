import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { descriptionFromYaml, expectationFromYaml, framesFromTimeline, quorumRequired } from './drill.js';
import { extractSection, renderMarkdown, resolveRepoPath } from './markdown.js';
import { assertProvenance, fromSampleProvenance } from './provenance.js';

describe('provenance', () => {
  const ok = { kind: 'Recorded', source: 'a real run', date: '2026-10-06T00:00:00Z' };

  it('accepts a complete record and normalizes optional fields to null', () => {
    const p = assertProvenance(ok, 'test');
    assert.equal(p.kind, 'Recorded');
    assert.equal(p.url, null);
  });

  it('rejects a missing record, an unknown kind and an empty source', () => {
    assert.throws(() => assertProvenance(undefined, 'x'), /missing provenance/);
    assert.throws(() => assertProvenance({ ...ok, kind: 'Real' }, 'x'), /must be one of/);
    assert.throws(() => assertProvenance({ ...ok, source: '  ' }, 'x'), /non-empty source/);
  });

  it('requires a date for Recorded, Generated and Live but not for Example or Simulated', () => {
    for (const kind of ['Recorded', 'Generated', 'Live']) {
      assert.throws(() => assertProvenance({ kind, source: 's' }, 'x'), /needs a date/);
    }
    assert.doesNotThrow(() => assertProvenance({ kind: 'Example', source: 's' }, 'x'));
    assert.doesNotThrow(() => assertProvenance({ kind: 'Simulated', source: 's' }, 'x'));
  });

  it('reads a sample provenance file as written in the tool repositories', () => {
    const p = fromSampleProvenance(
      { kind: 'Recorded', source: 'workflow', capturedAt: '2026-10-05T22:32:34Z', runUrl: 'https://example.test/run', commit: 'abc1234', notes: ['first'] },
      'sample'
    );
    assert.equal(p.date, '2026-10-05T22:32:34Z');
    assert.equal(p.url, 'https://example.test/run');
    assert.equal(p.note, 'first');
  });
});

describe('markdown rendering', () => {
  const ctx = { repo: 'upgrade-drill', sha: 'a'.repeat(40), file: 'README.md' };

  it('turns a relative link into a link to that file at the pinned commit', async () => {
    const html = await renderMarkdown('[arch](docs/ARCHITECTURE.md)', ctx);
    assert.match(html, new RegExp(`https://github.com/stellarbrief/upgrade-drill/blob/${'a'.repeat(40)}/docs/ARCHITECTURE.md`));
  });

  it('resolves links relative to the file that contains them', async () => {
    const html = await renderMarkdown('[up](../README.md)', { ...ctx, file: 'docs/ARCHITECTURE.md' });
    assert.match(html, /blob\/a{40}\/README\.md/);
    assert.equal(resolveRepoPath('docs/samples/README.md', '../../scenarios/x.yml'), 'scenarios/x.yml');
  });

  it('leaves absolute and anchor links alone and adds rel to links', async () => {
    const html = await renderMarkdown('[a](https://example.test/x) [b](#top)', ctx);
    assert.match(html, /href="https:\/\/example\.test\/x"/);
    assert.match(html, /href="#top"/);
    assert.match(html, /rel="noopener noreferrer"/);
  });

  it('removes scripts, event handlers and javascript: links', async () => {
    const html = await renderMarkdown(
      '<script>alert(1)</script>\n\n<img src="x" onerror="alert(1)">\n\n[x](javascript:alert(1))',
      ctx
    );
    assert.doesNotMatch(html, /<script/i);
    assert.doesNotMatch(html, /onerror/i);
    assert.doesNotMatch(html, /javascript:/i);
  });

  it('can drop the first heading', async () => {
    const html = await renderMarkdown('# Title\n\ntext', { ...ctx, dropFirstHeading: true });
    assert.doesNotMatch(html, /Title/);
    assert.match(html, /text/);
  });

  it('extracts a section up to the next heading of the same or higher level', () => {
    const md = '# T\n\n## A\n\na\n\n### A1\n\nsub\n\n## B\n\nb\n';
    assert.equal(extractSection(md, 'A'), '## A\n\na\n\n### A1\n\nsub');
    assert.equal(extractSection(md, 'A1', 3), '### A1\n\nsub');
    assert.equal(extractSection(md, 'Missing'), null);
  });
});

describe('drill helpers', () => {
  const row = (node, t, ledger) => ({ timestampMs: t, node, ledgerNum: ledger, protocolVersion: 0, state: 'Synced!' });

  it('groups a timeline into one frame per poll cycle', () => {
    const frames = framesFromTimeline(
      [row('a', 1000, 1), row('b', 1005, 1), row('a', 11000, 2), row('b', 11004, 2)],
      ['a', 'b']
    );
    assert.equal(frames.length, 2);
    assert.equal(frames[1].elapsedSeconds, 10);
    assert.deepEqual(frames[1].rows.map((r) => r.ledgerNum), [2, 2]);
  });

  it('refuses a timeline that does not divide into frames or has nodes out of order', () => {
    assert.throws(() => framesFromTimeline([row('a', 1, 1), row('b', 2, 1), row('a', 3, 2)], ['a', 'b']), /does not divide/);
    assert.throws(() => framesFromTimeline([row('b', 1, 1), row('a', 2, 1)], ['a', 'b']), /expected a but found b/);
  });

  it('reads the description and expectation from scenario text', () => {
    const yaml = '# comment\nname: x\ndescription: One validator never gets the vote.\nexpectations:\n  finalProtocolVersion: 29\n  nodesShouldStaySynced: [node1, node2]\n';
    assert.equal(descriptionFromYaml(yaml), 'One validator never gets the vote.');
    assert.deepEqual(expectationFromYaml(yaml), { finalProtocolVersion: 29, nodesShouldStaySynced: ['node1', 'node2'] });
    assert.deepEqual(expectationFromYaml('name: y\n'), { finalProtocolVersion: null, nodesShouldStaySynced: null });
  });

  it('rounds the quorum threshold up, matching the recorded runs', () => {
    assert.equal(quorumRequired(3, 67), 3);
    assert.equal(quorumRequired(5, 67), 4);
    assert.equal(quorumRequired(4, 75), 3);
  });
});
