<script setup lang="ts">
import {
  VPTeamMembers,
  VPTeamPage,
  VPTeamPageTitle,
} from 'vitepress/theme';
import { coreTeam } from '../../data/team';
</script>

<template>
  <VPTeamPage>
    <VPTeamPageTitle>
      <template #title>Meet the Team</template>
      <template #lead>
        The development of Seed4J is guided by Software Craftsmanship principles.
      </template>
    </VPTeamPageTitle>

    <VPTeamMembers :members="coreTeam" />
  </VPTeamPage>
</template>
