<template>
  <div class="view-canvas">
    <header>
      <h1 class="m-0 text-xl font-medium tracking-tight text-neutral-900 md:text-2xl">Manage Tickets</h1>
      <p class="bento-label mt-1 m-0">View, filter, assign and update all tickets</p>
    </header>

    <div class="border-b border-neutral-200/60 pb-4">
      <p class="bento-label m-0 mb-3">Filters</p>
      <div class="flex flex-wrap gap-2">
        <Select
          v-model="filters.status"
          :options="statusOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Filter by Status"
          showClear
          class="min-w-[10rem] flex-1"
        />
        <Select
          v-model="filters.priority"
          :options="priorityOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Filter by Priority"
          showClear
          class="min-w-[10rem] flex-1"
        />
        <Select
          v-model="filters.category"
          :options="categoryOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Filter by Category"
          showClear
          class="min-w-40 flex-1"
        />
        <Button
          label="Clear Filters"
          severity="secondary"
          text
          icon="pi pi-filter-slash"
          class="text-neutral-600"
          @click="clearFilters"
        />
      </div>
    </div>

    <div v-if="loading" class="flex min-h-48 flex-1 items-center justify-center py-12">
      <ProgressSpinner strokeWidth="3" class="text-neutral-400" />
    </div>

    <Message v-else-if="error" severity="error" :closable="false" class="border-0 bg-transparent p-0">
      Failed to load tickets.
    </Message>

    <Message v-else-if="filteredTickets.length === 0" severity="info" :closable="false" class="border-0 bg-transparent p-0">
      No tickets match your current filters.
    </Message>

    <section v-else class="bento-surface admin-tickets-table-bento overflow-hidden rounded-[1.125rem]">
      <DataTable
        class="admin-bento-table"
        :value="filteredTickets"
        paginator
        :rows="10"
        :rowsPerPageOptions="[5, 10, 25]"
        tableStyle="min-width: 50rem"
      >
        <Column field="id" header="ID" style="width: 5%" />

        <Column field="subject" header="Subject" style="width: 25%">
          <template #body="{ data }">
            <span class="font-medium">{{ data.subject }}</span>
            <br />
            <small class="text-color-secondary">{{ data.requester.email }}</small>
          </template>
        </Column>

        <Column field="category" header="Category" style="width: 10%">
          <template #body="{ data }">
            <Tag :value="titleCaseLabel(data.category)" severity="secondary" class="border-0" />
          </template>
        </Column>

        <Column field="priority" header="Priority" style="width: 10%">
          <template #body="{ data }">
            <Tag
              :value="titleCaseLabel(data.priority)"
              :severity="getPrioritySeverity(data.priority)"
              class="border-0"
              :class="priorityTagClass(data.priority)"
            />
          </template>
        </Column>

        <Column field="status" header="Status" style="width: 12%">
          <template #body="{ data }">
            <Tag
              :value="titleCaseLabel(data.status)"
              severity="secondary"
              class="border-0"
              :class="statusTagClass(data.status)"
            />
          </template>
        </Column>

        <Column field="assignedTo" header="Assigned To" style="width: 15%">
          <template #body="{ data }">
            <span v-if="data.assignedTo">{{ data.assignedTo }}</span>
            <span v-else class="text-color-secondary">Unassigned</span>
          </template>
        </Column>

        <Column field="createdAt" header="Created" style="width: 10%">
          <template #body="{ data }">
            {{ formatDate(data.createdAt) }}
          </template>
        </Column>

        <Column header="Actions" style="width: 13%">
          <template #body="{ data }">
            <div class="flex gap-2">
              <Button
                icon="pi pi-pencil"
                rounded
                outlined
                size="small"
                @click="openEditDialog(data)"
              />
              <Button
                icon="pi pi-trash"
                rounded
                outlined
                severity="danger"
                size="small"
                @click="confirmDelete(data)"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </section>

    <Dialog
      v-model:visible="editDialog.visible"
      :header="`Edit Ticket #${editDialog.ticket?.id}`"
      modal
      style="width: 500px"
    >
      <form
        v-if="editDialog.ticket"
        class="mt-2 flex flex-col gap-4"
        @submit.prevent="handleUpdate"
      >
        <div class="flex flex-col gap-2">
          <label class="bento-label" for="adm-status">Status</label>
          <Select
            id="adm-status"
            v-model="editDialog.form.status"
            :options="statusOptions.filter(s => s.value)"
            optionLabel="label"
            optionValue="value"
            class="w-full"
          />
        </div>

        <div class="flex flex-col gap-2">
          <label class="bento-label" for="adm-priority">Priority</label>
          <Select
            id="adm-priority"
            v-model="editDialog.form.priority"
            :options="priorityOptions.filter(p => p.value)"
            optionLabel="label"
            optionValue="value"
            class="w-full"
          />
        </div>

        <div class="flex flex-col gap-2">
          <label class="bento-label" for="adm-assigned">Assigned To</label>
          <InputText
            id="adm-assigned"
            v-model="editDialog.form.assignedTo"
            placeholder="Support staff name"
            class="w-full"
          />
        </div>

        <Message v-if="serverError" severity="error" :closable="false">
          {{ serverError }}
        </Message>

        <div class="flex justify-end gap-2">
          <Button label="Cancel" severity="secondary" text @click="editDialog.visible = false" />
          <Button
            type="submit"
            label="Save Changes"
            icon="pi pi-check"
            rounded
            class="border-0 bg-neutral-900 text-white hover:bg-neutral-800"
            :loading="updateLoading"
          />
        </div>
      </form>
    </Dialog>

    <ConfirmDialog />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuery, useMutation } from '@vue/apollo-composable'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import Button from 'primevue/button'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import Dialog from 'primevue/dialog'
import Select from 'primevue/select'
import InputText from 'primevue/inputtext'
import Tag from 'primevue/tag'
import Message from 'primevue/message'
import ProgressSpinner from 'primevue/progressspinner'
import ConfirmDialog from 'primevue/confirmdialog'
import { GET_TICKETS } from '../../graphql/queries'
import { UPDATE_TICKET, DELETE_TICKET } from '../../graphql/mutations'
import {
  titleCaseLabel,
  statusTagClass,
  priorityTagClass,
  getPrioritySeverity,
} from '@/utils/ticketLabels.js'

const toast = useToast()
const confirm = useConfirm()
const serverError = ref('')

const { result, loading, error } = useQuery(GET_TICKETS, null, {
  fetchPolicy: 'network-only',
})

const tickets = computed(() => result.value?.tickets ?? [])

const filters = ref({
  status: null,
  priority: null,
  category: null,
})

const statusOptions = [
  { label: 'Open', value: 'open' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Resolved', value: 'resolved' },
  { label: 'Closed', value: 'closed' },
]

const priorityOptions = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
  { label: 'Critical', value: 'critical' },
]

const categoryOptions = [
  { label: 'General', value: 'general' },
  { label: 'Technical', value: 'technical' },
  { label: 'Billing', value: 'billing' },
  { label: 'Other', value: 'other' },
]

const filteredTickets = computed(() => {
  return tickets.value.filter((ticket) => {
    if (filters.value.status && ticket.status !== filters.value.status) return false
    if (filters.value.priority && ticket.priority !== filters.value.priority) return false
    if (filters.value.category && ticket.category !== filters.value.category) return false
    return true
  })
})

function clearFilters() {
  filters.value = { status: null, priority: null, category: null }
}

const editDialog = ref({
  visible: false,
  ticket: null,
  form: {
    status: '',
    priority: '',
    assignedTo: '',
  },
})

function openEditDialog(ticket) {
  editDialog.value = {
    visible: true,
    ticket,
    form: {
      status: ticket.status,
      priority: ticket.priority,
      assignedTo: ticket.assignedTo || '',
    },
  }
}

const { mutate: updateTicket, loading: updateLoading } = useMutation(UPDATE_TICKET, {
  refetchQueries: [{ query: GET_TICKETS }],
})

async function handleUpdate() {
  serverError.value = ''
  try {
    const t = editDialog.value.ticket
    const f = editDialog.value.form
    const result = await updateTicket({
      id: t.id,
      subject: t.subject,
      description: t.description,
      category: t.category,
      priority: f.priority,
      status: f.status,
      assignedTo: f.assignedTo ?? '',
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

    editDialog.value.visible = false
  } catch {
    serverError.value = 'Something went wrong.'
  }
}

const { mutate: deleteTicket } = useMutation(DELETE_TICKET, {
  refetchQueries: [{ query: GET_TICKETS }],
})

function confirmDelete(ticket) {
  confirm.require({
    message: `Are you sure you want to delete ticket #${ticket.id}?`,
    header: 'Delete Ticket',
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Cancel',
    acceptLabel: 'Delete',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        const result = await deleteTicket({ id: ticket.id })
        const { errors: apiErrors } = result.data.deleteTicket

        if (apiErrors && apiErrors.length > 0) {
          toast.add({ severity: 'error', summary: 'Error', detail: apiErrors[0], life: 3000 })
          return
        }

        toast.add({
          severity: 'success',
          summary: 'Deleted',
          detail: `Ticket #${ticket.id} has been deleted`,
          life: 3000,
        })
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

<style scoped>
.admin-tickets-table-bento {
  padding: 0;
}

:deep(.admin-bento-table.p-datatable) {
  border: none;
  box-shadow: none;
  background: transparent;
  border-radius: 1.125rem;
  overflow: hidden;
}

:deep(.admin-bento-table .p-datatable-table) {
  border-collapse: separate;
  border-spacing: 0;
}

:deep(.admin-bento-table .p-datatable-thead > tr > th) {
  border: none;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  background: transparent;
  color: #737373;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 0.875rem 1rem;
}

:deep(.admin-bento-table .p-datatable-tbody > tr) {
  background: transparent;
}

:deep(.admin-bento-table .p-datatable-tbody > tr > td) {
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  padding: 0.75rem 1rem;
}

:deep(.admin-bento-table .p-datatable-tbody > tr:last-child > td) {
  border-bottom: none;
}

:deep(.admin-bento-table .p-paginator) {
  border: none;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 0;
  background: transparent;
  padding: 0.5rem 0.75rem;
}
</style>
