import { backer } from './backers';
import { bronze } from './bronzeSponsors';
import { silver } from './silverSponsors';
import { gold } from './goldSponsors';
import { platinum } from './platinumSponsors';

export type Sponsor = {
  memberId: number;
  name: string;
  img: string;
  url: string;
};

type SponsorTier = 'platinum' | 'gold' | 'silver' | 'bronze' | 'backers';

type SponsorTierConfig = {
  tier: string;
  size: string;
  items: Sponsor[];
};

const sponsorData = {
  platinum: platinum,
  gold: gold,
  silver: silver,
  bronze: bronze,
  backers: backer,
} satisfies Record<SponsorTier, Sponsor[]>;

const tierConfig: Record<SponsorTier, { displayName: string; size: string }> = {
  platinum: { displayName: 'Platinum sponsors', size: 'big' },
  gold: { displayName: 'Gold sponsors', size: 'medium' },
  silver: { displayName: 'Silver sponsors', size: 'small' },
  bronze: { displayName: 'Bronze sponsors', size: 'mini' },
  backers: { displayName: 'Backers', size: 'xmini' },
};

const tierOrder: SponsorTier[] = ['platinum', 'gold', 'silver', 'bronze', 'backers'];

const generateSponsors = (): SponsorTierConfig[] => {
  const sponsorTiers: SponsorTierConfig[] = [];

  tierOrder.forEach(tierKey => {
    const sponsors = sponsorData[tierKey];
    if (sponsors.length > 0) {
      sponsorTiers.push({
        tier: tierConfig[tierKey].displayName,
        size: tierConfig[tierKey].size,
        items: sponsors,
      });
    }
  });

  return sponsorTiers;
};

export const sponsors= generateSponsors();
