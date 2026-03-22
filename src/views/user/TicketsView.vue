<template>
    <div class="p-4">
      <div class="flex justify-content-between align-items-center mb-4">
        <div>
          <h1 class="text-2xl font-bold m-0">My Tickets</h1>
          <p class="text-color-secondary mt-1">Track and manage your support requests</p>
        </div>
        <Button
          label="New Ticket"
          icon="pi pi-plus"
          @click="router.push('/tickets/new')"
        />
      </div>
  
      <!-- Loading state -->
      <div v-if="loading" class="flex justify-content-center p-6">
        <ProgressSpinner />
      </div>
  
      <!-- Error state -->
      <Message v-else-if="error" severity="error" :closable="false">
        Failed to load tickets. Please try again.
      </Message>
  
      <!-- Empty state -->
      <div
        v-else-if="tickets.length === 0"
        class="flex flex-column align-items-center justify-content-center p-6"
      >
        <i class="pi pi-inbox text-6xl text-color-secondary mb-3" />
        <h3 class="text-color-secondary">No tickets yet</h3>
        <p class="text-color-secondary">Submit your first support request!</p>
        <Button
          label="Create Ticket"
          icon="pi pi-plus"
          class="mt-2"
          @click="router.push('/tickets/new')"
        />
      </div>
  
      <!-- Tickets list -->
      <div v-else class="flex flex-column gap-3">
        <Card
          v-for="ticket in tickets"
          :key="ticket.id"
          class="cursor-pointer hover:shadow-4 transition-all transition-duration-200"
          @click="router.push(`/tickets/${ticket.id}`)"
        >
          <template #content>
            <div class="flex justify-content-between align-items-start">
              <div class="flex flex-column gap-2">
                <span class="font-semibold text-lg">{{ ticket.subject }}</span>
                <div class="flex gap-2 align-items-center">
                  <Tag
                    :value="ticket.status.replace('_', ' ')"
                    :severity="getStatusSeverity(ticket.status)"
                  />
                  <Tag
                    :value="ticket.priority"
                    :severity="getPrioritySeverity(ticket.priority)"
                  />
                  <Tag :value="ticket.category" severity="secondary" />
                </div>
              </div>
              <span class="text-color-secondary text-sm">
                {{ formatDate(ticket.createdAt) }}
              </span>
            </div>
          </template>
        </Card>
      </div>
  
    </div>
</template>
  
<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuery } from '@vue/apollo-composable'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Message from 'primevue/message'
import ProgressSpinner from 'primevue/progressspinner'
import { GET_TICKETS } from '../../graphql/queries'
  
const router = useRouter()
  
const { result, loading, error } = useQuery(GET_TICKETS, null, {
    fetchPolicy: 'network-only'
})
  
const tickets = computed(() => result.value?.tickets ?? [])
  
function getStatusSeverity(status) {
    const map = {
      open: 'info',
      in_progress: 'warning',
      resolved: 'success',
      closed: 'secondary'
    }
    return map[status] || 'secondary'
}
  
function getPrioritySeverity(priority) {
    const map = {
      low: 'secondary',
      medium: 'info',
      high: 'warning',
      critical: 'danger'
    }
    return map[priority] || 'secondary'
}   
  
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
}
</script>