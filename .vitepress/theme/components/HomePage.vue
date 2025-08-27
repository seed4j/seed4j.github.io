<script setup lang="ts">
import { VPHomeSponsors } from 'vitepress/theme';
import { sponsors } from '../../data/sponsors';
</script>

<template>
  <div class="content">
    <div class="content-container">
      <main class="main">
        <VPHomeSponsors
          v-if="sponsors"
          message="Seed4J is planted 🌱 by the community, grown with the support of amazing sponsors."
          :data="sponsors"
          :actionText="`💚 Sponsor Seed4J`"
          :actionLink="`https://opencollective.com/seed4j`"
        />
      </main>
    </div>
  </div>
</template>

<style scoped>
:deep(.vp-sponsor-grid-image) {
  max-width: 100%;
  filter: none !important;
  transition: filter 0.25s;
  border-radius: 50%;
}

:deep(.dark .vp-sponsor-grid-image) {
  filter: none !important;
}

:deep(.vp-sponsor-grid.xmini .vp-sponsor-grid-image) {
  max-width: 64px;
  max-height: 35px !important;
}

:deep(.vp-sponsor-grid.mini .vp-sponsor-grid-image) {
  max-width: 96px;
  max-height: 40px !important;
}

:deep(.vp-sponsor-grid.small .vp-sponsor-grid-image) {
  max-width: 96px;
  max-height: 45px !important;
}

:deep(.vp-sponsor-grid.medium .vp-sponsor-grid-image) {
  max-width: 120px;
  max-height: 50px !important;
}

:deep(.vp-sponsor-grid.big .vp-sponsor-grid-image) {
  max-width: 192px;
  max-height: 60px !important;
}
</style>
