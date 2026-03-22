<template>
    <div class="p-4">
      <div class="mb-4">
        <h1 class="text-2xl font-bold m-0">Manage Tickets</h1>
        <p class="text-color-secondary mt-1">View, filter, assign and update all tickets</p>
      </div>
  
      <!-- Filters -->
      <Card class="mb-4">
        <template #content>
          <div class="flex gap-3 flex-wrap">
            <Select
              v-model="filters.status"
              :options="statusOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Filter by Status"
              showClear
              class="flex-1"
              style="min-width: 160px"
            />
            <Select
              v-model="filters.priority"
              :options="priorityOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Filter by Priority"
              showClear
              class="flex-1"
              style="min-width: 160px"
            />
            <Select
              v-model="filters.category"
              :options="categoryOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Filter by Category"
              showClear
              class="flex-1"
              style="min-width: 160px"
            />
            <Button
              label="Clear Filters"
              severity="secondary"
              outlined
              icon="pi pi-filter-slash"
              @click="clearFilters"
            />
          </div>
        </template>
      </Card>
  
      <!-- Loading -->
      <div v-if="loading" class="flex justify-content-center p-6">
        <ProgressSpinner />
      </div>
  
      <!-- Error -->
      <Message v-else-if="error" severity="error" :closable="false">
        Failed to load tickets.
      </Message>
  
      <!-- Empty -->
      <Message v-else-if="filteredTickets.length === 0" severity="info" :closable="false">
        No tickets match your current filters.
      </Message>
  
      <!-- Tickets Table -->
      <Card v-else>
        <template #content>
          <DataTable
            :value="filteredTickets"
            paginator
            :rows="10"
            :rowsPerPageOptions="[5, 10, 25]"
            tableStyle="min-width: 50rem"
            stripedRows
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
                <Tag :value="data.category" severity="secondary" />
              </template>
            </Column>
  
            <Column field="priority" header="Priority" style="width: 10%">
              <template #body="{ data }">
                <Tag
                  :value="data.priority"
                  :severity="getPrioritySeverity(data.priority)"
                />
              </template>
            </Column>
  
            <Column field="status" header="Status" style="width: 12%">
              <template #body="{ data }">
                <Tag
                  :value="data.status.replace('_', ' ')"
                  :severity="getStatusSeverity(data.status)"
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
        </template>
      </Card>
  
      <!-- Edit Dialog -->
      <Dialog
        v-model:visible="editDialog.visible"
        :header="`Edit Ticket #${editDialog.ticket?.id}`"
        modal
        style="width: 500px"
      >
        <form
          v-if="editDialog.ticket"
          @submit.prevent="handleUpdate"
          class="flex flex-column gap-4 mt-2"
        >
  
          <div class="flex flex-column gap-2">
            <label class="font-medium">Status</label>
            <Select
              v-model="editDialog.form.status"
              :options="statusOptions.filter(s => s.value)"
              optionLabel="label"
              optionValue="value"
              class="w-full"
            />
          </div>
  
          <div class="flex flex-column gap-2">
            <label class="font-medium">Priority</label>
            <Select
              v-model="editDialog.form.priority"
              :options="priorityOptions.filter(p => p.value)"
              optionLabel="label"
              optionValue="value"
              class="w-full"
            />
          </div>
  
          <div class="flex flex-column gap-2">
            <label class="font-medium">Assigned To</label>
            <InputText
              v-model="editDialog.form.assignedTo"
              placeholder="Support staff name"
              class="w-full"
            />
          </div>
  
          <Message v-if="serverError" severity="error" :closable="false">
            {{ serverError }}
          </Message>
  
          <div class="flex gap-2 justify-content-end">
            <Button
              label="Cancel"
              severity="secondary"
              outlined
              @click="editDialog.visible = false"
            />
            <Button
              type="submit"
              label="Save Changes"
              icon="pi pi-check"
              :loading="updateLoading"
            />
          </div>
  
        </form>
      </Dialog>
  
      <ConfirmDialog />
      <Toast />
  
    </div>
  </template>
  
<script setup>
import { ref, computed } from 'vue'
import { useQuery, useMutation } from '@vue/apollo-composable'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import Card from 'primevue/card'
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
import Toast from 'primevue/toast'
import { GET_TICKETS } from '../../graphql/queries'
import { UPDATE_TICKET, DELETE_TICKET } from '../../graphql/mutations'

const toast = useToast()
const confirm = useConfirm()
const serverError = ref('')
  
// Fetch all tickets
const { result, loading, error } = useQuery(GET_TICKETS, null, {
    fetchPolicy: 'network-only'
})
  
const tickets = computed(() => result.value?.tickets ?? [])
  
// Filters
const filters = ref({
    status: null,
    priority: null,
    category: null
})
  
const statusOptions = [
    { label: 'Open', value: 'open' },
    { label: 'In Progress', value: 'in_progress' },
    { label: 'Resolved', value: 'resolved' },
    { label: 'Closed', value: 'closed' }
]
  
const priorityOptions = [
    { label: 'Low', value: 'low' },
    { label: 'Medium', value: 'medium' },
    { label: 'High', value: 'high' },
    { label: 'Critical', value: 'critical' }
]
  
const categoryOptions = [
    { label: 'General', value: 'general' },
    { label: 'Technical', value: 'technical' },
    { label: 'Billing', value: 'billing' },
    { label: 'Other', value: 'other' }
]
  
const filteredTickets = computed(() => {
    return tickets.value.filter(ticket => {
      if (filters.value.status && ticket.status !== filters.value.status) return false
      if (filters.value.priority && ticket.priority !== filters.value.priority) return false
      if (filters.value.category && ticket.category !== filters.value.category) return false
      return true
    })
})

function clearFilters() {
    filters.value = { status: null, priority: null, category: null }
}
  
// Edit dialog state
const editDialog = ref({
    visible: false,
    ticket: null,
    form: {
      status: '',
      priority: '',
      assignedTo: ''
    }
})
  
function openEditDialog(ticket) {
    editDialog.value = {
      visible: true,
      ticket,
      form: {
        status: ticket.status,
        priority: ticket.priority,
        assignedTo: ticket.assignedTo || ''
      }
    }
}
  
  // Update mutation
const { mutate: updateTicket, loading: updateLoading } = useMutation(UPDATE_TICKET, {
    refetchQueries: [{ query: GET_TICKETS }]
})
  
async function handleUpdate() {
    serverError.value = ''
    try {
      const result = await updateTicket({
        id: editDialog.value.ticket.id,
        status: editDialog.value.form.status,
        priority: editDialog.value.form.priority,
        assignedTo: editDialog.value.form.assignedTo
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
        life: 3000
      })
  
      editDialog.value.visible = false
  
    } catch (e) {
      serverError.value = 'Something went wrong.'
    }
  }
  
  // Delete mutation
  const { mutate: deleteTicket } = useMutation(DELETE_TICKET, {
    refetchQueries: [{ query: GET_TICKETS }]
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
            life: 3000
          })
  
        } catch (e) {
          toast.add({ severity: 'error', summary: 'Error', detail: 'Something went wrong', life: 3000 })
        }
      }
    })
  }
  
  function getStatusSeverity(status) {
    const map = { open: 'info', in_progress: 'warning', resolved: 'success', closed: 'secondary' }
    return map[status] || 'secondary'
  }
  
  function getPrioritySeverity(priority) {
    const map = { low: 'secondary', medium: 'info', high: 'warning', critical: 'danger' }
    return map[priority] || 'secondary'
  }
  
  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    })
}
</script>