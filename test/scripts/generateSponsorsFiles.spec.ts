import { promises } from 'node:fs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Seed4jMember } from '../../scripts/generateSponsorsFiles';
import { generate } from '../../scripts/generateSponsorsFiles';

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
    const expectedBackersContent = `import { Sponsor } from './sponsors';

export const backer: Sponsor[] = [
  {
    name: 'Colin DAMON',
    url: 'https://opencollective.com/colin-damon',
    img: null,
  },
  {
    name: 'Jane Doe',
    url: 'https://opencollective.com/jane-doe',
    img: null,
  },
];
`;

    await generate();

    expect(promises.writeFile).toHaveBeenCalledWith('.vitepress/data/sponsors/backers.ts', expectedBackersContent, 'utf8');
  });

  it('should generate empty backers when does not have sponsors for its specific tier', async () => {
    const seed4jMembersWithoutBeckersTierJson: Seed4jMember[] = seed4jMembersJson.filter(member => member.tier !== 'backer');
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve(seed4jMembersWithoutBeckersTierJson),
    };
    (global.fetch as any).mockResolvedValueOnce(mockResponse);
    const expectedBackersContent = `import { Sponsor } from './sponsors';

export const backer: Sponsor[] = [];
`;

    await generate();

    expect(promises.writeFile).toHaveBeenCalledWith('.vitepress/data/sponsors/backers.ts', expectedBackersContent, 'utf8');
  });

  it('should give preference to use the user website instead of the open collective profile url', async () => {
    const seed4jMembersWithWebsiteJson: Seed4jMember[] = [
      {
        MemberId: 721002,
        createdAt: '2025-09-04 12:00',
        type: 'USER',
        role: 'BACKER',
        tier: 'backer',
        isActive: true,
        totalAmountDonated: 50,
        currency: 'USD',
        lastTransactionAt: '2025-09-04 12:00',
        lastTransactionAmount: 50,
        profile: 'https://opencollective.com/alex-jones',
        name: 'Alex Jones',
        company: null,
        description: 'Supporter of open source initiatives.',
        image: null,
        email: 'alex.jones@example.com',
        newsletterOptIn: false,
        twitter: 'https://twitter.com/alexjones',
        github: 'https://github.com/alexjones',
        website: 'https://alexjones.dev',
      },
    ];
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve(seed4jMembersWithWebsiteJson),
    };
    (global.fetch as any).mockResolvedValueOnce(mockResponse);
    const expectedBackersContent = `import { Sponsor } from './sponsors';

export const backer: Sponsor[] = [
  {
    name: 'Alex Jones',
    url: 'https://alexjones.dev',
    img: null,
  },
];
`;

    await generate();

    expect(promises.writeFile).toHaveBeenCalledWith('.vitepress/data/sponsors/backers.ts', expectedBackersContent, 'utf8');
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
      MemberId: 721000,
      createdAt: '2025-09-04 10:00',
      type: 'USER',
      role: 'BACKER',
      tier: 'backer',
      isActive: true,
      totalAmountDonated: 10,
      currency: 'USD',
      lastTransactionAt: '2025-09-04 10:00',
      lastTransactionAmount: 10,
      profile: 'https://opencollective.com/jane-doe',
      name: 'Jane Doe',
      company: 'Tech Innovations Inc.',
      description: 'Enthusiastic supporter of open source projects.',
      image: null,
      email: 'jane.doe@example.com',
      newsletterOptIn: true,
      twitter: 'https://twitter.com/janedoe',
      github: 'https://github.com/janedoe',
      website: null,
    },
    {
      MemberId: 721001,
      createdAt: '2025-09-04 11:00',
      type: 'USER',
      role: 'BACKER',
      tier: 'backer',
      isActive: false,
      totalAmountDonated: 10,
      currency: 'USD',
      lastTransactionAt: '2025-09-04 11:00',
      lastTransactionAmount: 10,
      profile: 'https://opencollective.com/john-smith',
      name: 'John Smith',
      company: 'Innovatech Solutions',
      description: 'Passionate about supporting innovative tech solutions.',
      image: 'https://www.gravatar.com/avatar/abcdef1234567890abcdef1234567890?default=404',
      email: 'john.smith@example.com',
      newsletterOptIn: true,
      twitter: 'https://twitter.com/johnsmith',
      github: 'https://github.com/johnsmith',
      website: 'https://johnsmith.com',
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
