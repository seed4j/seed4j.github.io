import { backer } from './backers';

export interface Sponsor {
  name: string;
  img: string;
  url: string;
}

const seed4jSponsors = {
  platinum: [],
  gold: [],
  silver: [],
  bronze: [
    {
      name: 'Geoffray Gruel',
      url: 'https://www.linkedin.com/in/ggruel/',
      img: 'https://avatars.githubusercontent.com/u/996402?v=4',
    },
  ],
} satisfies Record<string, Sponsor[]>;

export const sponsors = [
  {
    tier: 'Bronze sponsors',
    size: 'mini',
    items: seed4jSponsors.bronze,
  },
  {
    tier: 'Backers',
    size: 'xmini',
    items: backer,
  },
];
