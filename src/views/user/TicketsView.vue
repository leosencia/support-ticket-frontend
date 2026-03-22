<template>
  <div class="view-canvas">
    <header class="flex flex-col gap-4 pb-1 sm:flex-row sm:items-center sm:justify-between">
      <div class="min-w-0">
        <h1 class="m-0 text-xl font-medium tracking-tight text-neutral-900 md:text-2xl">My Tickets</h1>
        <p class="bento-label mt-1.5 m-0 max-w-xl leading-relaxed">Track and manage your support requests</p>
      </div>
      <Button
        label="New Ticket"
        icon="pi pi-plus"
        rounded
        class="shrink-0 border-0 bg-neutral-900 px-5 text-white shadow-sm hover:bg-neutral-800"
        @click="router.push('/tickets/new')"
      />
    </header>

    <div
      v-if="loading"
      class="flex min-h-44 flex-1 items-center justify-center rounded-[1.125rem] border border-dashed border-neutral-200/80 bg-neutral-50/40 py-14"
    >
      <ProgressSpinner strokeWidth="3" class="h-10 w-10 text-neutral-400" />
    </div>

    <Message
      v-else-if="error"
      severity="error"
      :closable="false"
      class="rounded-[1.125rem] border border-red-200/60 bg-red-50/50 p-3 text-sm text-red-900"
    >
      Failed to load tickets. Please try again.
    </Message>

    <div
      v-else-if="tickets.length === 0"
      class="flex flex-1 flex-col items-center justify-center gap-3 rounded-[1.125rem] border border-dashed border-neutral-200/80 bg-neutral-50/30 py-14 text-center"
    >
      <div class="bento-stat-icon">
        <i class="pi pi-inbox text-[0.95rem]" aria-hidden="true" />
      </div>
      <h3 class="m-0 text-base font-semibold text-neutral-900 md:text-lg">No tickets yet</h3>
      <p class="bento-label m-0 max-w-sm leading-relaxed">Submit your first support request and it will show up here.</p>
      <Button
        label="Create Ticket"
        icon="pi pi-plus"
        rounded
        class="mt-1 border-0 bg-neutral-900 px-5 text-white shadow-sm hover:bg-neutral-800"
        @click="router.push('/tickets/new')"
      />
    </div>

    <div v-else class="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-2.5">
      <section
        v-for="ticket in tickets"
        :key="ticket.id"
        class="bento-surface cursor-pointer p-4 transition-shadow duration-200 hover:shadow-sm md:p-5"
        role="button"
        tabindex="0"
        @click="router.push(`/tickets/${ticket.id}`)"
        @keydown.enter="router.push(`/tickets/${ticket.id}`)"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0 flex-1">
            <p class="bento-label m-0 mb-1">Subject</p>
            <span class="text-base font-semibold leading-snug text-neutral-900 md:text-lg">{{ ticket.subject }}</span>
            <div class="mt-2 flex flex-wrap gap-2">
              <Tag
                :value="titleCaseLabel(ticket.status)"
                severity="secondary"
                class="border-0"
                :class="statusTagClass(ticket.status)"
              />
              <Tag
                :value="titleCaseLabel(ticket.priority)"
                :severity="getPrioritySeverity(ticket.priority)"
                class="border-0"
                :class="priorityTagClass(ticket.priority)"
              />
              <Tag :value="titleCaseLabel(ticket.category)" severity="secondary" class="border-0" />
            </div>
          </div>
          <span class="bento-label shrink-0 whitespace-nowrap">{{ formatDate(ticket.createdAt) }}</span>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuery } from '@vue/apollo-composable'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Message from 'primevue/message'
import ProgressSpinner from 'primevue/progressspinner'
import { GET_TICKETS } from '../../graphql/queries'
import {
  titleCaseLabel,
  statusTagClass,
  priorityTagClass,
  getPrioritySeverity,
} from '@/utils/ticketLabels.js'

const router = useRouter()

const { result, loading, error } = useQuery(GET_TICKETS, null, {
  fetchPolicy: 'network-only',
})

const tickets = computed(() => result.value?.tickets ?? [])

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
</script>
