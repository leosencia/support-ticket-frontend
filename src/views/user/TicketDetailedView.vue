<template>
  <div class="view-canvas">
    <header class="flex flex-wrap items-center gap-2 pb-1">
      <Button
        icon="pi pi-arrow-left"
        text
        rounded
        class="text-neutral-600 hover:bg-neutral-100/80"
        aria-label="Back to tickets"
        @click="router.push('/tickets')"
      />
      <div class="min-w-0">
        <h1 class="m-0 text-xl font-medium tracking-tight text-neutral-900 md:text-2xl">Ticket Details</h1>
        <p v-if="ticket" class="bento-label mt-1.5 m-0">#{{ ticket.id }}</p>
      </div>
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
      Failed to load ticket.
    </Message>

    <Message
      v-else-if="!ticket"
      severity="warn"
      :closable="false"
      class="rounded-[1.125rem] border border-amber-200/60 bg-amber-50/50 p-3 text-sm text-amber-950"
    >
      Ticket not found or you don't have permission to view it.
    </Message>

    <template v-else>
      <section class="bento-surface p-4 md:p-5">
        <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div class="min-w-0 flex-1">
            <p class="bento-label m-0 mb-1">Subject</p>
            <h2 class="m-0 text-lg font-semibold text-neutral-900 md:text-xl">{{ ticket.subject }}</h2>
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
          <span class="bento-label shrink-0">{{ formatDate(ticket.createdAt) }}</span>
        </div>
      </section>

      <section class="bento-surface bento-surface--muted p-4 md:p-5">
        <p class="bento-label m-0 mb-2">Description</p>
        <p class="m-0 leading-relaxed text-neutral-800">{{ ticket.description }}</p>
      </section>

      <div v-if="ticket.status === 'open' && !showEditForm" class="flex flex-wrap gap-2">
        <Button
          label="Edit Ticket"
          icon="pi pi-pencil"
          rounded
          class="border-0 bg-neutral-900 px-5 text-white shadow-sm hover:bg-neutral-800"
          @click="openEditForm"
        />
        <Button
          label="Cancel Ticket"
          icon="pi pi-times"
          severity="danger"
          text
          :loading="deleteLoading"
          @click="confirmCancel"
        />
      </div>

      <section v-if="showEditForm" class="bento-surface bento-surface--muted p-4 md:p-6">
        <p class="bento-label m-0 mb-4">Edit ticket</p>
        <form class="flex flex-col gap-4" @submit.prevent="handleUpdate">
          <div class="flex flex-col gap-2">
            <label class="bento-label" for="edit-subject">Subject</label>
            <InputText id="edit-subject" v-model="editForm.subject" class="w-full rounded-xl border border-neutral-200/80 bg-white" />
          </div>

          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div class="flex flex-col gap-2">
              <label class="bento-label" for="edit-cat">Category</label>
              <Select
                id="edit-cat"
                v-model="editForm.category"
                :options="categoryOptions"
                optionLabel="label"
                optionValue="value"
                class="w-full"
              />
            </div>
            <div class="flex flex-col gap-2">
              <label class="bento-label" for="edit-pri">Priority</label>
              <Select
                id="edit-pri"
                v-model="editForm.priority"
                :options="priorityOptions"
                optionLabel="label"
                optionValue="value"
                class="w-full"
              />
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <label class="bento-label" for="edit-desc">Description</label>
            <Textarea
              id="edit-desc"
              v-model="editForm.description"
              rows="4"
              class="w-full rounded-xl border border-neutral-200/80 bg-white"
            />
          </div>

          <div
            v-if="serverError"
            class="rounded-[1.125rem] border border-red-200/60 bg-red-50/50 p-3"
          >
            <Message severity="error" :closable="false" class="border-0 bg-transparent p-0 text-sm text-red-900">
              {{ serverError }}
            </Message>
          </div>

          <div class="flex flex-wrap justify-end gap-2 border-t border-neutral-200/60 pt-4">
            <Button label="Discard" severity="secondary" text @click="showEditForm = false" />
            <Button
              type="submit"
              label="Save Changes"
              icon="pi pi-check"
              rounded
              :loading="updateLoading"
              class="border-0 bg-neutral-900 px-5 text-white shadow-sm hover:bg-neutral-800"
            />
          </div>
        </form>
      </section>
    </template>

    <ConfirmDialog />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuery, useMutation } from '@vue/apollo-composable'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import Message from 'primevue/message'
import ProgressSpinner from 'primevue/progressspinner'
import ConfirmDialog from 'primevue/confirmdialog'
import { GET_TICKET } from '../../graphql/queries'
import { UPDATE_TICKET, DELETE_TICKET } from '../../graphql/mutations'
import {
  titleCaseLabel,
  statusTagClass,
  priorityTagClass,
  getPrioritySeverity,
} from '@/utils/ticketLabels.js'

const router = useRouter()
const route = useRoute()
const toast = useToast()
const confirm = useConfirm()

const ticketId = computed(() => route.params.id)

const { result, loading, error } = useQuery(GET_TICKET, { id: ticketId })
const ticket = computed(() => result.value?.ticket ?? null)

const showEditForm = ref(false)
const serverError = ref('')
const editForm = ref({})

const categoryOptions = [
  { label: 'General', value: 'general' },
  { label: 'Technical', value: 'technical' },
  { label: 'Billing', value: 'billing' },
  { label: 'Other', value: 'other' },
]

const priorityOptions = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
  { label: 'Critical', value: 'critical' },
]

function openEditForm() {
  editForm.value = {
    subject: ticket.value.subject,
    description: ticket.value.description,
    category: ticket.value.category,
    priority: ticket.value.priority,
  }
  showEditForm.value = true
}

const { mutate: updateTicket, loading: updateLoading } = useMutation(UPDATE_TICKET, {
  refetchQueries: [{ query: GET_TICKET, variables: { id: ticketId.value } }],
})

async function handleUpdate() {
  serverError.value = ''
  try {
    const result = await updateTicket({
      id: ticketId.value,
      ...editForm.value,
    })

    const { errors: apiErrors } = result.data.updateTicket

    if (apiErrors && apiErrors.length > 0) {
      serverError.value = apiErrors[0]
      return
    }

    toast.add({
      severity: 'success',
      summary: 'Updated',
      detail: 'Ticket updated successfully',
      life: 3000,
    })

    showEditForm.value = false
  } catch {
    serverError.value = 'Something went wrong.'
  }
}

const { mutate: deleteTicket, loading: deleteLoading } = useMutation(DELETE_TICKET)

function confirmCancel() {
  confirm.require({
    message: 'Are you sure you want to cancel this ticket?',
    header: 'Cancel Ticket',
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Keep Ticket',
    acceptLabel: 'Yes, Cancel It',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        const result = await deleteTicket({ id: ticketId.value })
        const { errors: apiErrors } = result.data.deleteTicket

        if (apiErrors && apiErrors.length > 0) {
          toast.add({ severity: 'error', summary: 'Error', detail: apiErrors[0], life: 3000 })
          return
        }

        toast.add({
          severity: 'success',
          summary: 'Cancelled',
          detail: 'Your ticket has been cancelled',
          life: 3000,
        })

        router.push('/tickets')
      } catch {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Something went wrong', life: 3000 })
      }
    },
  })
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
</script>
