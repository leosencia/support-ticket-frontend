<template>
    <div class="p-4">
      <div class="mb-4">
        <h1 class="text-2xl font-bold m-0">Dashboard</h1>
        <p class="text-color-secondary mt-1">Overview of all support tickets</p>
      </div>
  
      <!-- Loading -->
      <div v-if="loading" class="flex justify-content-center p-6">
        <ProgressSpinner />
      </div>
  
      <!-- Error -->
      <Message v-else-if="error" severity="error" :closable="false">
        Failed to load dashboard data.
      </Message>
  
      <!-- Stats cards -->
      <div v-else class="grid">
  
        <div class="col-12 md:col-6 lg:col-3">
          <Card class="h-full">
            <template #content>
              <div class="flex align-items-center gap-3">
                <div class="flex align-items-center justify-content-center border-round"
                  style="width: 48px; height: 48px; background: var(--blue-100)">
                  <i class="pi pi-ticket text-2xl" style="color: var(--blue-500)" />
                </div>
                <div>
                  <p class="text-color-secondary m-0 text-sm">Total Tickets</p>
                  <p class="text-3xl font-bold m-0">{{ stats.totalTickets }}</p>
                </div>
              </div>
            </template>
          </Card>
        </div>
  
        <div class="col-12 md:col-6 lg:col-3">
          <Card class="h-full">
            <template #content>
              <div class="flex align-items-center gap-3">
                <div class="flex align-items-center justify-content-center border-round"
                  style="width: 48px; height: 48px; background: var(--cyan-100)">
                  <i class="pi pi-inbox text-2xl" style="color: var(--cyan-500)" />
                </div>
                <div>
                  <p class="text-color-secondary m-0 text-sm">Open Tickets</p>
                  <p class="text-3xl font-bold m-0">{{ stats.openTickets }}</p>
                </div>
              </div>
            </template>
          </Card>
        </div>
  
        <div class="col-12 md:col-6 lg:col-3">
          <Card class="h-full">
            <template #content>
              <div class="flex align-items-center gap-3">
                <div class="flex align-items-center justify-content-center border-round"
                  style="width: 48px; height: 48px; background: var(--green-100)">
                  <i class="pi pi-check-circle text-2xl" style="color: var(--green-500)" />
                </div>
                <div>
                  <p class="text-color-secondary m-0 text-sm">Resolved</p>
                  <p class="text-3xl font-bold m-0">{{ stats.resolvedTickets }}</p>
                </div>
              </div>
            </template>
          </Card>
        </div>
  
        <div class="col-12 md:col-6 lg:col-3">
          <Card class="h-full">
            <template #content>
              <div class="flex align-items-center gap-3">
                <div class="flex align-items-center justify-content-center border-round"
                  style="width: 48px; height: 48px; background: var(--red-100)">
                  <i class="pi pi-exclamation-triangle text-2xl" style="color: var(--red-500)" />
                </div>
                <div>
                  <p class="text-color-secondary m-0 text-sm">High Priority</p>
                  <p class="text-3xl font-bold m-0">{{ stats.highPriorityTickets }}</p>
                </div>
              </div>
            </template>
          </Card>
        </div>
  
      </div>
  
      <!-- Quick link to manage tickets -->
      <Card class="mt-4">
        <template #content>
          <div class="flex align-items-center justify-content-between">
            <div>
              <h3 class="m-0 font-semibold">Manage Tickets</h3>
              <p class="text-color-secondary m-0 mt-1">
                View, filter, assign and update all tickets
              </p>
            </div>
            <Button
              label="Go to Tickets"
              icon="pi pi-arrow-right"
              iconPos="right"
              @click="router.push('/admin/tickets')"
            />
          </div>
        </template>
      </Card>
  
    </div>
</template>
  
<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuery } from '@vue/apollo-composable'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Message from 'primevue/message'
import ProgressSpinner from 'primevue/progressspinner'
import { GET_DASHBOARD_STATS } from '../../graphql/queries'
  
const router = useRouter()
  
const { result, loading, error } = useQuery(GET_DASHBOARD_STATS, null, {
    fetchPolicy: 'network-only'
})
  
const stats = computed(() => result.value?.dashboardStats ?? {
    totalTickets: 0,
    openTickets: 0,
    resolvedTickets: 0,
    highPriorityTickets: 0
})
</script>