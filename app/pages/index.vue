<template>
  <div class="container mx-auto py-10 px-4">
    <div class="max-w-2xl mx-auto space-y-8">
      <h1 class="text-3xl font-bold text-center">Find Your Dream Job</h1>
      
      <div class="flex gap-4 items-center justify-center">
        <UInput
          v-model="searchQuery"
          placeholder="Search for jobs..."
          size="lg"
          icon="i-lucide-search"
        />
        
        <USelect
          v-model="selectedLocation"
          :items="locations"
          value-key="documentNumber"
          label-key="name"
          placeholder="Select location"
          size="lg"
        />
        
        <UButton
          size="lg"
          @click="handleSearch"
        >
          Search Jobs
        </UButton>
      </div>

    </div>
  </div>
</template>

<script setup>
import { useGlobalData } from '~/composables/useGlobalData'
const router = useRouter()

const selectedLocation = ref('')
const searchQuery = ref('')

const { allData } = useGlobalData()
const locations = computed(() => allData.value.locations || [])
selectedLocation.value = locations.value[0]?.documentNumber

const handleSearch = () => {
  const query = new URLSearchParams()
  
  if (searchQuery.value) {
    query.append('search', searchQuery.value)
  }
  
  if (selectedLocation.value) {
    query.append('location', selectedLocation.value)
  }
  
  router.push(`/jobs?${query.toString()}`)
}
</script>
