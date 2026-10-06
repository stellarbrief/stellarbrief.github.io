# stellarbrief.github.io

The website for [StellarBrief](https://github.com/stellarbrief): a front door, documentation layer and
demonstration layer for three repositories. It is not a product of its own. The repositories are the source
of truth, and this site shows what they actually do.

- [`advisory-brief`](https://github.com/stellarbrief/advisory-brief)
- [`upgrade-preflight`](https://github.com/stellarbrief/upgrade-preflight)
- [`upgrade-drill`](https://github.com/stellarbrief/upgrade-drill)

## Principles

- **Evidence over appearance.** Every result shown is labeled **Live**, **Generated**, **Recorded**,
  **Example** or **Simulated**, with its source and date. The build fails if a result has no label
  (`src/lib/provenance.js`). No number is invented, and nothing pretends to run a tool it isn't running.
- **One source of documentation.** Pages are rendered from the repositories' own files, pinned to a commit in
  `sources.lock.json`. Don't hand-edit anything under `synced/` (it is gitignored). Change the source
  repository and bump the lock.
- **No backend.** A static site: no accounts, no database, no analytics, no keys, no wallet. Anything that would
  need a server-side secret is out of scope.

## How it works

`npm run sync` downloads the pinned files from the three repositories into `synced/` and records a little
GitHub data (open issues, latest release) fetched at that moment. The pages read from `synced/` at build time.
The playgrounds run the tools' own analysis code (for example the Upgrade Preflight diff engine) in the browser,
on recorded real results. They never run a Stellar network.

## Develop

Needs Node 22.12 or newer.

```bash
npm install
npm run sync     # fetch the pinned content (needs network)
npm run dev
npm test         # unit tests for the helpers in src/lib
npm run build    # sync, then build to dist/
```

Set `GITHUB_TOKEN` to avoid GitHub's low unauthenticated API limit when syncing; the sync still works without it.

## Updating what the site shows

1. In the source repository, make the change (docs, a new real sample in `docs/samples/`, and so on) and push it.
2. In `sources.lock.json`, set that repository's `sha` to the new commit, and add any new file to its `files` list.
3. Run `npm run build`, look at the pages, and open a PR.

## Deploying

GitHub Pages, from `.github/workflows/deploy.yml` (set Pages' source to "GitHub Actions" in the repository
settings). It rebuilds on every push to `main` and daily, so the build-time GitHub data stays recent.

## What has been verified, and what hasn't

Verified: the helper tests pass (`npm test`), the site builds from the pinned commits, and the three
playgrounds were exercised in a desktop browser against the built output (scenario switching, the replay
slider, the editable threshold re-running the real diff engine, the quorum calculator, and the advisory
recount).

Not verified yet:

- Mobile layout, the dark theme, keyboard-only use and screen readers. The markup follows the accessibility
  plan (labels, a table equivalent for every visual, visible focus), but it hasn't been tested with these.
- Deployment to GitHub Pages.
- The Content-Security-Policy is not set. Scripts are now emitted as files so one can be added, but it should be
  added only after checking the playgrounds in a browser with it on, because a wrong policy would silently
  break them.

## License

MIT. See [`LICENSE`](LICENSE).
