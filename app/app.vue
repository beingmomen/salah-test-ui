<template>
   <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

<script setup>
// import { useGlobalData } from '~/composables/useGlobalData'

const { fetchGlobalData } = useGlobalData()

  await fetchGlobalData()
</script>