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
          message="Seed4J is planted 🌱 by the community, grown with the support of amazing sponsorsData."
          :data="sponsors"
          :actionText="`💚 Sponsor Seed4J`"
          :actionLink="`https://opencollective.com/seed4j`"
        />
      </main>
    </div>
  </div>
</template>
