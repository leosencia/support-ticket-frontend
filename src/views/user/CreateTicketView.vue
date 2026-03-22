<template>
    <div class="p-4" style="max-width: 700px; margin: 0 auto">
      <div class="flex align-items-center gap-2 mb-4">
        <Button
          icon="pi pi-arrow-left"
          text
          rounded
          @click="router.push('/tickets')"
        />
        <div>
          <h1 class="text-2xl font-bold m-0">New Support Ticket</h1>
          <p class="text-color-secondary mt-1">Fill in the details below</p>
        </div>
      </div>
  
      <Card>
        <template #content>
          <form @submit.prevent="handleSubmit" class="flex flex-column gap-4">
  
            <div class="flex flex-column gap-2">
              <label class="font-medium">Subject <span class="text-red-500">*</span></label>
              <InputText
                v-model="form.subject"
                placeholder="Brief summary of your issue"
                class="w-full"
                :class="{ 'p-invalid': errors.subject }"
              />
              <small class="p-error">{{ errors.subject }}</small>
            </div>
  
            <div class="flex gap-3">
              <div class="flex flex-column gap-2 flex-1">
                <label class="font-medium">Category <span class="text-red-500">*</span></label>
                <Select
                  v-model="form.category"
                  :options="categoryOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select category"
                  class="w-full"
                  :class="{ 'p-invalid': errors.category }"
                />
                <small class="p-error">{{ errors.category }}</small>
              </div>
  
              <div class="flex flex-column gap-2 flex-1">
                <label class="font-medium">Priority <span class="text-red-500">*</span></label>
                <Select
                  v-model="form.priority"
                  :options="priorityOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select priority"
                  class="w-full"
                  :class="{ 'p-invalid': errors.priority }"
                />
                <small class="p-error">{{ errors.priority }}</small>
              </div>
            </div>
  
            <div class="flex flex-column gap-2">
              <label class="font-medium">Description <span class="text-red-500">*</span></label>
              <Textarea
                v-model="form.description"
                placeholder="Describe your issue in detail..."
                rows="5"
                class="w-full"
                :class="{ 'p-invalid': errors.description }"
              />
              <small class="p-error">{{ errors.description }}</small>
            </div>
  
            <Message v-if="serverError" severity="error" :closable="false">
              {{ serverError }}
            </Message>
  
            <div class="flex gap-2 justify-content-end">
              <Button
                label="Cancel"
                severity="secondary"
                outlined
                @click="router.push('/tickets')"
              />
              <Button
                type="submit"
                label="Submit Ticket"
                icon="pi pi-send"
                :loading="loading"
              />
            </div>
  
          </form>
        </template>
      </Card>
    </div>
  </template>
  
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMutation } from '@vue/apollo-composable'
import { useToast } from 'primevue/usetoast'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import Button from 'primevue/button'
import Message from 'primevue/message'
import { CREATE_TICKET } from '../../graphql/mutations'
import { GET_TICKETS } from '@/graphql/queries'

const router = useRouter()
const toast = useToast()
  
const form = ref({
    subject: '',
    category: null,
    priority: null,
    description: ''
})
  
const errors = ref({})
const serverError = ref('')

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
  
const { mutate: createTicket, loading } = useMutation(CREATE_TICKET, {
    refetchQueries: [{query: GET_TICKETS}]
})
  
function validate() {
    errors.value = {}
    if (!form.value.subject) errors.value.subject = 'Subject is required'
    if (!form.value.category) errors.value.category = 'Category is required'
    if (!form.value.priority) errors.value.priority = 'Priority is required'
    if (!form.value.description) errors.value.description = 'Description is required'
    return Object.keys(errors.value).length === 0
}
  
async function handleSubmit() {
    serverError.value = ''
    if (!validate()) return
  
    try {
      const result = await createTicket({
        subject: form.value.subject,
        description: form.value.description,
        category: form.value.category,
        priority: form.value.priority
      })
  
      const { ticket, errors: apiErrors } = result.data.createTicket
  
      if (apiErrors && apiErrors.length > 0) {
        serverError.value = apiErrors[0]
        return
      }
  
      toast.add({
        severity: 'success',
        summary: 'Ticket Submitted',
        detail: 'Your support ticket has been created!',
        life: 3000
      })
  
      router.push('/tickets')
  
    } catch (e) {
      serverError.value = 'Something went wrong. Please try again.'
    }
}
</script>