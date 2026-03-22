<template>
    <div class="p-4" style="max-width: 700px; margin: 0 auto">
  
      <div class="flex align-items-center gap-2 mb-4">
        <Button
          icon="pi pi-arrow-left"
          text
          rounded
          @click="router.push('/tickets')"
        />
        <h1 class="text-2xl font-bold m-0">Ticket Details</h1>
      </div>
  
      <!-- Loading -->
      <div v-if="loading" class="flex justify-content-center p-6">
        <ProgressSpinner />
      </div>
  
      <!-- Error -->
      <Message v-else-if="error" severity="error" :closable="false">
        Failed to load ticket.
      </Message>
  
      <!-- Ticket not found -->
      <Message v-else-if="!ticket" severity="warn" :closable="false">
        Ticket not found or you don't have permission to view it.
      </Message>
  
      <!-- Ticket content -->
      <div v-else class="flex flex-column gap-4">
  
        <!-- Header card -->
        <Card>
          <template #content>
            <div class="flex justify-content-between align-items-start">
              <div class="flex flex-column gap-2">
                <h2 class="text-xl font-bold m-0">{{ ticket.subject }}</h2>
                <div class="flex gap-2">
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
  
        <!-- Description card -->
        <Card>
          <template #title>Description</template>
          <template #content>
            <p class="m-0 line-height-3">{{ ticket.description }}</p>
          </template>
        </Card>
  
        <!-- Edit form — only shown if ticket is open -->
        <Card v-if="ticket.status === 'open' && !showEditForm">
          <template #content>
            <div class="flex gap-2">
              <Button
                label="Edit Ticket"
                icon="pi pi-pencil"
                outlined
                @click="openEditForm"
              />
              <Button
                label="Cancel Ticket"
                icon="pi pi-times"
                severity="danger"
                outlined
                :loading="deleteLoading"
                @click="confirmCancel"
              />
            </div>
          </template>
        </Card>
  
        <!-- Edit form -->
        <Card v-if="showEditForm">
          <template #title>Edit Ticket</template>
          <template #content>
            <form @submit.prevent="handleUpdate" class="flex flex-column gap-4">
  
              <div class="flex flex-column gap-2">
                <label class="font-medium">Subject</label>
                <InputText v-model="editForm.subject" class="w-full" />
              </div>
  
              <div class="flex gap-3">
                <div class="flex flex-column gap-2 flex-1">
                  <label class="font-medium">Category</label>
                  <Select
                    v-model="editForm.category"
                    :options="categoryOptions"
                    optionLabel="label"
                    optionValue="value"
                    class="w-full"
                  />
                </div>
                <div class="flex flex-column gap-2 flex-1">
                  <label class="font-medium">Priority</label>
                  <Select
                    v-model="editForm.priority"
                    :options="priorityOptions"
                    optionLabel="label"
                    optionValue="value"
                    class="w-full"
                  />
                </div>
              </div>
  
              <div class="flex flex-column gap-2">
                <label class="font-medium">Description</label>
                <Textarea v-model="editForm.description" rows="4" class="w-full" />
              </div>
  
              <Message v-if="serverError" severity="error" :closable="false">
                {{ serverError }}
              </Message>
  
              <div class="flex gap-2 justify-content-end">
                <Button
                  label="Discard"
                  severity="secondary"
                  outlined
                  @click="showEditForm = false"
                />
                <Button
                  type="submit"
                  label="Save Changes"
                  icon="pi pi-check"
                  :loading="updateLoading"
                />
              </div>
  
            </form>
          </template>
        </Card>
  
      </div>
  
      <ConfirmDialog />
  
    </div>
</template>
  
<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuery, useMutation } from '@vue/apollo-composable'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import Card from 'primevue/card'
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
  
const router = useRouter()
const route = useRoute()
const toast = useToast()
const confirm = useConfirm()
  
// Get ticket ID from URL
const ticketId = computed(() => route.params.id)
  
// Fetch ticket
const { result, loading, error } = useQuery(GET_TICKET, { id: ticketId })
const ticket = computed(() => result.value?.ticket ?? null)
  
// Edit form state
const showEditForm = ref(false)
const serverError = ref('')
const editForm = ref({})
  
const categoryOptions = [
    { label: 'General', value: 'general' },
    { label: 'Technical', value: 'technical' },
    { label: 'Billing', value: 'billing' },
    { label: 'Other', value: 'other' }
]
  
const priorityOptions = [
    { label: 'Low', value: 'low' },
    { label: 'Medium', value: 'medium' },
    { label: 'High', value: 'high' },
    { label: 'Critical', value: 'critical' }
]
  
function openEditForm() {
    editForm.value = {
      subject: ticket.value.subject,
      description: ticket.value.description,
      category: ticket.value.category,
      priority: ticket.value.priority
    }
    showEditForm.value = true
}
  
// Update mutation
const { mutate: updateTicket, loading: updateLoading } = useMutation(UPDATE_TICKET, {
    refetchQueries: [{query: GET_TICKET, variables: {id: ticketId.value}}]
})
  
async function handleUpdate() {
    serverError.value = ''
    try {
      const result = await updateTicket({
        id: ticketId.value,
        ...editForm.value
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
  
      showEditForm.value = false
  
    } catch (e) {
      serverError.value = 'Something went wrong.'
    }
}
  
// Delete mutation
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
                    life: 3000
                })
    
                router.push('/tickets')
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