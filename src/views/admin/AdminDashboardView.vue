<template>
  <div class="view-canvas">
    <header class="pb-1">
      <h1 class="m-0 text-xl font-medium tracking-tight text-neutral-900 md:text-2xl">Dashboard</h1>
      <p class="bento-label mt-1.5 m-0 max-w-xl leading-relaxed">Overview of all support tickets</p>
    </header>

    <div v-if="loading" class="flex min-h-44 flex-1 items-center justify-center rounded-[1.125rem] border border-dashed border-neutral-200/80 bg-neutral-50/40 py-14">
      <ProgressSpinner strokeWidth="3" class="h-10 w-10 text-neutral-400" />
    </div>

    <Message
      v-else-if="error"
      severity="error"
      :closable="false"
      class="rounded-[1.125rem] border border-red-200/60 bg-red-50/50 p-3 text-sm text-red-900"
    >
      Failed to load dashboard data.
    </Message>

    <template v-else>
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-2.5 xl:grid-cols-4 xl:gap-3">
        <DashboardStatTile
          v-for="(tile, index) in statTiles"
          :key="tile.key"
          :label="tile.label"
          :value="stats[tile.key]"
          :icon="tile.icon"
          :muted="index % 2 === 1"
        />
      </div>

      <section
        class="bento-surface bento-surface--muted mt-1 flex flex-col gap-4 p-5 sm:mt-0 sm:flex-row sm:items-center sm:justify-between md:p-6"
      >
        <div class="min-w-0">
          <h2 class="m-0 text-base font-medium text-neutral-900 md:text-lg">Manage tickets</h2>
          <p class="bento-label m-0 mt-1">View, filter, assign and update all tickets</p>
        </div>
        <Button
          label="Go to Tickets"
          icon="pi pi-arrow-right"
          icon-pos="right"
          rounded
          class="shrink-0 border-0 bg-neutral-900 px-5 text-white shadow-sm hover:bg-neutral-800"
          @click="router.push('/admin/tickets')"
        />
      </section>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuery } from '@vue/apollo-composable'
import Button from 'primevue/button'
import Message from 'primevue/message'
import ProgressSpinner from 'primevue/progressspinner'
import DashboardStatTile from '../../components/DashboardStatTile.vue'
import { GET_DASHBOARD_STATS } from '../../graphql/queries'

const router = useRouter()

const statTiles = [
  { key: 'totalTickets', label: 'Total tickets', icon: 'pi pi-ticket' },
  { key: 'openTickets', label: 'Open tickets', icon: 'pi pi-inbox' },
  { key: 'resolvedTickets', label: 'Resolved', icon: 'pi pi-check-circle' },
  { key: 'highPriorityTickets', label: 'High priority', icon: 'pi pi-exclamation-triangle' },
]

const { result, loading, error } = useQuery(GET_DASHBOARD_STATS, null, {
  fetchPolicy: 'network-only',
})

const stats = computed(
  () =>
    result.value?.dashboardStats ?? {
      totalTickets: 0,
      openTickets: 0,
      resolvedTickets: 0,
      highPriorityTickets: 0,
    },
)
</script>
