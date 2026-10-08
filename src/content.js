// Every fact here comes from Advaith's public LinkedIn profile, artificialhedge.co
// or his linked first-party projects. See content-sources.md before adding claims.

export const profile = {
  name: 'Advaith Vaithianathan',
  first: 'Advaith',
  last: 'Vaithianathan',
  brand: 'advvvvaith',
  email: 'wassup@advaithvaithianathan.com',
  location: 'Bengaluru, India',
  coordinates: '12.97° N, 77.59° E',
  motto: ['we', 'must', 'pace', 'the', 'frontier'],
  links: {
    linkedin: 'https://www.linkedin.com/in/advaithvaithianathan/',
    github: 'https://github.com/cosmic-hydra',
    orcid: 'https://orcid.org/0009-0000-2076-3011',
    hedge: 'https://artificialhedge.co/',
    portal: 'https://portal.artificialhedge.co/',
  },
};

export const nav = [
  { id: 'artificial-hedge', label: 'artificial hedge' },
  { id: 'research', label: 'research' },
  { id: 'work', label: 'work' },
  { id: 'trajectory', label: 'trajectory' },
  { id: 'contact', label: 'contact' },
];

export const hedge = {
  role: 'founder',
  since: '2026',
  tagline: 'frontier intelligence for finance.',
  statement:
    'I’m building artificial hedge: frontier language models for financial reasoning, quantitative research and demanding mathematics.',
  models: [
    {
      index: '01 / model',
      name: 'fx-1',
      kind: 'frontier finance + math',
      blurb: 'Depth for the demanding question. Built for financial work that needs careful reasoning.',
      specs: [
        { label: 'total parameters', value: 3.4, unit: 'T', decimals: 1 },
        { label: 'active per token', value: 128, unit: 'B', prefix: '~' },
      ],
      status: 'research preview',
    },
    {
      index: '02 / model',
      name: 'fx-1 lite',
      kind: 'economy, optimised',
      blurb: 'The same finance and maths focus, tuned for cost.',
      specs: [
        { label: 'total parameters', value: 2.4, unit: 'T', decimals: 1 },
        { label: 'active per token', value: 49, unit: 'B', prefix: '~' },
      ],
      status: 'research preview',
    },
    {
      index: '03 / harness',
      name: 'dipcatcher',
      kind: 'planned orchestration',
      blurb: 'The planned harness around the models: context, tool use, execution and review.',
      specs: [
        { label: 'stage', text: 'in development' },
        { label: 'release', text: 'waitlist open' },
      ],
      status: 'in development',
    },
  ],
  flow: [
    {
      step: '01',
      title: 'source / context',
      items: ['filings & statements', 'market & economic data', 'research & documents'],
    },
    {
      step: '02',
      title: 'model / reasoning',
      items: ['extract & normalise', 'reason & calculate', 'validate & cite'],
    },
    {
      step: '03',
      title: 'output / application',
      items: ['financial research', 'quantitative workflows', 'decision support'],
    },
  ],
};

export const papers = [
  {
    date: 'aug 2026',
    title: 'Settlement-Latency Paradox',
    venue: 'SSRN',
    field: 'monetary systems',
    abstract:
      'Develops an original theoretical framework for settlement latency and evaluates it against public institutional evidence from the United States, the euro area, India and Brazil. The propositions are proved within the model; the empirical sections are framed as validation, calibration and falsifiable evidence rather than causal proof.',
  },
  {
    date: 'jun 2026',
    title: 'Risk-Aware Deep Reinforcement Learning for Dynamic Portfolio Optimization: A CVaR-Regularized Actor–Critic Framework',
    venue: 'ResearchGate',
    field: 'reinforcement learning',
    abstract:
      'Proposes a deep reinforcement learning framework for dynamic portfolio allocation that builds tail-risk control (CVaR) directly into the policy objective, addressing what mean–variance optimisation and reward-maximising trading agents leave exposed: asymmetric downside shocks.',
  },
];

export const work = [
  {
    id: 'ctxt-mam',
    name: 'ctxt-mam',
    field: 'applied ai / open source',
    role: 'builder',
    summary:
      'Multi-agent orchestration for Claude Code and Codex. A fork of oh-my-claudecode that coordinates many specialised sub-agents around a shared task.',
    url: 'https://github.com/cosmic-hydra/ctxt-MAM',
    art: 'agents',
  },
  {
    id: 'speedx',
    name: 'speedx',
    field: 'astronomy / scientific computing',
    role: 'builder',
    summary:
      'A model for classifying astronomical objects, built on Hubble and JWST observations from the Mikulski Archive for Space Telescopes (MAST).',
    url: 'https://github.com/cosmic-hydra/speedX',
    art: 'stars',
  },
  {
    id: 'zane',
    name: 'zane',
    field: 'ai / drug discovery',
    role: 'builder',
    summary:
      'An open-source drug development engine with GuacaMol and RDKit built in, aimed at molecule generation with minimal toxicity.',
    url: 'https://github.com/cosmic-hydra/zane',
    art: 'molecule',
  },
  {
    id: 'space4climate',
    name: 'space4climate',
    field: 'space / climate / education',
    role: 'co-founder & cto',
    summary:
      'A space and climate education initiative that makes the science accessible through workshops, storytelling and media.',
    url: 'https://space4climate-blond.vercel.app/',
    art: 'orbit',
  },
];

// Dated milestones from LinkedIn, oldest first. Undated roles live in `alongside`.
export const trajectory = [
  {
    year: '2023',
    items: [{ when: 'jun', what: 'NSIC National Award', who: 'ISRO × NITI Aayog', kind: 'award' }],
  },
  {
    year: '2024',
    items: [{ when: 'sep', what: 'Silver Honour, twice', who: 'International Astronomy & Astrophysics Competition', kind: 'award' }],
  },
  {
    year: '2025',
    items: [
      { when: 'feb', what: 'Co-founder & CTO', who: 'Space4Climate', kind: 'role' },
      { when: 'feb', what: 'Citizen scientist', who: 'National Astronomical Observatory of Japan', kind: 'research' },
    ],
  },
  {
    year: '2026',
    items: [
      { when: '2026', what: 'Founded artificial hedge', who: 'Frontier models for finance', kind: 'company', accent: true },
      { when: 'mar', what: 'Software engineering job simulations', who: 'JPMorganChase × Forage · Quantium × Forage', kind: 'certification' },
      { when: 'apr', what: 'Microsoft Certified Professional', who: 'Microsoft', kind: 'certification' },
      { when: 'jun', what: 'Paper: risk-aware deep RL for portfolios', who: 'ResearchGate', kind: 'research' },
      { when: 'jul', what: 'Winter Tech Fellowship', who: 'Palantir Technologies', kind: 'fellowship' },
      { when: 'aug', what: 'Paper: Settlement-Latency Paradox', who: 'SSRN', kind: 'research' },
      { when: 'oct', what: 'fx-1 & fx-1 lite open via API', who: 'artificial hedge · research preview', kind: 'company', accent: true },
    ],
  },
];

export const alongside = [
  { what: 'Member', who: 'The Knowledge Society (TKS)' },
  { what: 'Citizen scientist', who: 'NASA' },
  { what: 'Ambassador', who: 'IAAC' },
];

export const languages = ['tamil', 'english', 'hindi'];

export const domains = ['ai', 'capital', 'astronomy', 'molecules', 'climate'];
