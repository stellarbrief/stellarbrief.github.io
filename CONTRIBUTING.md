# Contributing

This is the website for [StellarBrief](https://github.com/stellarbrief). It shows what the three tool repositories actually do,
so most of what is worth changing here is how faithfully it shows it. Read the "Principles" section of the
[README](README.md) first; they are the rules for every change.

## Setup

Needs Node 22.12 or newer.

```bash
npm ci
npm run sync     # fetch the pinned content from the tool repositories (needs network)
npm test         # unit tests for the helpers in src/lib
npm run build    # sync, then build to dist/
npm run dev      # a local server
```

Set `GITHUB_TOKEN` to avoid GitHub's low unauthenticated API limit when syncing.

## Rules that every change follows

- **Every result carries a label.** **Live**, **Generated**, **Recorded**, **Example** or **Simulated**, with its source and, where
  it applies, its date. The build fails when a result has none (`src/lib/provenance.js`). Do not work around it.
- **Never hand-edit anything under `synced/`.** It is rebuilt from the tool repositories at the commits pinned in
  `sources.lock.json`. To change documentation, change it in the tool repository, then bump the pin here.
- **No invented numbers, and nothing pretends to run a tool it is not running.** The playgrounds run the tools' own analysis
  code on recorded real results.
- **No backend.** No accounts, database, analytics, keys or wallet.

## Branch and pull request flow

1. Fork, then branch from `main`.
2. Make the change and run `npm test` and `npm run build`.
3. Open a pull request against `main`. CI runs the same two commands and must pass before merge.
4. If you bumped a pin in `sources.lock.json`, say which commits and look at the rendered pages: the diff of a lock file does not
   show what changed on the site.

## Picking up an issue

Open issues are on the [issues page](https://github.com/stellarbrief/stellarbrief.github.io/issues). Comment on one to say you
would like it, and wait for the maintainer to assign it to you before you start. A comment alone does not reserve it. If an
assigned issue has had no activity for 7 days, the maintainer may ask whether you are still working on it, and may unassign it
after 7 more days without a reply.

## Your first pull request

The first time you open a pull request, GitHub holds its CI run until a maintainer approves it, so the checks show nothing for a
while. That is a GitHub setting, not broken CI. The maintainer approves the run when they review.

## AI-assisted contributions

AI-assisted contributions are welcome, as is this project's own use of AI assistance. You are responsible for what you submit: you
have run it, you understand it, and every claim in the description is true. Pull requests are reviewed the same way whoever or
whatever wrote them.

## How maintainers work here

There is currently one maintainer. Response times are best effort, with no guaranteed turnaround. A bug is reproduced before a fix
is accepted.

## Reporting a security problem

Not in a public issue. See [`SECURITY.md`](SECURITY.md).
