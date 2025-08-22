<script setup lang="ts">
import { sponsors as staticSponsors } from '../../../sponsors/data';
import { VPButton } from 'vitepress/theme';

type Sponsor = { name: string; url: string; logo: string | null };
const sponsors: Record<'platinum' | 'gold' | 'silver' | 'bronze', Sponsor[]> = staticSponsors;

const titleMap: Record<string, string> = {
  platinum: 'Platinum',
  gold: 'Gold',
  silver: 'Silver',
  bronze: 'Bronze',
};
</script>

<template>
  <section id="sponsors" class="sponsors">
    <h2 class="sponsors__title">Sponsors</h2>
    <p class="sponsors__tagline">Seed4J is planted 🌱 by the community, grown with the support of amazing sponsors.</p>

    <div v-for="(list, tier) in sponsors" :key="tier" class="sponsors__tier" :class="tier">
      <template v-if="Array.isArray(list) && list.length">
        <h3 class="sponsors__tier-title">{{ titleMap[tier] ?? tier }} sponsors</h3>
        <div class="sponsors__grid">
          <a v-for="s in list" :key="s.name" :href="s.url" target="_blank" rel="noopener" class="sponsors__card" :class="tier">
            <template v-if="s.logo">
              <img :src="s.logo" :alt="s.name" />
            </template>
            <template v-else>
              <div class="sponsors__name">{{ s.name }}</div>
            </template>
          </a>
        </div>
      </template>
    </div>

    <div class="sponsors__tier backers">
      <h3 class="sponsors__tier-title">Backers</h3>
      <div class="sponsors__grid">
        <a href="https://opencollective.com/seed4j/" target="_blank" rel="noopener">
          <img src="https://opencollective.com/seed4j/tiers/backers.svg?button=false" alt="Backers" />
        </a>
      </div>
    </div>

    <div class="sponsors__cta">
      <VPButton theme="alt" text="💚 Sponsor Seed4J" href="https://opencollective.com/seed4j" rel="noopener" target="_blank" />
    </div>
  </section>
</template>

<style scoped>
.sponsors {
  margin-top: 2rem;
}
.sponsors__title {
  font-size: 1.8rem;
  margin-bottom: 0.25rem;
}
.sponsors__tagline {
  opacity: 0.8;
  margin-bottom: 1rem;
}

.sponsors__tier {
  margin-top: 1.5rem;
}
.sponsors__tier-title {
  font-size: 1.2rem;
  margin: 0.5rem 0;
}
.sponsors__grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  align-items: center;
}

.sponsors__card img {
  max-width: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
}
.sponsors__card.platinum img {
  max-height: 300px;
}
.sponsors__card.gold img {
  max-height: 150px;
}
.sponsors__card.silver img {
  max-height: 100px;
}
.sponsors__card.bronze img {
  max-height: 48px;
}

.sponsors__card {
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  padding: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: opacity 0.2s ease;
}
.sponsors__card:hover {
  opacity: 0.9;
}

.sponsors__name {
  font-size: 1rem;
  font-weight: bold;
  text-align: center;
  padding: 12px;
  color: var(--vp-c-text);
}

.sponsors__cta {
  margin-top: 1.5rem;
  display: flex;
  justify-content: center;
}

.sponsors__cta :deep(a) {
  text-decoration: none !important;
}
</style>
