import { backer } from './backers';
import { bronze } from './bronzes';

export type Sponsor = {
  name: string;
  img: string;
  url: string;
};

export const sponsors = [
  {
    tier: 'Bronze sponsors',
    size: 'mini',
    items: bronze,
  },
  {
    tier: 'Backers',
    size: 'xmini',
    items: backer,
  },
];
