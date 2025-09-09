import { existsSync, promises as nodePromises } from 'node:fs';
import type { Sponsor } from '../.vitepress/data/sponsors/sponsors';
import type { OpenCollectiveTier } from './OpenCollectiveTier';
import type { Seed4jMember } from './Seed4jMember';

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
const SILVERS_FILE_PATH = '.vitepress/data/sponsors/silvers.ts';
const GOLDS_FILE_PATH = '.vitepress/data/sponsors/golds.ts';
const OPEN_COLLECTIVE_API_URL = 'https://opencollective.com/seed4j/members.json';
const IMAGE_EXTENSION = '.png';

const BACKERS_FILE_TEMPLATE = `import type { Sponsor } from './sponsors';

export const backer: Sponsor[] = [{{CONTENT}}];
`;

const BRONZES_FILE_TEMPLATE = `import type { Sponsor } from './sponsors';

export const bronze: Sponsor[] = [{{CONTENT}}];
`;

const SILVERS_FILE_TEMPLATE = `import type { Sponsor } from './sponsors';

export const silver: Sponsor[] = [{{CONTENT}}];
`;

const GOLDS_FILE_TEMPLATE = `import type { Sponsor } from './sponsors';

export const gold: Sponsor[] = [{{CONTENT}}];
`;

export async function generate(): Promise<void> {
  return fetchSeed4jMembers().then(async seed4jMembers =>
    prefetchSponsors(seed4jMembers, 'backer', BACKERS_FILE_PATH, BACKERS_FILE_TEMPLATE)
      .then(() => prefetchSponsors(seed4jMembers, 'Bronze sponsor', BRONZES_FILE_PATH, BRONZES_FILE_TEMPLATE))
      .then(() => prefetchSponsors(seed4jMembers, 'Silver sponsor', SILVERS_FILE_PATH, SILVERS_FILE_TEMPLATE))
      .then(() => prefetchSponsors(seed4jMembers, 'Gold sponsor', GOLDS_FILE_PATH, GOLDS_FILE_TEMPLATE)),
  );
}

const fetchSeed4jMembers = async (): Promise<Seed4jMember[]> => fetch(OPEN_COLLECTIVE_API_URL).then(response => response.json());

const prefetchSponsors = async (seed4jMembers: Seed4jMember[], tier: OpenCollectiveTier, filePath: string, template: string) => {
  const activeSponsors = filterActiveSponsors(seed4jMembers, tier);
  const sponsors = mapToSponsor(activeSponsors);
  const imageDownloadInfos = mapToImageDownloadInfo(activeSponsors);

  const fileContent = generateFileContent(sponsors, template);
  return nodePromises.writeFile(filePath, fileContent, 'utf8').then(() => downloadAllImages(imageDownloadInfos));
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

const downloadAllImages = async (imageInfos: ImageDownloadInfo[]): Promise<void> => {
  const downloadPromises = imageInfos.map(imageInfo => downloadImage(imageInfo).catch(error => console.error(error)));

  return Promise.all(downloadPromises).then(() => undefined);
};

const downloadImage = async (imageInfo: ImageDownloadInfo): Promise<void> => {
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
