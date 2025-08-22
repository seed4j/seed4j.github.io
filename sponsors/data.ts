// sponsors/data.ts
export type Sponsor = { name: string; url: string; logo: string };

export const sponsors: Record<'platinum' | 'gold' | 'silver' | 'bronze', Sponsor[]> = {
  platinum: [],
  gold: [],
  silver: [],
  bronze: [
    {
      name: 'Geoffray Gruel',
      url: 'https://www.linkedin.com/in/ggruel/',
      logo: 'https://avatars.githubusercontent.com/u/996402?v=4'
    },
  ],
};
