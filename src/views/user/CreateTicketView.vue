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
        <h1 class="m-0 text-xl font-medium tracking-tight text-neutral-900 md:text-2xl">New Support Ticket</h1>
        <p class="bento-label mt-1.5 m-0 max-w-xl leading-relaxed">Fill in the details below</p>
      </div>
    </header>

    <section class="bento-surface p-5 md:p-6">
      <form class="flex flex-col gap-5" @submit.prevent="handleSubmit">
        <div class="flex flex-col gap-2">
          <label class="bento-label" for="subject">Subject <span class="text-red-500">*</span></label>
          <InputText
            id="subject"
            v-model="form.subject"
            placeholder="Brief summary of your issue"
            class="w-full rounded-xl border border-neutral-200/80 bg-white"
            :class="{ 'p-invalid': errors.subject }"
          />
          <small class="p-error">{{ errors.subject }}</small>
        </div>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div class="flex flex-col gap-2">
            <label class="bento-label" for="category">Category <span class="text-red-500">*</span></label>
            <Select
              id="category"
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
          <div class="flex flex-col gap-2">
            <label class="bento-label" for="priority">Priority <span class="text-red-500">*</span></label>
            <Select
              id="priority"
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

        <div class="flex flex-col gap-2">
          <label class="bento-label" for="description">Description <span class="text-red-500">*</span></label>
          <Textarea
            id="description"
            v-model="form.description"
            placeholder="Describe your issue in detail..."
            rows="5"
            class="w-full rounded-xl border border-neutral-200/80 bg-white"
            :class="{ 'p-invalid': errors.description }"
          />
          <small class="p-error">{{ errors.description }}</small>
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
          <Button
            label="Cancel"
            severity="secondary"
            text
            class="text-neutral-600"
            @click="router.push('/tickets')"
          />
          <Button
            type="submit"
            label="Submit Ticket"
            icon="pi pi-send"
            rounded
            :loading="loading"
            class="border-0 bg-neutral-900 px-5 text-white shadow-sm hover:bg-neutral-800"
          />
        </div>
      </form>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMutation } from '@vue/apollo-composable'
import { useToast } from 'primevue/usetoast'
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
  description: '',
})

const errors = ref({})
const serverError = ref('')

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

const { mutate: createTicket, loading } = useMutation(CREATE_TICKET, {
  refetchQueries: [{ query: GET_TICKETS }],
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
      priority: form.value.priority,
    })

    const { errors: apiErrors } = result.data.createTicket

    if (apiErrors && apiErrors.length > 0) {
      serverError.value = apiErrors[0]
      return
    }

    toast.add({
      severity: 'success',
      summary: 'Ticket Submitted',
      detail: 'Your support ticket has been created!',
      life: 3000,
    })

    router.push('/tickets')
  } catch {
    serverError.value = 'Something went wrong. Please try again.'
  }
}
</script>
