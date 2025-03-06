<template>
  <div class="container mx-auto py-8 px-4">
    <div class="flex gap-8">
      <!-- Sidebar -->
      <div class="w-80 flex-shrink-0 space-y-6">
        <UCard>
          <UInput
            v-model="searchQuery"
            placeholder="Search jobs..."
            icon="i-lucide-search"
          />
        </UCard>

        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold">Departments</h3>
              <UCheckbox
                v-model="selectAllDepartments"
                label="All"
                @change="toggleAllDepartments"
              />
            </div>
          </template>
          <ul class="space-y-2">
            <li v-for="dept in allData.departments" :key="dept.documentNumber">
              <UCheckbox
                :model-value="selectedDepartments.includes(String(dept.documentNumber))"
                :label="dept.name"
                @update:model-value="(checked) => {
                  if (checked) {
                    selectedDepartments.push(String(dept.documentNumber))
                  } else {
                    const index = selectedDepartments.indexOf(String(dept.documentNumber))
                    if (index > -1) {
                      selectedDepartments.splice(index, 1)
                    }
                  }
                  updateFilters()
                }"
              />
            </li>
          </ul>
        </UCard>

        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold">Locations</h3>
              <UCheckbox
                v-model="selectAllLocations"
                label="All"
                @change="toggleAllLocations"
              />
            </div>
          </template>
          <ul class="space-y-2">
            <li v-for="location in allData.locations" :key="location.documentNumber">
              <UCheckbox
                :model-value="selectedLocations.includes(String(location.documentNumber))"
                :label="location.name"
                @update:model-value="(checked) => {
                  if (checked) {
                    selectedLocations.push(String(location.documentNumber))
                  } else {
                    const index = selectedLocations.indexOf(String(location.documentNumber))
                    if (index > -1) {
                      selectedLocations.splice(index, 1)
                    }
                  }
                  updateFilters()
                }"
              />
            </li>
          </ul>
        </UCard>

        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold">Levels</h3>
              <UCheckbox
                v-model="selectAllLevels"
                label="All"
                @change="toggleAllLevels"
              />
            </div>
          </template>
          <ul class="space-y-2">
            <li v-for="level in allData.levels" :key="level.documentNumber">
              <UCheckbox
                :model-value="selectedLevels.includes(String(level.documentNumber))"
                :label="level.name"
                @update:model-value="(checked) => {
                  if (checked) {
                    selectedLevels.push(String(level.documentNumber))
                  } else {
                    const index = selectedLevels.indexOf(String(level.documentNumber))
                    if (index > -1) {
                      selectedLevels.splice(index, 1)
                    }
                  }
                  updateFilters()
                }"
              />
            </li>
          </ul>
        </UCard>
      </div>

      <!-- Main Content -->
      <div class="flex-1">
        <!-- <div v-if="loading" class="flex justify-center py-12">
          <ULoadingIcon />
        </div> -->

        <div v-if="jobs.length === 0" class="text-center py-12">
          <p class="text-lg text-gray-600">
            No jobs found matching your criteria
          </p>
        </div>

        <div v-else class="grid gap-6">
          <UCard v-for="job in jobs" :key="job.id" class="job-card">
            <template #header>
              <h3 class="text-lg font-semibold">{{ job.title }}</h3>
              <p class="text-sm text-gray-500">{{ job.company }}</p>
            </template>

            <div class="space-y-2">
              <p class="text-sm">{{ job.name }}</p>
              <time datetime="{{ job.createdAt }}">{{ job.createdAt }}</time>
              <div class="flex flex-wrap flex-col gap-2">
                <div class="flex items-center gap-1">
                  <span class="text-sm text-gray-100">Department:</span>
                  <UBadge v-if="job.department">{{
                    job.department.name
                  }}</UBadge>
                </div>
                <div class="flex items-center gap-1">
                  <span class="text-sm text-gray-100">Location:</span>
                  <UBadge v-if="job.location" color="neutral">{{
                    job.location.name
                  }}</UBadge>
                </div>
                <div class="flex items-center gap-1">
                  <span class="text-sm text-gray-100">Level:</span>
                  <UBadge v-if="job.level" color="info">{{
                    job.level.name
                  }}</UBadge>
                </div>
              </div>
            </div>

            <template #footer>
              <UButton
                block
                color="primary"
                variant="solid"
              >
                Apply Now
              </UButton>
            </template>
          </UCard>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useGlobalData } from "~/composables/useGlobalData";

const {
  fetchAllJobs,
  allData,
  jobs,
  searchQuery,
  selectAllDepartments,
  selectAllLocations,
  selectAllLevels,
  selectedDepartments,
  selectedLocations,
  selectedLevels,
  updateFilters,
  toggleAllDepartments,
  toggleAllLocations,
  toggleAllLevels,
} = useGlobalData();

await fetchAllJobs();
</script>

<style scoped>
.job-card {
  transition: transform 0.2s;
}

.job-card:hover {
  transform: translateY(-2px);
}
</style>
