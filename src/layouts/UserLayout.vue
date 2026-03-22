<template>
  <div id="page-bg">
    <aside
      class="flex w-18 shrink-0 flex-col py-3 md:w-32"
      aria-label="Main navigation"
    >
      <nav class="flex flex-1 flex-col items-center justify-center gap-2 py-8" role="navigation">
        <SidebarRailIcon
          to="/tickets"
          icon="pi pi-inbox"
          label="My tickets"
          :active="isMyTicketsRoute"
        />
        <SidebarRailIcon
          to="/tickets/new"
          icon="pi pi-plus"
          label="Create new ticket"
          :active="isNewTicketRoute"
        />
      </nav>

      <div class="flex flex-col items-center gap-2 pb-5">
        <SidebarRailIcon icon="pi pi-sign-out" label="Log out" @click="handleLogout" />
      </div>
    </aside>

    <main
      class="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden pr-4 py-6 md:pr-8 md:py-8"
    >
      <!-- Scrollport: fixed flex height so .view-canvas min-height:100% works, tall content scrolls here -->
      <div
        class="layout-main-scroll min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain"
      >
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import SidebarRailIcon from '../components/layout/SidebarRailIcon.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const isNewTicketRoute = computed(() => route.path === '/tickets/new')

const isMyTicketsRoute = computed(() => {
  if (route.path === '/tickets/new') return false
  return route.path === '/tickets' || /^\/tickets\/[^/]+$/.test(route.path)
})

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>
