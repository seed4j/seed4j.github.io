import { promises } from 'node:fs';

const OPEN_COLLECTIVE_TIERS = ['backer', 'Bronze sponsor', 'Silver sponsor', 'Gold sponsor', 'Platinum sponsor'] as const;

type OpenCollectiveTier = (typeof OPEN_COLLECTIVE_TIERS)[number];
type OpenCollectiveRole = 'ADMIN' | 'HOST' | 'BACKER';
type OpenCollectiveType = 'USER' | 'ORGANIZATION';

export type Seed4jMember = {
  MemberId: number;
  createdAt: string;
  type: OpenCollectiveType;
  role: OpenCollectiveRole;
  isActive: boolean;
  totalAmountDonated: number;
  currency?: string;
  lastTransactionAt: string;
  lastTransactionAmount: number;
  profile: string;
  name: string;
  company: string | null;
  description: string | null;
  image: string | null;
  email?: string | null;
  newsletterOptIn?: boolean | null;
  twitter: string | null;
  github: string | null;
  website: string | null;
  tier?: OpenCollectiveTier;
};

const BACKERS_FILE_TEMPLATE = `import { Sponsor } from './sponsors';

export const backer: Sponsor[] = [{{BACKERS_CONTENT}}];
`;

export async function generate(): Promise<void> {
  const response = await fetch('https://opencollective.com/seed4j/members.json');
  const seed4jMembersJson: Seed4jMember[] = await response.json();

  const backers = seed4jMembersJson
    .filter(member => member.type === 'USER' && member.role === 'BACKER' && member.tier === 'backer' && member.isActive)
    .map(member => ({
      name: member.name,
      url: member.website ?? member.profile,
      img: member.image ?? null,
    }));

  const backersContent =
    backers.length > 0
      ? backers
          .map(
            backer => `
  {
    name: '${backer.name}',
    url: '${backer.url}',
    img: ${backer.img ? `'${backer.img}'` : 'null'},
  },`,
          )
          .join('')
          .concat('\n')
      : '';
  const backersFile = BACKERS_FILE_TEMPLATE.replace('{{BACKERS_CONTENT}}', backersContent);

  await promises.writeFile('.vitepress/data/sponsors/backers.ts', backersFile, 'utf8');
}

generate().catch(console.error);
