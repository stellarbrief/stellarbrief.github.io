// What the site says about each project, besides the content it pulls from the repositories.
// Status is a judgement, so it lives here with its reasons and the date it was last reviewed.

export const STATUS_CRITERIA = {
  Experimental:
    'Version 0.x, a single maintainer, and at least one central claim that is verified only in part. The interface and output formats can change.',
  'Active development':
    'Used by people other than its author, with its central claims verified by automated tests and real runs.',
  Stable: 'A 1.0 or later with a compatibility promise, several users, and more than one maintainer.',
  Archived: 'No longer maintained.',
};

export const STATUS_REVIEWED = '2026-10-06';

export const projects = [
  {
    slug: 'upgrade-preflight',
    repo: 'upgrade-preflight',
    name: 'Upgrade Preflight',
    tagline: 'Will my Soroban contracts behave or cost differently after a protocol upgrade?',
    summary:
      'Runs your contract scenarios on two real local Stellar networks at different protocol versions and diffs the results. It reports behavior changes, breakage and cost changes, and states what it did not test.',
    audience: 'Soroban contract developers',
    needsDocker: true,
    status: 'Experimental',
    statusWhy:
      'Version 0.1.0. The two-network comparison has real results (see the playground) but is not yet part of automated CI, the Action wrapper has not been verified end to end, and the cause of the cost changes is untraced.',
    playground: '/playground/preflight/',
  },
  {
    slug: 'upgrade-drill',
    repo: 'upgrade-drill',
    name: 'Upgrade Drill',
    tagline: 'What happens to a validator network during an upgrade vote?',
    summary:
      'Boots real stellar-core containers on your machine, runs a scripted upgrade vote with scenarios such as a laggard or a lost quorum, and reports what each node did. Local only.',
    audience: 'Validator and infrastructure operators',
    needsDocker: true,
    status: 'Experimental',
    statusWhy:
      'Version 0.1.0. Four built-in scenarios have real recorded runs, but drills start from genesis protocol 0 rather than a Mainnet-like state, and one verdict has never been produced in a real run.',
    playground: '/playground/drill/',
  },
  {
    slug: 'advisory-brief',
    repo: 'advisory-brief',
    name: 'Advisory Brief',
    tagline: 'What does this advisory or release mean for us?',
    summary:
      'Turns Stellar release notes and advisories into plain-language briefs for non-engineers. Each claim cites a quote that code checks against the source text, or is marked unknown when the source does not say.',
    audience: 'Operations, product and compliance readers',
    needsDocker: false,
    status: 'Experimental',
    statusWhy:
      'A web app you run locally, with no releases. The quote check is tested, but the accuracy of the briefs is not measured, and the check does not prove a claim is supported by its quote.',
    playground: '/playground/advisory/',
  },
];

export const ORG = 'stellarbrief';
