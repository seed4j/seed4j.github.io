import { existsSync, promises as nodePromises } from 'node:fs';
import type { Sponsor } from '../.vitepress/data/sponsors/sponsors';

type Seed4jMemberMemberId = number;
type Seed4jMemberCreatedAt = string;
type Seed4jMemberProfile = string;
type Seed4jMemberName = string;
type Seed4jMemberCompany = string | null;
type Seed4jMemberDescription = string | null;
type Seed4jMemberImage = string | null;
type Seed4jMemberEmail = string | null;
type Seed4jMemberNewsletterOptIn = boolean | null;
type Seed4jMemberTwitter = string | null;
type Seed4jMemberGithub = string | null;
type Seed4jMemberWebsite = string | null;
type Seed4jMemberTotalAmountDonated = number;
type Seed4jMemberCurrency = string;
type Seed4jMemberLastTransactionAt = string;
type Seed4jMemberLastTransactionAmount = number;
type Seed4jMemberIsActive = boolean;
type OpenCollectiveTier = 'backer' | 'Bronze sponsor' | 'Silver sponsor' | 'Gold sponsor' | 'Platinum sponsor';
type OpenCollectiveRole = 'ADMIN' | 'HOST' | 'BACKER';
type OpenCollectiveType = 'USER' | 'ORGANIZATION';

export type Seed4jMember = {
  MemberId: Seed4jMemberMemberId;
  createdAt: Seed4jMemberCreatedAt;
  type: OpenCollectiveType;
  role: OpenCollectiveRole;
  isActive: Seed4jMemberIsActive;
  totalAmountDonated: Seed4jMemberTotalAmountDonated;
  currency?: Seed4jMemberCurrency;
  lastTransactionAt: Seed4jMemberLastTransactionAt;
  lastTransactionAmount: Seed4jMemberLastTransactionAmount;
  profile: Seed4jMemberProfile;
  name: Seed4jMemberName;
  company: Seed4jMemberCompany;
  description: Seed4jMemberDescription;
  image: Seed4jMemberImage;
  email?: Seed4jMemberEmail;
  newsletterOptIn?: Seed4jMemberNewsletterOptIn;
  twitter: Seed4jMemberTwitter;
  github: Seed4jMemberGithub;
  website: Seed4jMemberWebsite;
  tier?: OpenCollectiveTier;
};

type ImageDownloadInfoImageUrl = string | null;
type ImageDownloadInfoProfile = string;
type ImageDownloadInfoFilename = string;

type ImageDownloadInfo = {
  imageUrl: ImageDownloadInfoImageUrl;
  profile: ImageDownloadInfoProfile;
  filename: ImageDownloadInfoFilename;
};

const SPONSORS_DIR = 'public/sponsors';
const PLACEHOLDER_IMAGE_PATH = 'public/logo.png';
const BACKERS_FILE_PATH = '.vitepress/data/sponsors/backers.ts';
const BRONZES_FILE_PATH = '.vitepress/data/sponsors/bronzes.ts';
const OPEN_COLLECTIVE_API_URL = 'https://opencollective.com/seed4j/members.json';
const IMAGE_EXTENSION = '.png';

const BACKERS_FILE_TEMPLATE = `import type { Sponsor } from './sponsors';

export const backer: Sponsor[] = [{{CONTENT}}];
`;

const BRONZES_FILE_TEMPLATE = `import type { Sponsor } from './sponsors';

export const bronze: Sponsor[] = [{{CONTENT}}];
`;

export async function generate(): Promise<void> {
  return fetchSeed4jMembers().then(async seed4jMembers => {
    const backersPromise = prefetchSponsors(seed4jMembers, 'backer', BACKERS_FILE_PATH, BACKERS_FILE_TEMPLATE);
    const bronzesPromise = prefetchSponsors(seed4jMembers, 'Bronze sponsor', BRONZES_FILE_PATH, BRONZES_FILE_TEMPLATE);

    return Promise.all([backersPromise, bronzesPromise]).then(() => undefined);
  });
}

const fetchSeed4jMembers = async (): Promise<Seed4jMember[]> => fetch(OPEN_COLLECTIVE_API_URL).then(response => response.json());

const prefetchSponsors = async (seed4jMembers: Seed4jMember[], tier: OpenCollectiveTier, filePath: string, template: string) => {
  const activeSponsors = filterActiveSponsors(seed4jMembers, tier);
  const sponsors = mapToSponsor(activeSponsors);
  const imageDownloadInfos = mapToImageDownloadInfo(activeSponsors);

  const fileContent = generateFileContent(sponsors, template);
  return nodePromises.writeFile(filePath, fileContent, 'utf8').then(() => downloadAllBackerImages(imageDownloadInfos));
};

const filterActiveSponsors = (members: Seed4jMember[], tier: OpenCollectiveTier): Seed4jMember[] =>
  members.filter(member => member.type === 'USER' && member.role === 'BACKER' && member.tier === tier && member.isActive);

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

const generateFileContent = (sponsors: Sponsor[], template: string): string => {
  if (sponsors.length === 0) {
    return template.replace('{{CONTENT}}', '');
  }

  const sponsorsContent = sponsors
    .map(
      sponsor => `
  {
    name: '${sponsor.name}',
    url: '${sponsor.url}',
    img: '${sponsor.img}',
  },`,
    )
    .join('')
    .concat('\n');

  return template.replace('{{CONTENT}}', sponsorsContent);
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

const usePlaceHolderImage = async (filename: ImageDownloadInfoFilename) => {
  const filepath = `${SPONSORS_DIR}/${filename}`;

  if (existsSync(filepath)) return Promise.resolve();

  return nodePromises
    .mkdir(SPONSORS_DIR, { recursive: true })
    .then(() => nodePromises.readFile(PLACEHOLDER_IMAGE_PATH).then(image => nodePromises.writeFile(filepath, image)));
};

generate().catch(error => console.error(error));
