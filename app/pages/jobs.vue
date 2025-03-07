<template>
  <div class="min-h-screen">
    <div class="container mx-auto p-4">
      <!-- Hide all content until viewport is ready -->
      <div v-if="isViewportReady" class="flex gap-8">
        <!-- Mobile Filter Button -->
        <UButton
          v-if="isMobileView"
          class="fixed bottom-4 right-4 z-50"
          color="primary"
          @click="showMobileFilters = true"
        >
          <div class="flex items-center gap-2">
            <Icon name="i-lucide-filter" />
            Filters
          </div>
        </UButton>

        <!-- Mobile Filters Sidebar -->
        <Teleport to="body">
          <div v-if="isMobileView" 
            class="fixed inset-0 z-50 bg-black bg-opacity-50 transition-opacity"
            :class="{ 'opacity-0 pointer-events-none': !showMobileFilters, 'opacity-100': showMobileFilters }"
            @click="showMobileFilters = false"
          >
            <div 
              class="fixed inset-y-0 left-0 w-80 bg-white dark:bg-gray-900 transform transition-transform duration-300 overflow-y-auto"
              :class="{ '-translate-x-full': !showMobileFilters, 'translate-x-0': showMobileFilters }"
              @click.stop
            >
              <div class="p-4 space-y-6">
                <div class="flex items-center justify-between">
                  <h3 class="text-lg font-semibold">Filters</h3>
                  <UButton icon="i-lucide-x" color="gray" variant="ghost" @click="showMobileFilters = false" />
                </div>

                <UInput
                  v-model="pendingSearchQuery"
                  placeholder="Search jobs..."
                  icon="i-lucide-search"
                />

                <div>
                  <div class="flex items-center justify-between mb-2">
                    <h4 class="font-semibold">Departments</h4>
                    <UCheckbox
                      v-model="selectAllDepartments"
                      label="All"
                      @change="toggleAllDepartments"
                    />
                  </div>
                  <ul class="space-y-2">
                    <li v-for="dept in allData.departments" :key="dept.documentNumber" class="flex items-center justify-between">
                      <UCheckbox
                        :model-value="pendingDepartments.includes(String(dept.documentNumber))"
                        :label="dept.name"
                        @update:model-value="(checked) => {
                          selectAllDepartments = false;
                          if (checked) {
                            pendingDepartments.push(String(dept.documentNumber))
                          } else {
                            const index = pendingDepartments.indexOf(String(dept.documentNumber))
                            if (index > -1) {
                              pendingDepartments.splice(index, 1)
                            }
                          }
                        }"
                      />

                      <UBadge>
                        {{ dept.jobCount }}
                      </UBadge>
                    </li>
                  </ul>
                </div>

                <div>
                  <div class="flex items-center justify-between mb-2">
                    <h4 class="font-semibold">Locations</h4>
                    <UCheckbox
                      v-model="selectAllLocations"
                      label="All"
                      @change="toggleAllLocations"
                    />
                  </div>
                  <ul class="space-y-2">
                    <li v-for="location in allData.locations" :key="location.documentNumber" class="flex items-center justify-between">
                      <UCheckbox
                        :model-value="pendingLocations.includes(String(location.documentNumber))"
                        :label="location.name"
                        @update:model-value="(checked) => {
                          selectAllLocations = false;
                          if (checked) {
                            pendingLocations.push(String(location.documentNumber))
                          } else {
                            const index = pendingLocations.indexOf(String(location.documentNumber))
                            if (index > -1) {
                              pendingLocations.splice(index, 1)
                            }
                          }
                        }"
                      />

                      <UBadge>
                        {{ location.jobCount }}
                      </UBadge>
                    </li>
                  </ul>
                </div>

                <div>
                  <div class="flex items-center justify-between mb-2">
                    <h4 class="font-semibold">Levels</h4>
                    <UCheckbox
                      v-model="selectAllLevels"
                      label="All"
                      @change="toggleAllLevels"
                    />
                  </div>
                  <ul class="space-y-2">
                    <li v-for="level in allData.levels" :key="level.documentNumber" class="flex items-center justify-between"> 
                      <UCheckbox
                        :model-value="pendingLevels.includes(String(level.documentNumber))"
                        :label="level.name"
                        @update:model-value="(checked) => {
                          selectAllLevels = false;
                          if (checked) {
                            pendingLevels.push(String(level.documentNumber))
                          } else {
                            const index = pendingLevels.indexOf(String(level.documentNumber))
                            if (index > -1) {
                              pendingLevels.splice(index, 1)
                            }
                          }
                        }"
                      />

                      <UBadge>
                        {{ level.jobCount }}
                      </UBadge>
                    </li>
                  </ul>
                </div>

                <div class="flex justify-between gap-4 mt-8">
                  <UButton
                    color="gray"
                    variant="soft"
                    @click="resetMobileFilters"
                  >
                    Reset
                  </UButton>
                  <UButton
                    color="primary"
                    @click="() => {
                      applyMobileFilters()
                      showMobileFilters = false
                    }"
                  >
                    Apply Filters
                  </UButton>
                </div>
              </div>
            </div>
          </div>
        </Teleport>

        <!-- Desktop Sidebar -->
        <div v-if="!isMobileView" class="w-80 flex-shrink-0 space-y-6">
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
                <h3 class="text-lg font-semibold">Filters</h3>
                <UButton
                  color="gray"
                  variant="soft"
                  size="sm"
                  @click="resetFilters"
                >
                  Reset All
                </UButton>
              </div>
            </template>

            <div class="space-y-6">
              <div>
                <div class="flex items-center justify-between mb-2">
                  <h4 class="font-semibold">Departments</h4>
                  <UCheckbox
                    v-model="selectAllDepartments"
                    label="All"
                    @change="toggleAllDepartments"
                  />
                </div>
                <ul class="space-y-2">
                  <li v-for="dept in allData.departments" :key="dept.documentNumber" class="flex items-center justify-between">
                    <UCheckbox
                      :model-value="selectedDepartments.includes(String(dept.documentNumber))"
                      :label="dept.name"
                      @update:model-value="(checked) => {
                        selectAllDepartments = false;
                        if (checked) {
                          selectedDepartments.push(String(dept.documentNumber))
                          updateFilters()
                        } else {
                          const index = selectedDepartments.indexOf(String(dept.documentNumber))
                          if (index > -1) {
                            selectedDepartments.splice(index, 1)
                            updateFilters()
                          }
                        }
                      }"
                    />

                    <UBadge>
                      {{ dept.jobCount }}
                    </UBadge>
                  </li>
                </ul>
              </div>

              <div>
                <div class="flex items-center justify-between mb-2">
                  <h4 class="font-semibold">Locations</h4>
                  <UCheckbox
                    v-model="selectAllLocations"
                    label="All"
                    @change="toggleAllLocations"
                  />
                </div>
                <ul class="space-y-2">
                  <li v-for="location in allData.locations" :key="location.documentNumber" class="flex items-center justify-between">
                    <UCheckbox
                      :model-value="selectedLocations.includes(String(location.documentNumber))"
                      :label="location.name"
                      @update:model-value="(checked) => {
                        selectAllLocations = false;
                        if (checked) {
                          selectedLocations.push(String(location.documentNumber))
                          updateFilters()
                        } else {
                          const index = selectedLocations.indexOf(String(location.documentNumber))
                          if (index > -1) {
                            selectedLocations.splice(index, 1)
                            updateFilters()
                          }
                        }
                      }"
                    />

                    <UBadge>
                      {{ location.jobCount }}
                    </UBadge>
                  </li>
                </ul>
              </div>

              <div>
                <div class="flex items-center justify-between mb-2">
                  <h4 class="font-semibold">Levels</h4>
                  <UCheckbox
                    v-model="selectAllLevels"
                    label="All"
                    @change="toggleAllLevels"
                  />
                </div>
                <ul class="space-y-2">
                  <li v-for="level in allData.levels" :key="level.documentNumber" class="flex items-center justify-between">
                    <UCheckbox
                      :model-value="selectedLevels.includes(String(level.documentNumber))"
                      :label="level.name"
                      @update:model-value="(checked) => {
                        selectAllLevels = false;
                        if (checked) {
                          selectedLevels.push(String(level.documentNumber))
                          updateFilters()
                        } else {
                          const index = selectedLevels.indexOf(String(level.documentNumber))
                          if (index > -1) {
                            selectedLevels.splice(index, 1)
                            updateFilters()
                          }
                        }
                      }"
                    />

                    <UBadge>
                      {{ level.jobCount }}
                    </UBadge>
                    </li>
                </ul>
              </div>
            </div>
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
      <!-- Loading state -->
      <div v-else class="w-full h-screen flex items-center justify-center">
        <USkeleton class="h-full w-full max-w-sm" />
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
  isMobileView,
  pendingSearchQuery,
  pendingDepartments,
  pendingLocations,
  pendingLevels,
  showMobileFilters,
  applyMobileFilters,
  resetMobileFilters,
  resetFilters,
  isViewportReady,
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
