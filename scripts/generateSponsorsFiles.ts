import { promises } from 'node:fs';
import { dirname } from 'node:path';

type BackerData = {
  name: string;
  url: string;
  img: string | null;
  imageUrl: string | null;
  profile: string;
};

type ImageDownloadResult = {
  success: boolean;
  filename?: string;
  error?: string;
};

const SPONSORS_DIR = 'public/sponsors';
const BACKERS_FILE_PATH = '.vitepress/data/sponsors/backers.ts';
const OPEN_COLLECTIVE_API_URL = 'https://opencollective.com/seed4j/members.json';
const IMAGE_EXTENSION = '.png';
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
  try {
    const seed4jMembers = await fetchSeed4jMembers();
    const activeBackers = filterActiveBackers(seed4jMembers);
    const backers = mapMembersToBackers(activeBackers);

    const backersFileContent = generateBackersFileContent(backers);
    await promises.writeFile(BACKERS_FILE_PATH, backersFileContent, 'utf8');

    await downloadAllBackerImages(backers);
  } catch (error) {
    console.error('Failed to generate sponsors files:', error);
    throw error;
  }
}

async function fetchSeed4jMembers(): Promise<Seed4jMember[]> {
  const response = await fetch(OPEN_COLLECTIVE_API_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch members: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

function filterActiveBackers(members: Seed4jMember[]): Seed4jMember[] {
  return members.filter(member => member.type === 'USER' && member.role === 'BACKER' && member.tier === 'backer' && member.isActive);
}

function mapMembersToBackers(members: Seed4jMember[]): BackerData[] {
  return members.map(member => ({
    name: member.name,
    url: member.website ?? member.profile,
    img: imageFilePath(member.profile),
    imageUrl: member.image,
    profile: member.profile,
  }));
}

function imageFilePath(profile: string): string {
  const profileUsername = profile.split('/').pop();
  if (!profileUsername) {
    throw new Error(`Invalid profile URL: ${profile}`);
  }
  return `/sponsors/${profileUsername}${IMAGE_EXTENSION}`;
}

function generateBackersFileContent(backers: BackerData[]): string {
  if (backers.length === 0) {
    return BACKERS_FILE_TEMPLATE.replace('{{BACKERS_CONTENT}}', '');
  }

  const backersContent = backers
    .map(
      backer => `
  {
    name: '${backer.name}',
    url: '${backer.url}',
    img: ${backer.img ? `'${backer.img}'` : 'null'},
  },`,
    )
    .join('')
    .concat('\n');

  return BACKERS_FILE_TEMPLATE.replace('{{BACKERS_CONTENT}}', backersContent);
}

async function downloadAllBackerImages(backers: BackerData[]): Promise<void> {
  const downloadPromises = backers
    .filter(backer => backer.imageUrl)
    .map(async backer => {
      const result = await downloadBackerImage(backer);
      if (!result.success) {
        console.error(`Failed to download image for ${backer.name}: ${result.error}`);
      }
    });

  await Promise.all(downloadPromises);
}

async function downloadBackerImage(backer: BackerData): Promise<ImageDownloadResult> {
  if (!backer.imageUrl) {
    return { success: false, error: 'No image URL provided' };
  }

  try {
    const imageResponse = await fetch(backer.imageUrl);
    if (!imageResponse.ok) {
      return { success: false, error: `HTTP ${imageResponse.status}` };
    }

    const image = await imageResponse.arrayBuffer();
    const profileUsername = backer.profile.split('/').pop();
    if (!profileUsername) {
      return { success: false, error: 'Invalid profile URL' };
    }

    const filename = profileUsername + IMAGE_EXTENSION;
    const filepath = `${SPONSORS_DIR}/${filename}`;

    await promises.mkdir(dirname(filepath), { recursive: true });
    await promises.writeFile(filepath, Buffer.from(image));

    return { success: true, filename };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

generate().catch(console.error);
