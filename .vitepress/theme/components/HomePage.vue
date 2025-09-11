<script setup lang="ts">
import { VPButton, VPHomeSponsors } from 'vitepress/theme';
import { onMounted, onUnmounted, ref } from 'vue';
import { sponsors } from '../../data/sponsors/sponsors';

const backersImageWidth = ref(310);

const updateBackersWidth = () => {
  if (window.innerWidth >= 768) {
    backersImageWidth.value = 760;
  } else {
    backersImageWidth.value = 310;
  }
};

onMounted(() => {
  updateBackersWidth();
  window.addEventListener('resize', updateBackersWidth);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateBackersWidth);
});
</script>

<template>
  <div class="content">
    <div class="content-container">
      <main class="main">
        <VPHomeSponsors
          v-if="sponsors"
          message="Seed4J is planted 🌱 by the community, grown with the support of amazing sponsors."
          :data="sponsors"
        />
        <div class="vp-backer">
          <div class="container">
            <section class="vp-backer-section">
              <h3 class="vp-backer-tier">Backers</h3>
              <div class="vp-backer-grid-item">
                <object
                  :data="`https://opencollective.com/seed4j/tiers/backers.svg?avatarHeight=40&width=${backersImageWidth}&button=false`"
                  type="image/svg+xml"
                  aria-label="Backers"
                >
                  Backers
                </object>
              </div>
            </section>
          </div>
        </div>
        <div class="action">
          <VPButton theme="sponsor" :text="`💚 Sponsor Seed4J`" :href="`https://opencollective.com/seed4j`" />
        </div>
      </main>
    </div>
  </div>
</template>

<style>
.VPHomeSponsors {
  margin: 96px 0 0 0 !important;
}

.vp-sponsor {
  border-radius: 16px 16px 0 0 !important;
}

.vp-sponsor-grid-image {
  max-width: 100%;
  filter: none !important;
  transition: filter 0.25s;
  border-radius: 50%;
}

.dark .vp-sponsor-grid-image {
  filter: none !important;
}

.dark .vp-sponsor-grid-item:hover {
  background-color: var(--vp-c-bg-soft) !important;
}

.vp-sponsor-grid.xmini .vp-sponsor-grid-image {
  max-width: 64px;
  max-height: 35px !important;
}

.vp-sponsor-grid.mini .vp-sponsor-grid-image {
  max-width: 96px;
  max-height: 40px !important;
}

.vp-sponsor-grid.small .vp-sponsor-grid-image {
  max-width: 96px;
  max-height: 45px !important;
}

.vp-sponsor-grid.medium .vp-sponsor-grid-image {
  max-width: 120px;
  max-height: 50px !important;
}

.vp-sponsor-grid.big .vp-sponsor-grid-image {
  max-width: 192px;
  max-height: 60px !important;
}

.dark .vp-sponsor-grid-image {
  filter: none !important;
}

.dark .vp-sponsor-grid-item:hover {
  background-color: var(--vp-c-default-soft) !important;
}
</style>

<style scoped>

.vp-backer {
  padding: 0 24px;
}

@media (min-width: 768px) {
  .vp-backer {
    padding: 0 48px;
  }
}

@media (min-width: 960px) {
  .vp-backer {
    padding: 0 64px;
  }
}

.container {
  margin: 0 auto;
  max-width: 1152px;
}

.vp-backer-section {
  padding: 4px 0 0 0;
  border-radius: 0 0 16px 16px;
  overflow: hidden;
}

.vp-backer-tier {
  padding: 13px 0 11px;
  font-size: 14px;
  margin: 0 0 4px !important;
  text-align: center;
  letter-spacing: 1px !important;
  line-height: 24px;
  width: 100%;
  font-weight: 600;
  color: var(--vp-c-text-2);
  background-color: var(--vp-c-bg-soft);
}

.vp-backer-grid-item {
  padding: 10px;
  background-color: var(--vp-c-bg-soft);
  transition: background-color 0.25s;
}

object {
  color-scheme: light;
}

.action {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 30px;
}
</style>
