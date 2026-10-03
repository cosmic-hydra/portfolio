export const profile = {
  name: 'Advaith Vaithianathan',
  brand: 'advvvvaith',
  email: 'wassup@advaithvaithianathan.com',
  linkedin: 'https://www.linkedin.com/in/advaithvaithianathan/',
  github: 'https://github.com/cosmic-hydra',
  orcid: 'https://orcid.org/0009-0000-2076-3011',
  location: 'Bengaluru, India',
  headline: 'Building across AI, capital and science.',
  bio:
    'I’m Advaith, a founder and builder based in Bengaluru. I work across applied AI, quantitative systems and scientific computing, turning research questions into working software. I’m currently building artificial hedge.',
};

export const projects = [
  {
    id: 'artificial-hedge',
    title: 'artificial hedge',
    summary:
      'A research-led platform exploring markets, capital and company building. I’m developing the software and research behind an AI-native approach to investing.',
    url: 'https://artificialhedge.co/',
    image: '/assets/portfolio/artificial-hedge.svg',
    category: 'Markets & research',
    role: 'Founder',
    linkLabel: 'Explore project',
  },
  {
    id: 'ctxt-mam',
    title: 'ctxt-MAM',
    summary:
      'Open-source multi-agent orchestration for Claude Code. A fork of oh-my-claudecode, focused on coordinating specialized agents around shared tasks and context.',
    url: 'https://github.com/cosmic-hydra/ctxt-MAM',
    image: '/assets/portfolio/ctxt-mam.svg',
    category: 'Applied AI & open source',
    role: 'Open-source contributor',
    linkLabel: 'View repository',
  },
  {
    id: 'speedx',
    title: 'speedX',
    summary:
      'Astronomy tooling for Hubble observation metadata, FITS image features and retrieval-augmented classification. Exploring how machine learning can make scientific archives more useful.',
    url: 'https://github.com/cosmic-hydra/speedX',
    image: '/assets/portfolio/speedx.svg',
    category: 'Astronomy & scientific computing',
    role: 'Builder',
    linkLabel: 'View repository',
  },
  {
    id: 'zane',
    title: 'ZANE',
    summary:
      'An AI-native pharmaceutical research system connecting target intelligence, molecular design, physics, safety triage and laboratory interfaces in one workflow.',
    url: 'https://github.com/cosmic-hydra/zane',
    image: '/assets/portfolio/zane.svg',
    category: 'AI & pharmaceutical research',
    role: 'Builder',
    linkLabel: 'View repository',
  },
  {
    id: 'space4climate',
    title: 'Space4Climate',
    summary:
      'A space and climate education initiative using workshops, storytelling and media to make science accessible.',
    url: 'https://space4climate-blond.vercel.app/',
    image: '/assets/portfolio/space4climate.svg',
    category: 'Space, climate & education',
    role: 'Co-founder & CTO',
    linkLabel: 'Explore project',
  },
];

export const focusAreas = [
  {
    id: 'applied-ai',
    title: 'Applied AI',
    description:
      'Retrieval, memory and agent workflows, with attention to traceable outputs and clear evaluation.',
  },
  {
    id: 'quantitative-systems',
    title: 'Quantitative systems',
    description:
      'Research tools for financial data, backtesting and portfolio decisions, grounded in transparent assumptions.',
  },
  {
    id: 'scientific-computing',
    title: 'Scientific computing',
    description:
      'Computational tools for astronomy, molecular research and questions that begin with data.',
  },
  {
    id: 'product-engineering',
    title: 'Product engineering',
    description:
      'Connecting models, backends and interfaces to turn research into usable software.',
  },
];

export const approachSteps = [
  {
    id: 'investigate',
    title: 'Investigate',
    description:
      'Define the question, examine the data and establish what a useful result would look like.',
    details: ['Problem definition', 'Data exploration', 'Research', 'Success criteria'],
  },
  {
    id: 'build',
    title: 'Build',
    description:
      'Develop a small working system, connect the pieces and refine it through experiments.',
    details: ['Prototype', 'Architecture', 'Implementation', 'Iteration'],
  },
  {
    id: 'evaluate',
    title: 'Evaluate',
    description:
      'Inspect behavior and failures, document what holds up and improve the next version.',
    details: ['Evaluation', 'Failure analysis', 'Documentation', 'Release'],
  },
];
