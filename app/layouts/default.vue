<template>
  <div class="flex flex-col min-h-screen">
    <!-- Navbar -->
    <nav class="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div class="container mx-auto px-4">
        <div class="flex justify-between items-center h-16">
          <!-- Logo and Brand -->
          <div class="flex items-center">
            <NuxtLink :to="{ path: '/' }" class="flex items-center space-x-2">
              <UIcon name="i-lucide-briefcase" class="text-primary text-2xl" />
              <span class="font-bold text-xl text-gray-900">JobPortal</span>
            </NuxtLink>
          </div>

          <!-- Navigation Links -->
          <div class="hidden md:flex items-center space-x-8">
            <NuxtLink :to="{ path: '/' }" class="text-gray-700 hover:text-primary transition-colors">
              Home
            </NuxtLink>
            <NuxtLink :to="{ path: '/jobs', query: $route.query }" class="text-gray-700 hover:text-primary transition-colors">
              Jobs
            </NuxtLink>
            <NuxtLink :to="{ path: '/internships', query: $route.query }" class="text-gray-700 hover:text-primary transition-colors">
              Internships
            </NuxtLink>
          </div>

          <!-- Right Side Actions -->
          <div class="flex items-center space-x-4">
            <!-- <UButton
              color="gray"
              variant="ghost"
              icon="i-lucide-bell"
              class="hidden md:flex"
            />
            <UButton
              color="primary"
              variant="solid"
              icon="i-lucide-user"
              label="Sign In"
              class="hidden md:flex"
            /> -->
            
            <!-- Mobile Menu Button -->
            <UButton
              color="gray"
              variant="ghost"
              icon="i-lucide-menu"
              class="md:hidden"
              @click="isMenuOpen = !isMenuOpen"
            />
          </div>
        </div>

        <!-- Mobile Navigation Menu -->
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="transform -translate-y-2 opacity-0"
          enter-to-class="transform translate-y-0 opacity-100"
          leave-active-class="transition duration-100 ease-in"
          leave-from-class="transform translate-y-0 opacity-100"
          leave-to-class="transform -translate-y-2 opacity-0"
        >
          <div v-if="isMenuOpen" class="md:hidden py-2 space-y-2">
            <NuxtLink
              v-for="link in ['Home', 'Jobs', 'Internships']"
              :key="link"
              :to="{ 
                path: link === 'Home' ? '/' : `/${link.toLowerCase()}`,
                query: $route.query
              }"
              class="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
              @click="isMenuOpen = false"
            >
              {{ link }}
            </NuxtLink>
            <div class="px-4 py-2 space-y-2">
              <UButton
                color="primary"
                variant="solid"
                icon="i-lucide-user"
                label="Sign In"
                block
              />
            </div>
          </div>
        </Transition>
      </div>
    </nav>

    <!-- Main Content -->
    <slot />
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
const isMenuOpen = ref(false)
const route = useRoute()
</script>

<style scoped>
/* .router-link-active {
  @apply text-primary font-medium;
} */
</style>
