import { existsSync, promises as nodePromises } from 'node:fs';
import type { Sponsor } from '../.vitepress/data/sponsors/sponsors';

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

type ImageDownloadInfo = {
  imageUrl: string | null;
  profile: string;
  filename: string;
};

const SPONSORS_DIR = 'public/sponsors';
const PLACEHOLDER_IMAGE_PATH = 'public/logo.png';
const BACKERS_FILE_PATH = '.vitepress/data/sponsors/backers.ts';
const OPEN_COLLECTIVE_API_URL = 'https://opencollective.com/seed4j/members.json';
const IMAGE_EXTENSION = '.png';
const OPEN_COLLECTIVE_TIERS = ['backer', 'Bronze sponsor', 'Silver sponsor', 'Gold sponsor', 'Platinum sponsor'] as const;

const BACKERS_FILE_TEMPLATE = `import type { Sponsor } from './sponsors';

export const backer: Sponsor[] = [{{BACKERS_CONTENT}}];
`;

export async function generate(): Promise<void> {
  return fetchSeed4jMembers().then(async seed4jMembers => {
    const activeBackers = filterActiveBackers(seed4jMembers);
    const sponsors = mapToSponsor(activeBackers);
    const imageDownloadInfos = mapToImageDownloadInfo(activeBackers);

    const backersFileContent = generateBackersFileContent(sponsors);
    return nodePromises.writeFile(BACKERS_FILE_PATH, backersFileContent, 'utf8').then(() => downloadAllBackerImages(imageDownloadInfos));
  });
}

const fetchSeed4jMembers = async (): Promise<Seed4jMember[]> => fetch(OPEN_COLLECTIVE_API_URL).then(response => response.json());

const filterActiveBackers = (members: Seed4jMember[]): Seed4jMember[] =>
  members.filter(member => member.type === 'USER' && member.role === 'BACKER' && member.tier === 'backer' && member.isActive);

const mapToSponsor = (members: Seed4jMember[]): Sponsor[] =>
  members.map(member => ({
    name: member.name,
    url: member.website ?? member.profile,
    img: imageFilePath(member.profile),
  }));

const mapToImageDownloadInfo = (members: Seed4jMember[]): ImageDownloadInfo[] =>
  members.map(member => {
    const profileUsername = member.profile.split('/').pop();
    return {
      imageUrl: member.image,
      profile: member.profile,
      filename: profileUsername + IMAGE_EXTENSION,
    };
  });

const imageFilePath = (profile: string): string => {
  const profileUsername = profile.split('/').pop();
  return `/sponsors/${profileUsername}${IMAGE_EXTENSION}`;
};

const generateBackersFileContent = (backers: Sponsor[]): string => {
  if (backers.length === 0) {
    return BACKERS_FILE_TEMPLATE.replace('{{BACKERS_CONTENT}}', '');
  }

  const backersContent = backers
    .map(
      backer => `
  {
    name: '${backer.name}',
    url: '${backer.url}',
    img: '${backer.img}',
  },`,
    )
    .join('')
    .concat('\n');

  return BACKERS_FILE_TEMPLATE.replace('{{BACKERS_CONTENT}}', backersContent);
};

const downloadAllBackerImages = async (imageInfos: ImageDownloadInfo[]): Promise<void> => {
  const downloadPromises = imageInfos.map(imageInfo => downloadBackerImage(imageInfo).catch(error => console.error(error)));

  return Promise.all(downloadPromises).then(() => undefined);
};

const downloadBackerImage = async (imageInfo: ImageDownloadInfo): Promise<void> => {
  if (!imageInfo.imageUrl) return usePlaceHolderImage(imageInfo.filename);

  return fetch(imageInfo.imageUrl)
    .then(imageResponse => imageResponse.arrayBuffer())
    .then(async image => {
      const filepath = `${SPONSORS_DIR}/${imageInfo.filename}`;
      return nodePromises.mkdir(SPONSORS_DIR, { recursive: true }).then(() => nodePromises.writeFile(filepath, Buffer.from(image)));
    });
};

const usePlaceHolderImage = async (filename: string) => {
  const filepath = `${SPONSORS_DIR}/${filename}`;

  if (existsSync(filepath)) return Promise.resolve();

  return nodePromises
    .mkdir(SPONSORS_DIR, { recursive: true })
    .then(() => nodePromises.readFile(PLACEHOLDER_IMAGE_PATH).then(image => nodePromises.writeFile(filepath, image)));
};

generate().catch(error => console.error(error));
