import { Buffer } from 'buffer';
import { existsSync, promises } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import type { Seed4jMember } from '../../scripts/generateSponsorsFiles';
import { generate } from '../../scripts/generateSponsorsFiles';

global.fetch = vi.fn();

vi.mock('node:fs', () => ({
  promises: {
    writeFile: vi.fn().mockResolvedValue(undefined),
    mkdir: vi.fn().mockResolvedValue(undefined),
    readFile: vi.fn(),
  },
  existsSync: vi.fn(),
}));

describe('Generate sponsors data', () => {
  it('should generate backers data from open collective api', async () => {
    setupMocks();
    (global.fetch as any).mockImplementation(createMockFetchForMembers(seed4jMembersJson));

    const expectedBackersContent = createExpectedBackersContent([
      {
        name: 'Colin DAMON',
        url: 'https://opencollective.com/colin-damon',
        img: '/sponsors/colin-damon.png',
      },
      {
        name: 'Jane Doe',
        url: 'https://opencollective.com/jane-doe',
        img: '/sponsors/jane-doe.png',
      },
    ]);

    await generate();

    expect(promises.writeFile).toHaveBeenCalledWith('.vitepress/data/sponsors/backers.ts', expectedBackersContent, 'utf8');
  });



  const createExpectedBackersContent = (backers: Array<{ name: string; url: string; img: string }>) => {
    const backersArray = backers
      .map(backer => `  {\n    name: '${backer.name}',\n    url: '${backer.url}',\n    img: '${backer.img}',\n  }`)
      .join(',\n');

    return `import type { Sponsor } from './sponsors';\n\nexport const backer: Sponsor[] = [${backers.length > 0 ? '\n' + backersArray + ',\n' : ''}];\n`;
  };

  const createExpectedBronzesContent = (bronzes: Array<{ name: string; url: string; img: string }>) => {
    const bronzesArray = bronzes
      .map(
        bronze => `  {
    name: '${bronze.name}',
    url: '${bronze.url}',
    img: '${bronze.img}',
  }`,
      )
      .join(',\n');

    return `import type { Sponsor } from './sponsors';\n\nexport const bronze: Sponsor[] = [${bronzes.length > 0 ? '\n' + bronzesArray + ',\n' : ''}];\n`;
  };

  it.each([
    {
      tierToFilter: 'backer',
      sponsorType: 'backers',
      filePath: '.vitepress/data/sponsors/backers.ts',
      contentGenerator: createExpectedBackersContent,
    },
    {
      tierToFilter: 'Bronze sponsor',
      sponsorType: 'bronzes',
      filePath: '.vitepress/data/sponsors/bronzes.ts',
      contentGenerator: createExpectedBronzesContent,
    },
  ])(
    'should generate empty $sponsorType when does not have sponsors for its specific tier',
    async ({ tierToFilter, filePath, contentGenerator }) => {
      setupMocks();
      const seed4jMembersWithoutTierJson: Seed4jMember[] = seed4jMembersJson.filter(member => member.tier !== tierToFilter);
      (global.fetch as any).mockImplementation(createMockFetchForMembers(seed4jMembersWithoutTierJson));
      const expectedContent = contentGenerator([]);

      await generate();

      expect(promises.writeFile).toHaveBeenCalledWith(filePath, expectedContent, 'utf8');
    },
  );

  it('should give preference to use the user website instead of the open collective profile url', async () => {
    setupMocks();
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
    (global.fetch as any).mockImplementation(createMockFetchForMembers(seed4jMembersWithWebsiteJson));

    const expectedBackersContent = createExpectedBackersContent([
      {
        name: 'Alex Jones',
        url: 'https://alexjones.dev',
        img: '/sponsors/alex-jones.png',
      },
    ]);

    await generate();

    expect(promises.writeFile).toHaveBeenCalledWith('.vitepress/data/sponsors/backers.ts', expectedBackersContent, 'utf8');
  });

  it('should download backers image from open collective api', async () => {
    setupMocks();
    const seed4jMembersWithImageJson: Seed4jMember[] = [
      {
        MemberId: 721003,
        createdAt: '2025-09-04 13:00',
        type: 'USER',
        role: 'BACKER',
        tier: 'backer',
        isActive: true,
        totalAmountDonated: 20,
        currency: 'USD',
        lastTransactionAt: '2025-09-04 13:00',
        lastTransactionAmount: 20,
        profile: 'https://opencollective.com/sam-taylor',
        name: 'Sam Taylor',
        company: null,
        description: 'Avid supporter of community-driven projects.',
        image: 'https://www.gravatar.com/avatar/11223344556677889900aabbccddeeff?default=404',
        email: 'sam.taylor@example.com',
        newsletterOptIn: true,
        twitter: 'https://twitter.com/samtaylor',
        github: 'https://github.com/samtaylor',
        website: 'https://samtaylor.dev',
      },
    ];
    (global.fetch as any).mockImplementation(createMockFetchForMembers(seed4jMembersWithImageJson));

    const expectedBackersContent = createExpectedBackersContent([
      {
        name: 'Sam Taylor',
        url: 'https://samtaylor.dev',
        img: '/sponsors/sam-taylor.png',
      },
    ]);

    await generate();

    expect(promises.writeFile).toHaveBeenCalledWith('.vitepress/data/sponsors/backers.ts', expectedBackersContent, 'utf8');
    expect(promises.writeFile).toHaveBeenCalledWith('public/sponsors/sam-taylor.png', Buffer.from(new ArrayBuffer(16)));
  });

  it('should use the seed4j logo as a placeholder for open collective members without an image', async () => {
    setupMocks();
    const seed4jMembersWithoutImageJson: Seed4jMember[] = [
      {
        MemberId: 721004,
        createdAt: '2025-09-04 14:00',
        type: 'USER',
        role: 'BACKER',
        tier: 'backer',
        isActive: true,
        totalAmountDonated: 30,
        currency: 'USD',
        lastTransactionAt: '2025-09-04 14:00',
        lastTransactionAmount: 30,
        profile: 'https://opencollective.com/jordan-lee',
        name: 'Jordan Lee',
        company: null,
        description: 'Enthusiastic about supporting open-source projects.',
        image: null,
        email: 'jordan.lee@example.com',
        newsletterOptIn: false,
        twitter: null,
        github: null,
        website: null,
      },
    ];
    (global.fetch as any).mockImplementation(createMockFetchForMembers(seed4jMembersWithoutImageJson));

    await generate();

    expect(promises.writeFile).toHaveBeenCalledWith('public/sponsors/jordan-lee.png', Buffer.from(new ArrayBuffer(16)));
  });

  it('should prevent overwriting an existing user image with seed4j logo even if the user does not have an image from the open collective api', async () => {
    setupMocks();
    const seed4jMembersWithoutImageJson: Seed4jMember[] = [
      {
        MemberId: 721005,
        createdAt: '2025-09-05 10:00',
        type: 'USER',
        role: 'BACKER',
        tier: 'backer',
        isActive: true,
        totalAmountDonated: 40,
        currency: 'USD',
        lastTransactionAt: '2025-09-05 10:00',
        lastTransactionAmount: 10,
        profile: 'https://opencollective.com/morgan-smith',
        name: 'Morgan Smith',
        company: null,
        description: 'Passionate about contributing to tech communities.',
        image: null,
        email: 'morgan.smith@example.com',
        newsletterOptIn: true,
        twitter: null,
        github: null,
        website: null,
      },
    ];
    (global.fetch as any).mockImplementation(createMockFetchForMembers(seed4jMembersWithoutImageJson));

    await generate();

    expect(promises.writeFile).not.toHaveBeenCalledWith('public/sponsors/morgan-smith.png', Buffer.from(new ArrayBuffer(16)));
  });

  const setupMocks = () => {
    vi.clearAllMocks();

    (promises.readFile as any).mockImplementation((path: string) => {
      if (path === 'public/logo.png') {
        return Promise.resolve(Buffer.from(new ArrayBuffer(16)));
      }
      return Promise.reject(new Error(`Unexpected file path: ${path}`));
    });

    (existsSync as any).mockImplementation((path: string) => {
      return path === 'public/sponsors/morgan-smith.png';
    });
  };

  const createMockFetchForMembers = (members: Seed4jMember[]) => {
    return (url: string) => {
      if (url === 'https://opencollective.com/seed4j/members.json') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(members),
        });
      }
      if (url === 'https://www.gravatar.com/avatar/11223344556677889900aabbccddeeff?default=404') {
        return Promise.resolve({
          ok: true,
          arrayBuffer: () => Promise.resolve(new ArrayBuffer(16)),
        });
      }
      return Promise.reject(new Error(`Unexpected URL: ${url}`));
    };
  };

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
