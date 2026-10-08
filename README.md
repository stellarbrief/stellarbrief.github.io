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

## Design and navigation

The site has one theme: light pages with navy bands, in the colours of the logo. There is no dark theme yet, on purpose: it
is a good thing for a contributor to add. Type is [Inter](https://rsms.me/inter/), self-hosted from the
`@fontsource-variable/inter` package, so the site asks no other site for anything (SIL Open Font License 1.1, text in
`public/inter-OFL.txt`).

Getting around is the point of the layout:

- **A header that stays put**, with the three tools always one click away under the names of what they are (Preflight, Drill,
  Advisory), then Playground. On a phone it is a menu that works without scripting (`<details>`), with large targets and the
  current page marked.
- **Where you are**: breadcrumbs, and on a tool's page and its playground a bar with the three tools and that tool's views
  (About, See it work, GitHub), so you can hop between them without going back home. The foot of each page offers the previous
  and next tool.
- **Long pages have a list of their parts**: "On this page" beside a tool's page, built from the README's own headings
  (`src/lib/headings.js` gives them ids), and above it on a phone. Anchors land below the header.
- **The home page starts from a question** ("I write Soroban contracts", "I run a validator", "I have to explain an
  advisory"), not from the list of repositories.
- **The footer is a small sitemap**, and a missing page lists where to go.

## What the site is for

It helps someone affected by a Stellar protocol upgrade answer a question, and decide whether to trust these tools: what each
tool answers, real recorded proof, its honest limits, and where to get it. It is for people who use the tools.

It deliberately has no page for contributors and no list of open issues. They change daily and belong where they can be
searched and filtered, which is GitHub; each repository's `CONTRIBUTING.md` says how to help, and a tool's page links to its
issues and to a way to report a security problem. Anything about the work of building the tools stays in the repositories.

Motion is there to help, and every piece is optional. Where the browser can tie animation to scrolling, a line fills as you read,
cards rise into place and a "Top" button appears; where it can, moving between pages is a short cross-fade
(`@view-transition`). All of it sits inside `@supports`, the plain state is the finished one, and a person who has asked their
system for less motion gets none.

## What has been verified, and what hasn't

Checked after the redesign (2026-10-08):

- `npm test` (22 tests) passes, and the site builds from a clean `npm ci` on Linux as well as on Windows.
- The three playgrounds' scripts still run in a real browser (headless Edge): recorded results render on each.
- At 390 and 320 pixels wide, no page scrolls sideways (measured, not judged by eye), and every page has exactly one `h1`.
- Colour contrast: every colour pair the design uses (text, links, labels, the text on the navy bands and the footer, focus
  rings) was calculated, 26 pairs in all, and the lowest is 4.56:1. That was a one-off calculation, not a test.
- The phone menu opens and closes, marks the current page, and fits at 320 pixels.

Not re-checked since the redesign, because the earlier checks were of the old pages: use of the playground controls from the
keyboard, console errors with developer tools open, heading levels beyond "one `h1`", and the labels on form controls (their
markup is unchanged).

Not verified:

- Screen readers. Nothing here was tested with assistive technology.
- A real phone, and any browser other than Edge: mobile widths were emulated, and Firefox and Safari were not tried.
- The Content-Security-Policy is not set. Scripts are emitted as files so one can be added, but it should be added
  only after checking the playgrounds with it on, because a wrong policy would silently break them.
- The checks above are not tests. Nothing in the repository fails if a page gets a second `h1` or a colour loses contrast.

## License

MIT. See [`LICENSE`](LICENSE).
