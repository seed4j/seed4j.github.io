import { promises } from 'node:fs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { generate } from '../../scripts/generateSponsorsFiles';
import type { Seed4jMember } from '../../scripts/generateSponsorsFiles';

const EXPECTED_BACKERS_CONTENT = `import { Sponsor } from './sponsors';

export const backer: Sponsor[] = [
  {
    name: 'Colin DAMON',
    url: 'https://opencollective.com/colin-damon',
    img: null,
  },
];
`;

global.fetch = vi.fn();

vi.mock('node:fs', () => ({
  promises: {
    writeFile: vi.fn(),
  },
}));

describe('Generate sponsors data', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate backers data from open collective api', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve(seed4jMembersJson),
    };
    (global.fetch as any).mockResolvedValueOnce(mockResponse);

    await generate();

    expect(promises.writeFile).toHaveBeenCalledWith('.vitepress/data/backers.ts', EXPECTED_BACKERS_CONTENT, 'utf8');
  });

  const seed4jMembersJson: Seed4jMember[] = [
    {
      MemberId: 717245,
      createdAt: '2025-08-07 09:29',
      type: 'USER',
      role: 'ADMIN',
      isActive: true,
      totalAmountDonated: 0,
      lastTransactionAt: '2025-08-29 14:03',
      lastTransactionAmount: 0,
      profile: 'https://opencollective.com/pascalgrimaud',
      name: 'Pascal Grimaud',
      company: null,
      description: 'Freelance, Full Stack Java Developer',
      image: 'https://www.gravatar.com/avatar/ebc22ec8211c37e9a429043127a538d8?default=404',
      email: null,
      newsletterOptIn: null,
      twitter: 'https://twitter.com/pascalgrimaud',
      github: 'https://github.com/pascalgrimaud',
      website: 'https://github.com/pascalgrimaud',
    },
    {
      MemberId: 717246,
      createdAt: '2025-08-07 09:29',
      type: 'ORGANIZATION',
      role: 'HOST',
      isActive: true,
      totalAmountDonated: 0,
      currency: 'USD',
      lastTransactionAt: '2025-08-18 14:24',
      lastTransactionAmount: -10,
      profile: 'https://opencollective.com/opensource',
      name: 'Open Source Collective',
      company: null,
      description: 'Non-profit fiscal host promoting a healthy and sustainable open source ecosystem.',
      image: 'https://opencollective-production.s3.us-west-1.amazonaws.com/97017710-a90f-11e9-b6fb-2bbe7128f780.png',
      twitter: 'https://twitter.com/OpenSourceColl',
      github: null,
      website: 'https://oscollective.org/',
    },
    {
      MemberId: 717557,
      createdAt: '2025-08-07 21:20',
      type: 'USER',
      role: 'ADMIN',
      isActive: true,
      totalAmountDonated: 0,
      lastTransactionAt: '2025-08-29 14:03',
      lastTransactionAmount: 0,
      profile: 'https://opencollective.com/murdos',
      name: 'Aurélien Mino',
      company: null,
      description: null,
      image: 'https://www.gravatar.com/avatar/4a7114e5d4b11c624793b73452d2576f?default=404',
      email: null,
      newsletterOptIn: null,
      twitter: null,
      github: null,
      website: null,
    },
    {
      MemberId: 719393,
      createdAt: '2025-08-13 16:26',
      type: 'USER',
      role: 'BACKER',
      tier: 'backer',
      isActive: true,
      totalAmountDonated: 10,
      currency: 'EUR',
      lastTransactionAt: '2025-08-13 16:26',
      lastTransactionAmount: 10,
      profile: 'https://opencollective.com/colin-damon',
      name: 'Colin DAMON',
      company: null,
      description: null,
      image: null,
      email: null,
      newsletterOptIn: null,
      twitter: null,
      github: null,
      website: null,
    },
    {
      MemberId: 719395,
      createdAt: '2025-08-13 16:33',
      type: 'USER',
      role: 'ADMIN',
      isActive: true,
      totalAmountDonated: 10,
      lastTransactionAt: '2025-08-29 14:03',
      lastTransactionAmount: 0,
      profile: 'https://opencollective.com/colin-damon',
      name: 'Colin DAMON',
      company: null,
      description: null,
      image: null,
      email: null,
      newsletterOptIn: null,
      twitter: null,
      github: null,
      website: null,
    },
    {
      MemberId: 720740,
      createdAt: '2025-08-18 14:24',
      type: 'USER',
      role: 'BACKER',
      tier: 'Bronze sponsor',
      isActive: true,
      totalAmountDonated: 100,
      currency: 'USD',
      lastTransactionAt: '2025-08-18 14:24',
      lastTransactionAmount: 100,
      profile: 'https://opencollective.com/guest-b627ebd3',
      name: 'Geoffray Gruel',
      company: null,
      description: null,
      image: null,
      email: null,
      newsletterOptIn: null,
      twitter: null,
      github: null,
      website: null,
    },
  ];
});
