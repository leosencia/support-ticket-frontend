<template>
    <div class="flex align-items-center justify-content-center min-h-screen">
      <Card class="w-full" style="max-width: 420px">
        <template #title>
          <div class="text-center">
            <h2 class="text-2xl font-bold m-0">Create Account</h2>
            <p class="text-color-secondary mt-1">Register to start submitting support tickets</p>
          </div>
        </template>
  
        <template #content>
          <form @submit.prevent="handleRegister" class="flex flex-column gap-4">
  
            <div class="flex flex-column gap-2">
              <label for="email" class="font-medium">Email</label>
              <InputText
                id="email"
                v-model="email"
                type="email"
                placeholder="you@example.com"
                class="w-full"
                :class="{ 'p-invalid': errors.email }"
              />
              <small class="p-error">{{ errors.email }}</small>
            </div>
  
            <div class="flex flex-column gap-2">
              <label for="password" class="font-medium">Password</label>
              <Password
                id="password"
                v-model="password"
                placeholder="At least 6 characters"
                class="w-full"
                :feedback="false"
                toggleMask
                inputClass="w-full"
                :class="{ 'p-invalid': errors.password }"
              />
              <small class="p-error">{{ errors.password }}</small>
            </div>
  
            <div class="flex flex-column gap-2">
              <label for="passwordConfirmation" class="font-medium">
                Confirm Password
              </label>
              <Password
                id="passwordConfirmation"
                v-model="passwordConfirmation"
                placeholder="Repeat your password"
                class="w-full"
                :feedback="false"
                toggleMask
                inputClass="w-full"
                :class="{ 'p-invalid': errors.passwordConfirmation }"
              />
              <small class="p-error">{{ errors.passwordConfirmation }}</small>
            </div>
  
            <Message v-if="serverError" severity="error" :closable="false">
              {{ serverError }}
            </Message>
  
            <Button
              type="submit"
              label="Create Account"
              class="w-full"
              :loading="loading"
            />
  
            <div class="text-center">
              <span class="text-color-secondary">Already have an account? </span>
              <router-link to="/login" class="text-primary font-medium">
                Sign in
              </router-link>
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
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Message from 'primevue/message'
import { useAuthStore } from '../../stores/auth'
import { REGISTER } from '../../graphql/mutations'

const router = useRouter()
const authStore = useAuthStore()

// Form state
const email = ref('')
const password = ref('')
const passwordConfirmation = ref('')
const errors = ref({})
const serverError = ref('')

// Apollo mutation
const { mutate: registerMutate, loading } = useMutation(REGISTER)
  
// Validation
function validate() {
    errors.value = {}
  
    if (!email.value) {
      errors.value.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(email.value)) {
      errors.value.email = 'Please enter a valid email'
    }
  
    if (!password.value) {
      errors.value.password = 'Password is required'
    } else if (password.value.length < 6) {
      errors.value.password = 'Password must be at least 6 characters'
    }
  
    if (!passwordConfirmation.value) {
      errors.value.passwordConfirmation = 'Please confirm your password'
    } else if (passwordConfirmation.value !== password.value) {
      errors.value.passwordConfirmation = 'Passwords do not match'
    }
  
    return Object.keys(errors.value).length === 0
}
  
// Submit handler
async function handleRegister() {
    serverError.value = ''
  
    if (!validate()) return
  
    try {
      const result = await registerMutate({
        email: email.value,
        password: password.value,
        passwordConfirmation: passwordConfirmation.value
      })
  
      const { token, user, errors: apiErrors } = result.data.register
  
      if (apiErrors && apiErrors.length > 0) {
        serverError.value = apiErrors[0]
        return
      }
  
      authStore.setAuth(user, token)
      router.push('/tickets')
  
    } catch (e) {
      serverError.value = 'Something went wrong. Please try again.'
    }
}
</script>