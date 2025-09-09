import { existsSync, promises as nodePromises } from 'node:fs';
import type { Sponsor } from '../.vitepress/data/sponsors/sponsors';
import type { OpenCollectiveTier } from './OpenCollectiveTier';
import type { Seed4jMember, Seed4jMemberMemberId, Seed4jMemberProfile } from './Seed4jMember';

type ImageDownloadInfoImageUrl = string | null;
type ImageDownloadInfoProfile = string;
type ImageDownloadInfoFilename = string;

const readExistingSponsors = async (filePath: string): Promise<Sponsor[]> => {
  return nodePromises
    .readFile(filePath, 'utf8')
    .then(content => {
      const exportMatch = content.match(/export const \w+: Sponsor\[] = \[(.*?)];/s);
      if (!exportMatch) return [];

      const arrayContent = exportMatch[1].trim();
      if (!arrayContent) return [];

      const sponsors: Sponsor[] = [];
      const sponsorMatches = arrayContent.match(/\{[^}]+}/g);
      if (!sponsorMatches) return [];

      sponsorMatches.forEach(match => {
        const memberIdMatch = match.match(/memberId:\s*(\d+)/);
        const nameMatch = match.match(/name:\s*'([^']+)'/);
        const urlMatch = match.match(/url:\s*'([^']+)'/);
        const imgMatch = match.match(/img:\s*'([^']+)'/);

        if (memberIdMatch && nameMatch && urlMatch && imgMatch) {
          sponsors.push({
            memberId: parseInt(memberIdMatch[1]),
            name: nameMatch[1],
            url: urlMatch[1],
            img: imgMatch[1],
          });
        }
      });

      return sponsors;
    })
    .catch(() => []);
};

const guestMember = (member: Seed4jMember): boolean => member.profile.includes('guest-');

type ImageDownloadInfo = {
  imageUrl: ImageDownloadInfoImageUrl;
  profile: ImageDownloadInfoProfile;
  filename: ImageDownloadInfoFilename;
};

const SPONSORS_DIR = 'public/sponsors';
const PLACEHOLDER_IMAGE_PATH = 'public/logo.png';
const BACKERS_FILE_PATH = '.vitepress/data/sponsors/backers.ts';
const BRONZE_SPONSORS_FILE_PATH = '.vitepress/data/sponsors/bronzeSponsors.ts';
const SILVER_SPONSORS_FILE_PATH = '.vitepress/data/sponsors/silverSponsors.ts';
const GOLD_SPONSORS_FILE_PATH = '.vitepress/data/sponsors/goldSponsors.ts';
const PLATINUM_SPONSORS_FILE_PATH = '.vitepress/data/sponsors/platinumSponsors.ts';
const OPEN_COLLECTIVE_API_URL = 'https://opencollective.com/seed4j/members.json';
const IMAGE_EXTENSION = '.png';

const BACKERS_FILE_TEMPLATE = `import type { Sponsor } from './sponsors';

export const backer: Sponsor[] = [{{CONTENT}}];
`;

const BRONZE_SPONSORS_FILE_TEMPLATE = `import type { Sponsor } from './sponsors';

export const bronze: Sponsor[] = [{{CONTENT}}];
`;

const SILVER_SPONSORS_FILE_TEMPLATE = `import type { Sponsor } from './sponsors';

export const silver: Sponsor[] = [{{CONTENT}}];
`;

const GOLD_SPONSORS_FILE_TEMPLATE = `import type { Sponsor } from './sponsors';

export const gold: Sponsor[] = [{{CONTENT}}];
`;

const PLATINUM_SPONSORS_FILE_TEMPLATE = `import type { Sponsor } from './sponsors';

export const platinum: Sponsor[] = [{{CONTENT}}];
`;

export async function generate(): Promise<void> {
  return fetchSeed4jMembers().then(async seed4jMembers =>
    prefetchSponsors(seed4jMembers, 'backer', BACKERS_FILE_PATH, BACKERS_FILE_TEMPLATE)
      .then(() => prefetchSponsors(seed4jMembers, 'Bronze sponsor', BRONZE_SPONSORS_FILE_PATH, BRONZE_SPONSORS_FILE_TEMPLATE))
      .then(() => prefetchSponsors(seed4jMembers, 'Silver sponsor', SILVER_SPONSORS_FILE_PATH, SILVER_SPONSORS_FILE_TEMPLATE))
      .then(() => prefetchSponsors(seed4jMembers, 'Gold sponsor', GOLD_SPONSORS_FILE_PATH, GOLD_SPONSORS_FILE_TEMPLATE))
      .then(() => prefetchSponsors(seed4jMembers, 'Platinum sponsor', PLATINUM_SPONSORS_FILE_PATH, PLATINUM_SPONSORS_FILE_TEMPLATE)),
  );
}

const fetchSeed4jMembers = async (): Promise<Seed4jMember[]> => fetch(OPEN_COLLECTIVE_API_URL).then(response => response.json());

const prefetchSponsors = async (seed4jMembers: Seed4jMember[], tier: OpenCollectiveTier, filePath: string, template: string) => {
  const existingSponsors = await readExistingSponsors(filePath);
  const activeSponsors = filterActiveSponsors(seed4jMembers, tier);
  const sponsors = mapToSponsor(activeSponsors, existingSponsors);
  const imageDownloadInfos = mapToImageDownloadInfo(activeSponsors, existingSponsors);

  const fileContent = generateFileContent(sponsors, template);
  return nodePromises.writeFile(filePath, fileContent, 'utf8').then(() => downloadAllImages(imageDownloadInfos));
};

const filterActiveSponsors = (members: Seed4jMember[], tier: OpenCollectiveTier): Seed4jMember[] =>
  members.filter(member => member.type === 'USER' && member.role === 'BACKER' && member.tier === tier && member.isActive);

const mapToSponsor = (members: Seed4jMember[], existingSponsors: Sponsor[]): Sponsor[] =>
  members.map(member => {
    if (guestMember(member)) {
      const existingSponsor = existingSponsors.find(sponsor => sponsor.memberId === member.MemberId);
      if (existingSponsor) {
        return existingSponsor;
      }
    }

    return {
      memberId: member.MemberId,
      name: member.name,
      url: member.website ?? member.profile,
      img: imageFilePath(member.profile, member.MemberId),
    };
  });

const mapToImageDownloadInfo = (members: Seed4jMember[], existingSponsors: Sponsor[]): ImageDownloadInfo[] =>
  members
    .filter(member => {
      if (guestMember(member)) {
        const existingSponsor = existingSponsors.find(sponsor => sponsor.memberId === member.MemberId);
        return !existingSponsor;
      }
      return true;
    })
    .map(member => {
      return {
        imageUrl: member.image,
        profile: member.profile,
        filename: imageFileName(member.profile, member.MemberId),
      };
    });

const imageFilePath = (profile: Seed4jMemberProfile, memberId: Seed4jMemberMemberId): string => {
  return `/sponsors/${imageFileName(profile, memberId)}`;
};

const imageFileName = (profile: Seed4jMemberProfile, memberId: Seed4jMemberMemberId): string => {
  const profileUsername = profile.split('/').pop();
  return `${profileUsername}-${memberId}${IMAGE_EXTENSION}`;
};

const generateFileContent = (sponsors: Sponsor[], template: string): string => {
  if (sponsors.length === 0) {
    return template.replace('{{CONTENT}}', '');
  }

  const sponsorsContent = sponsors
    .map(
      sponsor => `
  {
    memberId: ${sponsor.memberId},
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
