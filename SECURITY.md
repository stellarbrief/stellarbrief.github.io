# Security Policy

## Reporting a vulnerability

Please do not open a public issue for a security problem. Use GitHub's
[private vulnerability reporting](https://github.com/stellarbrief/stellarbrief.github.io/security/advisories/new) for this
repository. If that page is not available to you, open a public issue that says only "I have a security report" and a maintainer
will arrange a private channel. Do not put details in the issue.

## Scope

This is a static site with no server, accounts, database or keys. It renders Markdown from the other StellarBrief repositories at
pinned commits and runs those tools' analysis code in the browser. Concerns that belong here:

- A way for content from a synced file, or from the GitHub data fetched at build time, to run script or load content on a page
  (the Markdown renderer sanitizes it in `src/lib/markdown.js`).
- A secret, token or credential committed to the repository or printed by the sync script or the build.
- A deploy workflow permission broader than it needs.

Problems in the tools themselves belong in their own repositories: see their `SECURITY.md` files.

## Supported versions

Only the `main` branch, which is what is deployed.
